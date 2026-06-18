import { ModelMetaSchema, type ModelMeta, type ProviderMeta } from './schema.js'

interface ModelsDevModel {
  id: string
  name: string
  family?: string
  attachment?: boolean
  reasoning?: boolean
  reasoning_options?: unknown
  tool_call?: boolean
  temperature?: boolean
  knowledge?: string
  release_date?: string
  last_updated?: string
  modalities?: { input?: string[]; output?: string[] }
  open_weights?: boolean
  limit?: { context?: number; output?: number }
  cost?: {
    input?: number
    output?: number
    cache_read?: number
    cache_write?: number
    input_audio?: number
    tiers?: Array<{ input: number; output: number; cache_read?: number; tier?: { type: string; size: number } }>
    context_over_200k?: { input: number; output: number; cache_read?: number }
  }
  status?: 'active' | 'deprecated' | 'preview' | 'experimental'
  experimental?: boolean
  structured_output?: boolean
  interleaved?: boolean | { thinking?: boolean }
}

interface ModelsDevProvider {
  id: string
  name: string
  env?: string[]
  npm?: string
  api?: string
  doc?: string
  models: Record<string, ModelsDevModel>
}

type ModelsDevRoot = Record<string, ModelsDevProvider>

const ALL_MODALITIES = ['text', 'image', 'audio', 'video', 'pdf'] as const

function filterModalities(input: string[] | undefined): typeof ALL_MODALITIES[number][] {
  if (!input) return ['text']
  const out: typeof ALL_MODALITIES[number][] = []
  for (const m of input) {
    if ((ALL_MODALITIES as readonly string[]).includes(m)) {
      out.push(m as typeof ALL_MODALITIES[number])
    }
  }
  return out.length > 0 ? out : ['text']
}

function cleanDisplayName(raw: string): { name: string; alias: string | null } {
  const m = raw.match(/^(.*?)\s*\(latest\)\s*$/i)
  if (m && m[1]) return { name: m[1].trim(), alias: raw.trim() }
  return { name: raw.trim(), alias: null }
}

function buildPricing(cost: ModelsDevModel['cost'] | undefined) {
  if (!cost || typeof cost.input !== 'number' || typeof cost.output !== 'number') return null
  const out: ReturnType<typeof ModelMetaSchema.parse>['pricing'] = {
    input: cost.input,
    output: cost.output,
    currency: 'USD',
    per: 1_000_000,
  }
  if (typeof cost.cache_read === 'number') out.cacheRead = cost.cache_read
  if (typeof cost.cache_write === 'number') out.cacheWrite = cost.cache_write
  if (typeof cost.input_audio === 'number') out.inputAudio = cost.input_audio
  if (Array.isArray(cost.tiers)) {
    out.tiers = cost.tiers
      .filter(t => typeof t.tier?.size === 'number')
      .map(t => ({
        input: t.input,
        output: t.output,
        contextThreshold: t.tier!.size,
      }))
  }
  const over = cost.context_over_200k
  if (over && typeof over.input === 'number' && typeof over.output === 'number') {
    out.contextOverThreshold = {
      input: over.input,
      output: over.output,
      contextThreshold: 200_000,
    }
  }
  return out
}

function deriveStatus(m: ModelsDevModel): 'active' | 'deprecated' | 'preview' | 'experimental' | 'beta' | 'alpha' | 'unlisted' {
  if (m.status) return m.status
  if (m.experimental) return 'experimental'
  return 'active'
}

export interface NormalizeResult {
  models: ModelMeta[]
  providers: ProviderMeta[]
}

export function normalizeModelsDev(raw: unknown): NormalizeResult {
  if (!raw || typeof raw !== 'object') throw new Error('models.dev JSON: not an object')
  const root = raw as ModelsDevRoot

  const models: ModelMeta[] = []
  const providers: ProviderMeta[] = []

  for (const [providerId, prov] of Object.entries(root)) {
    if (!prov || typeof prov !== 'object' || !prov.models) continue
    const isAggregator = Boolean(prov.api)
    const providerName = prov.name || providerId
    const modelIds = Object.keys(prov.models)

    providers.push({
      id: providerId,
      name: providerName,
      env: prov.env ?? [],
      npm: prov.npm ?? null,
      api: prov.api ?? null,
      doc: prov.doc ?? null,
      modelCount: modelIds.length,
      isAggregator,
    })

    for (const [mid, m] of Object.entries(prov.models)) {
      const { name: displayName, alias } = cleanDisplayName(m.name)
      const aliases: string[] = []
      if (alias && alias !== displayName) aliases.push(alias)

      const meta: ModelMeta = ModelMetaSchema.parse({
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
          vision: filterModalities(m.modalities?.input).includes('image') || Boolean(m.attachment),
          reasoning: Boolean(m.reasoning),
          streaming: true,
          json_mode: Boolean(m.structured_output),
          system_prompt: true,
          temperature: m.temperature !== false,
          attachment: Boolean(m.attachment),
          structured_output: Boolean(m.structured_output),
          open_weights: Boolean(m.open_weights),
        },
        modalities: {
          input: filterModalities(m.modalities?.input),
          output: filterModalities(m.modalities?.output),
        },
        pricing: buildPricing(m.cost),
        status: deriveStatus(m),
        deprecationDate: null,
        replacedBy: null,
        aliases,
        isAggregator,
        sources: ['models.dev'],
      })
      models.push(meta)
    }
  }

  return { models, providers }
}
