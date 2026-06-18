import { z } from 'zod'

export const ModalitySchema = z.enum(['text', 'image', 'audio', 'video', 'pdf'])
export type Modality = z.infer<typeof ModalitySchema>

export const CapabilitySchema = z.enum([
  'tools',
  'vision',
  'reasoning',
  'streaming',
  'json_mode',
  'system_prompt',
  'temperature',
  'attachment',
  'structured_output',
  'open_weights',
])
export type Capability = z.infer<typeof CapabilitySchema>

export const PricingSchema = z.object({
  input: z.number().nonnegative(),
  output: z.number().nonnegative(),
  cacheRead: z.number().nonnegative().optional(),
  cacheWrite: z.number().nonnegative().optional(),
  inputAudio: z.number().nonnegative().optional(),
  currency: z.literal('USD').default('USD'),
  per: z.literal(1_000_000).default(1_000_000),
  tiers: z
    .array(
      z.object({
        input: z.number().nonnegative(),
        output: z.number().nonnegative(),
        contextThreshold: z.number().int().positive(),
      }),
    )
    .optional(),
  contextOverThreshold: z
    .object({
      input: z.number().nonnegative(),
      output: z.number().nonnegative(),
      contextThreshold: z.number().int().positive(),
    })
    .optional(),
})
export type Pricing = z.infer<typeof PricingSchema>

export const ModelMetaSchema = z.object({
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
    open_weights: z.boolean().default(false),
  }),

  modalities: z.object({
    input: z.array(ModalitySchema),
    output: z.array(ModalitySchema),
  }),

  pricing: PricingSchema.nullable(),

  status: z
    .enum(['active', 'deprecated', 'preview', 'experimental', 'beta', 'alpha', 'unlisted'])
    .default('active'),
  deprecationDate: z.string().nullable(),
  replacedBy: z.string().nullable(),
  aliases: z.array(z.string()).default([]),

  isAggregator: z.boolean().default(false),

  sources: z.array(z.string()).default([]),
})
export type ModelMeta = z.infer<typeof ModelMetaSchema>

export const ProviderMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  env: z.array(z.string()).default([]),
  npm: z.string().nullable(),
  api: z.string().nullable(),
  doc: z.string().nullable(),
  modelCount: z.number().int().nonnegative(),
  isAggregator: z.boolean(),
})
export type ProviderMeta = z.infer<typeof ProviderMetaSchema>

export const CatalogSchema = z.object({
  version: z.string(),
  generatedAt: z.string(),
  source: z.string(),
  providerCount: z.number().int().nonnegative(),
  modelCount: z.number().int().nonnegative(),
  providers: z.array(ProviderMetaSchema),
  models: z.array(ModelMetaSchema),
})
export type Catalog = z.infer<typeof CatalogSchema>
