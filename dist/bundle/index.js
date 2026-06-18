import { z } from 'zod';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// src/schema.ts
var ModalitySchema = z.enum(["text", "image", "audio", "video", "pdf"]);
var CapabilitySchema = z.enum([
  "tools",
  "vision",
  "reasoning",
  "streaming",
  "json_mode",
  "system_prompt",
  "temperature",
  "attachment",
  "structured_output",
  "open_weights"
]);
var PricingSchema = z.object({
  input: z.number().nonnegative(),
  output: z.number().nonnegative(),
  cacheRead: z.number().nonnegative().optional(),
  cacheWrite: z.number().nonnegative().optional(),
  inputAudio: z.number().nonnegative().optional(),
  currency: z.literal("USD").default("USD"),
  per: z.literal(1e6).default(1e6),
  tiers: z.array(
    z.object({
      input: z.number().nonnegative(),
      output: z.number().nonnegative(),
      contextThreshold: z.number().int().positive()
    })
  ).optional(),
  contextOverThreshold: z.object({
    input: z.number().nonnegative(),
    output: z.number().nonnegative(),
    contextThreshold: z.number().int().positive()
  }).optional()
});
var ModelMetaSchema = z.object({
  id: z.string(),
  provider: z.string(),
  providerName: z.string(),
  displayName: z.string(),
  family: z.string().nullable(),
  releaseDate: z.string().nullable(),
  lastUpdated: z.string().nullable(),
  knowledgeCutoff: z.string().nullable(),
  contextWindow: z.number().int().nonnegative(),
  maxOutputTokens: z.number().int().nonnegative().nullable(),
  capabilities: z.object({
    tools: z.boolean().default(false),
    vision: z.boolean().default(false),
    reasoning: z.boolean().default(false),
    streaming: z.boolean().default(true),
    json_mode: z.boolean().default(false),
    system_prompt: z.boolean().default(true),
    temperature: z.boolean().default(true),
    attachment: z.boolean().default(false),
    structured_output: z.boolean().default(false),
    open_weights: z.boolean().default(false)
  }),
  modalities: z.object({
    input: z.array(ModalitySchema),
    output: z.array(ModalitySchema)
  }),
  pricing: PricingSchema.nullable(),
  status: z.enum(["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]).default("active"),
  deprecationDate: z.string().nullable(),
  replacedBy: z.string().nullable(),
  aliases: z.array(z.string()).default([]),
  isAggregator: z.boolean().default(false),
  sources: z.array(z.string()).default([])
});
var ProviderMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  env: z.array(z.string()).default([]),
  npm: z.string().nullable(),
  api: z.string().nullable(),
  doc: z.string().nullable(),
  modelCount: z.number().int().nonnegative(),
  isAggregator: z.boolean()
});
var CatalogSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  source: z.string(),
  providerCount: z.number().int().nonnegative(),
  modelCount: z.number().int().nonnegative(),
  providers: z.array(ProviderMetaSchema),
  models: z.array(ModelMetaSchema)
});

