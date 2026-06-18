'use strict';

var zod = require('zod');
var promises = require('fs/promises');
var path = require('path');

// src/schema.ts
var ModalitySchema = zod.z.enum(["text", "image", "audio", "video", "pdf"]);
var CapabilitySchema = zod.z.enum([
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
var PricingSchema = zod.z.object({
  input: zod.z.number().nonnegative(),
  output: zod.z.number().nonnegative(),
  cacheRead: zod.z.number().nonnegative().optional(),
  cacheWrite: zod.z.number().nonnegative().optional(),
  inputAudio: zod.z.number().nonnegative().optional(),
  currency: zod.z.literal("USD").default("USD"),
  per: zod.z.literal(1e6).default(1e6),
  tiers: zod.z.array(
    zod.z.object({
      input: zod.z.number().nonnegative(),
      output: zod.z.number().nonnegative(),
      contextThreshold: zod.z.number().int().positive()
    })
  ).optional(),
  contextOverThreshold: zod.z.object({
    input: zod.z.number().nonnegative(),
    output: zod.z.number().nonnegative(),
    contextThreshold: zod.z.number().int().positive()
  }).optional()
});
var ModelMetaSchema = zod.z.object({
  id: zod.z.string(),
  provider: zod.z.string(),
  providerName: zod.z.string(),
  displayName: zod.z.string(),
  family: zod.z.string().nullable(),
  releaseDate: zod.z.string().nullable(),
  lastUpdated: zod.z.string().nullable(),
  knowledgeCutoff: zod.z.string().nullable(),
  contextWindow: zod.z.number().int().nonnegative(),
  maxOutputTokens: zod.z.number().int().nonnegative().nullable(),
  capabilities: zod.z.object({
    tools: zod.z.boolean().default(false),
    vision: zod.z.boolean().default(false),
    reasoning: zod.z.boolean().default(false),
    streaming: zod.z.boolean().default(true),
    json_mode: zod.z.boolean().default(false),
    system_prompt: zod.z.boolean().default(true),
    temperature: zod.z.boolean().default(true),
    attachment: zod.z.boolean().default(false),
    structured_output: zod.z.boolean().default(false),
    open_weights: zod.z.boolean().default(false)
  }),
  modalities: zod.z.object({
    input: zod.z.array(ModalitySchema),
    output: zod.z.array(ModalitySchema)
  }),
  pricing: PricingSchema.nullable(),
  status: zod.z.enum(["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]).default("active"),
  deprecationDate: zod.z.string().nullable(),
  replacedBy: zod.z.string().nullable(),
  aliases: zod.z.array(zod.z.string()).default([]),
  isAggregator: zod.z.boolean().default(false),
  sources: zod.z.array(zod.z.string()).default([])
});
var ProviderMetaSchema = zod.z.object({
  id: zod.z.string(),
  name: zod.z.string(),
  env: zod.z.array(zod.z.string()).default([]),
  npm: zod.z.string().nullable(),
  api: zod.z.string().nullable(),
  doc: zod.z.string().nullable(),
  modelCount: zod.z.number().int().nonnegative(),
  isAggregator: zod.z.boolean()
});
var CatalogSchema = zod.z.object({
  version: zod.z.string(),
  generatedAt: zod.z.string(),
  source: zod.z.string(),
  providerCount: zod.z.number().int().nonnegative(),
  modelCount: zod.z.number().int().nonnegative(),
  providers: zod.z.array(ProviderMetaSchema),
  models: zod.z.array(ModelMetaSchema)
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
var DeprecationEntrySchema = zod.z.object({
  id: zod.z.string(),
  provider: zod.z.string(),
  status: zod.z.enum(["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]).optional(),
  deprecationDate: zod.z.string().nullable().optional(),
  replacedBy: zod.z.string().nullable().optional(),
  aliases: zod.z.array(zod.z.string()).optional(),
  displayName: zod.z.string().optional()
});
var OverridesFileSchema = zod.z.object({
  comments: zod.z.string().optional(),
  deprecations: zod.z.array(DeprecationEntrySchema).default([]),
  extraAliases: zod.z.record(zod.z.string(), zod.z.record(zod.z.string(), zod.z.array(zod.z.string()))).default({})
});
async function loadOverrides(path$1) {
  const p = path$1 ?? path.resolve(process.cwd(), "overrides.json");
  try {
    const raw = await promises.readFile(p, "utf-8");
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

exports.CapabilitySchema = CapabilitySchema;
exports.CatalogSchema = CatalogSchema;
exports.ModalitySchema = ModalitySchema;
exports.ModelMetaSchema = ModelMetaSchema;
exports.PricingSchema = PricingSchema;
exports.ProviderMetaSchema = ProviderMetaSchema;
exports.applyOverrides = applyOverrides;
exports.loadOverrides = loadOverrides;
exports.normalizeModelsDev = normalizeModelsDev;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map