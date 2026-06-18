import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'
import type { ModelMeta } from './schema.js'

const DeprecationEntrySchema = z.object({
  id: z.string(),
  provider: z.string(),
  status: z
    .enum(['active', 'deprecated', 'preview', 'experimental', 'beta', 'alpha', 'unlisted'])
    .optional(),
  deprecationDate: z.string().nullable().optional(),
  replacedBy: z.string().nullable().optional(),
  aliases: z.array(z.string()).optional(),
  displayName: z.string().optional(),
})

const OverridesFileSchema = z.object({
  comments: z.string().optional(),
  deprecations: z.array(DeprecationEntrySchema).default([]),
  extraAliases: z
    .record(z.string(), z.record(z.string(), z.array(z.string())))
    .default({}),
})

export type OverridesFile = z.infer<typeof OverridesFileSchema>

export async function loadOverrides(path?: string): Promise<OverridesFile> {
  const p = path ?? resolve(process.cwd(), 'overrides.json')
  try {
    const raw = await readFile(p, 'utf-8')
    return OverridesFileSchema.parse(JSON.parse(raw))
  } catch (e: unknown) {
    if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      return { deprecations: [], extraAliases: {} }
    }
    throw e
  }
}

export function applyOverrides(models: ModelMeta[], ov: OverridesFile): ModelMeta[] {
  const depByKey = new Map<string, (typeof ov.deprecations)[number]>()
  for (const d of ov.deprecations) depByKey.set(`${d.provider}/${d.id}`, d)

  const aliasByProvider = new Map<string, string[]>()
  for (const prov of Object.keys(ov.extraAliases)) {
    const map = ov.extraAliases[prov]
    if (!map) continue
    for (const id of Object.keys(map)) {
      const aliases: string[] | undefined = map[id]
      if (!aliases) continue
      aliasByProvider.set(`${prov}/${id}`, aliases)
    }
  }

  return models.map(m => {
    const key = `${m.provider}/${m.id}`
    const dep = depByKey.get(key)
    const extraAliases = aliasByProvider.get(key)

    const next: ModelMeta = { ...m }
    if (extraAliases) {
      const merged = new Set([...m.aliases, ...extraAliases])
      next.aliases = [...merged]
    }
    if (dep) {
      if (dep.status) next.status = dep.status
      if (dep.deprecationDate !== undefined) next.deprecationDate = dep.deprecationDate
      if (dep.replacedBy !== undefined) next.replacedBy = dep.replacedBy
      if (dep.aliases) {
        const merged = new Set([...next.aliases, ...dep.aliases])
        next.aliases = [...merged]
      }
      if (dep.displayName) next.displayName = dep.displayName
      next.sources = [...next.sources, 'aio-overrides']
    }
    return next
  })
}
