import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { CatalogSchema, type Catalog, type ModelMeta } from '../src/index.js'
import { normalizeModelsDev } from '../src/normalizer.js'
import { loadOverrides, applyOverrides } from '../src/overrides.js'

const MODELS_DEV_URL = 'https://models.dev/api.json'
const ROOT = resolve(process.cwd())
const DIST = resolve(ROOT, 'dist')
const DATA_DIR = resolve(DIST, 'data')

interface SyncResult {
  catalog: Catalog
  added: string[]
  removed: string[]
  changed: { id: string; field: string; from: unknown; to: unknown }[]
}

async function fetchModelsDev(): Promise<unknown> {
  const r = await fetch(MODELS_DEV_URL, {
    headers: { 'user-agent': 'aio-models-data-sync/1.0 (+https://github.com/Atom112/AIO)' },
  })
  if (!r.ok) throw new Error(`models.dev fetch failed: ${r.status} ${r.statusText}`)
  return r.json()
}

function diffModels(prev: ModelMeta[], next: ModelMeta[]): Pick<SyncResult, 'added' | 'removed' | 'changed'> {
  const prevMap = new Map(prev.map(m => [`${m.provider}/${m.id}`, m]))
  const nextMap = new Map(next.map(m => [`${m.provider}/${m.id}`, m]))

  const added: string[] = []
  const removed: string[] = []
  const changed: SyncResult['changed'] = []

  for (const [k, n] of nextMap) {
    if (!prevMap.has(k)) {
      added.push(k)
      continue
    }
    const p = prevMap.get(k)!
    const watchFields: (keyof ModelMeta)[] = [
      'displayName', 'contextWindow', 'maxOutputTokens', 'pricing',
      'status', 'deprecationDate', 'replacedBy', 'knowledgeCutoff',
      'capabilities', 'modalities',
    ]
    for (const f of watchFields) {
      const a = JSON.stringify(p[f])
      const b = JSON.stringify(n[f])
      if (a !== b) changed.push({ id: k, field: String(f), from: p[f], to: n[f] })
    }
  }
  for (const k of prevMap.keys()) {
    if (!nextMap.has(k)) removed.push(k)
  }
  return { added, removed, changed }
}

async function loadPrevious(): Promise<Catalog | null> {
  const prevPath = resolve(DIST, 'catalog.json')
  try {
    const raw = await readFile(prevPath, 'utf-8')
    return CatalogSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}

function summarizeChanges(result: SyncResult): string {
  const lines: string[] = []
  lines.push(`# aio-models-data sync @ ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`- providers: ${result.catalog.providerCount}`)
  lines.push(`- models: ${result.catalog.modelCount}`)
  if (result.added.length) {
    lines.push('')
    lines.push(`## Added (${result.added.length})`)
    for (const k of result.added.slice(0, 50)) lines.push(`- ${k}`)
    if (result.added.length > 50) lines.push(`- ... and ${result.added.length - 50} more`)
  }
  if (result.removed.length) {
    lines.push('')
    lines.push(`## Removed (${result.removed.length})`)
    for (const k of result.removed.slice(0, 50)) lines.push(`- ${k}`)
    if (result.removed.length > 50) lines.push(`- ... and ${result.removed.length - 50} more`)
  }
  if (result.changed.length) {
    lines.push('')
    lines.push(`## Changed (${result.changed.length})`)
    for (const c of result.changed.slice(0, 50)) {
      lines.push(`- \`${c.id}\`: ${c.field} changed`)
    }
    if (result.changed.length > 50) lines.push(`- ... and ${result.changed.length - 50} more`)
  }
  return lines.join('\n') + '\n'
}

async function main() {
  console.log('[sync] fetching models.dev...')
  const raw = await fetchModelsDev()
  console.log('[sync] normalizing...')
  const { models, providers } = normalizeModelsDev(raw)
  console.log(`[sync]   ${providers.length} providers, ${models.length} models (pre-overrides)`)

  console.log('[sync] loading overrides...')
  const overrides = await loadOverrides()
  const finalModels = applyOverrides(models, overrides)
  console.log(`[sync]   ${finalModels.length} models (post-overrides)`)

  console.log('[sync] building catalog...')
  const catalog: Catalog = CatalogSchema.parse({
    version: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    generatedAt: new Date().toISOString(),
    source: MODELS_DEV_URL,
    providerCount: providers.length,
    modelCount: finalModels.length,
    providers,
    models: finalModels,
  })

  console.log('[sync] diffing vs previous...')
  const prev = await loadPrevious()
  const diff = prev
    ? diffModels(prev.models, finalModels)
    : { added: finalModels.map(m => `${m.provider}/${m.id}`), removed: [], changed: [] }

  console.log(`[sync]   added=${diff.added.length} removed=${diff.removed.length} changed=${diff.changed.length}`)

  await mkdir(DATA_DIR, { recursive: true })
  await mkdir(resolve(ROOT, 'data'), { recursive: true })

  const catalogJson = JSON.stringify(catalog, null, 2)
  await writeFile(resolve(DIST, 'catalog.json'), catalogJson, 'utf-8')
  await writeFile(resolve(DATA_DIR, 'models.json'), catalogJson, 'utf-8')
  console.log('[sync] wrote dist/catalog.json + dist/data/models.json')

  const byProvider = new Map<string, ModelMeta[]>()
  for (const m of finalModels) {
    if (!byProvider.has(m.provider)) byProvider.set(m.provider, [])
    byProvider.get(m.provider)!.push(m)
  }
  for (const [pid, ms] of byProvider) {
    const file = resolve(DATA_DIR, `${pid}.json`)
    await writeFile(file, JSON.stringify(ms, null, 2), 'utf-8')
  }
  console.log(`[sync] wrote ${byProvider.size} per-provider files to dist/data/`)

  const index = {
    version: catalog.version,
    generatedAt: catalog.generatedAt,
    source: catalog.source,
    providerCount: catalog.providerCount,
    modelCount: catalog.modelCount,
    providers: providers.map(p => ({ id: p.id, name: p.name, modelCount: p.modelCount, isAggregator: p.isAggregator })),
  }
  await writeFile(resolve(DIST, 'index.json'), JSON.stringify(index, null, 2), 'utf-8')
  console.log('[sync] wrote dist/index.json')

  const diffMd = summarizeChanges({ catalog, ...diff })
  await writeFile(resolve(ROOT, 'data', 'last-sync.md'), diffMd, 'utf-8')
  await writeFile(resolve(DIST, 'last-sync.md'), diffMd, 'utf-8')
  console.log('[sync] wrote data/last-sync.md')

  console.log('[sync] done.')
  process.exit(0)
}

main().catch(e => {
  console.error('[sync] FAILED:', e)
  process.exit(1)
})