// src/normalizer.ts
var ALL_MODALITIES = ["text", "image", "audio", "video", "pdf"];
function filterModalities(input) {
  if (!input) return ["text"];
  const out = [];
  for (const m of input) {
    if (ALL_MODALITIES.includes(m)) {
      out.push(m);
    }
  }
  return out.length > 0 ? out : ["text"];
}
function cleanDisplayName(raw) {
  const m = raw.match(/^(.*?)\s*\(latest\)\s*$/i);
  if (m && m[1]) return { name: m[1].trim(), alias: raw.trim() };
  return { name: raw.trim(), alias: null };
}
function buildPricing(cost) {
  if (!cost || typeof cost.input !== "number" || typeof cost.output !== "number") return null;
  const out = {
    input: cost.input,
    output: cost.output,
    currency: "USD",
    per: 1e6
  };
  if (typeof cost.cache_read === "number") out.cacheRead = cost.cache_read;
  if (typeof cost.cache_write === "number") out.cacheWrite = cost.cache_write;
  if (typeof cost.input_audio === "number") out.inputAudio = cost.input_audio;
  if (Array.isArray(cost.tiers)) {
    out.tiers = cost.tiers.filter((t) => typeof t.tier?.size === "number").map((t) => ({
      input: t.input,
      output: t.output,
      contextThreshold: t.tier.size
    }));
  }
  const over = cost.context_over_200k;
  if (over && typeof over.input === "number" && typeof over.output === "number") {
    out.contextOverThreshold = {
      input: over.input,
      output: over.output,
      contextThreshold: 2e5
    };
  }
  return out;
}
function deriveStatus(m) {
  if (m.status) return m.status;
  if (m.experimental) return "experimental";
  return "active";
}
function normalizeModelsDev(raw) {
  if (!raw || typeof raw !== "object") throw new Error("models.dev JSON: not an object");
  const root = raw;
  const models = [];
  const providers = [];
  for (const [providerId, prov] of Object.entries(root)) {
    if (!prov || typeof prov !== "object" || !prov.models) continue;
    const isAggregator = Boolean(prov.api);
    const providerName = prov.name || providerId;
    const modelIds = Object.keys(prov.models);
    providers.push({
      id: providerId,
      name: providerName,
      env: prov.env ?? [],
      npm: prov.npm ?? null,
      api: prov.api ?? null,
      doc: prov.doc ?? null,
      modelCount: modelIds.length,
      isAggregator
    });
    for (const [mid, m] of Object.entries(prov.models)) {
      const { name: displayName, alias } = cleanDisplayName(m.name);
      const aliases = [];
      if (alias && alias !== displayName) aliases.push(alias);
      const meta = ModelMetaSchema.parse({
        id: mid,
        provider: providerId,
        providerName,
        displayName,
        family: m.family ?? null,
        releaseDate: m.release_date ?? null,
        lastUpdated: m.last_updated ?? null,
        knowledgeCutoff: m.knowledge ?? null,
        contextWindow: m.limit?.context ?? 0,
        maxOutputTokens: m.limit?.output ?? null,
        capabilities: {
          tools: Boolean(m.tool_call),
          vision: filterModalities(m.modalities?.input).includes("image") || Boolean(m.attachment),
          reasoning: Boolean(m.reasoning),
          streaming: true,
          json_mode: Boolean(m.structured_output),
          system_prompt: true,
          temperature: m.temperature !== false,
          attachment: Boolean(m.attachment),
          structured_output: Boolean(m.structured_output),
          open_weights: Boolean(m.open_weights)
        },
        modalities: {
          input: filterModalities(m.modalities?.input),
          output: filterModalities(m.modalities?.output)
        },
        pricing: buildPricing(m.cost),
        status: deriveStatus(m),
        deprecationDate: null,
        replacedBy: null,
        aliases,
        isAggregator,
        sources: ["models.dev"]
      });
      models.push(meta);
    }
  }
  return { models, providers };
}
var DeprecationEntrySchema = z.object({
  id: z.string(),
  provider: z.string(),
  status: z.enum(["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]).optional(),
  deprecationDate: z.string().nullable().optional(),
  replacedBy: z.string().nullable().optional(),
  aliases: z.array(z.string()).optional(),
  displayName: z.string().optional()
});
var OverridesFileSchema = z.object({
  comments: z.string().optional(),
  deprecations: z.array(DeprecationEntrySchema).default([]),
  extraAliases: z.record(z.string(), z.record(z.string(), z.array(z.string()))).default({})
});
async function loadOverrides(path) {
  const p = path ?? resolve(process.cwd(), "overrides.json");
  try {
    const raw = await readFile(p, "utf-8");
    return OverridesFileSchema.parse(JSON.parse(raw));
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      return { deprecations: [], extraAliases: {} };
    }
    throw e;
  }
}
function applyOverrides(models, ov) {
  const depByKey = /* @__PURE__ */ new Map();
  for (const d of ov.deprecations) depByKey.set(`${d.provider}/${d.id}`, d);
  const aliasByProvider = /* @__PURE__ */ new Map();
  for (const prov of Object.keys(ov.extraAliases)) {
    const map = ov.extraAliases[prov];
    if (!map) continue;
    for (const id of Object.keys(map)) {
      const aliases = map[id];
      if (!aliases) continue;
      aliasByProvider.set(`${prov}/${id}`, aliases);
    }
  }
  return models.map((m) => {
    const key = `${m.provider}/${m.id}`;
    const dep = depByKey.get(key);
    const extraAliases = aliasByProvider.get(key);
    const next = { ...m };
    if (extraAliases) {
      const merged = /* @__PURE__ */ new Set([...m.aliases, ...extraAliases]);
      next.aliases = [...merged];
    }
    if (dep) {
      if (dep.status) next.status = dep.status;
      if (dep.deprecationDate !== void 0) next.deprecationDate = dep.deprecationDate;
      if (dep.replacedBy !== void 0) next.replacedBy = dep.replacedBy;
      if (dep.aliases) {
        const merged = /* @__PURE__ */ new Set([...next.aliases, ...dep.aliases]);
        next.aliases = [...merged];
      }
      if (dep.displayName) next.displayName = dep.displayName;
      next.sources = [...next.sources, "aio-overrides"];
    }
    return next;
  });
}

export { CapabilitySchema, CatalogSchema, ModalitySchema, ModelMetaSchema, PricingSchema, ProviderMetaSchema, applyOverrides, loadOverrides, normalizeModelsDev };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map