# aio-models-data

聚合 LLM 模型元数据（id、上下文窗口、工具调用支持、视觉、推理、定价等）的**自动化数据仓库**。

> 每周日 04:00 UTC 自动从 [models.dev](https://models.dev) 同步一次。
> 由 [AIO](https://github.com/Atom112/AIO) 项目通过 npm 私有包消费。

## 数据结构

```typescript
import type { Catalog, ModelMeta, ProviderMeta } from '@aio/models-data'

interface ModelMeta {
  id: string                     // 'claude-sonnet-4-5'
  provider: string               // 'anthropic'
  providerName: string           // 'Anthropic'
  displayName: string            // 'Claude Sonnet 4.5'
  family: string | null          // 'claude-sonnet'

  contextWindow: number          // 200000
  maxOutputTokens: number | null // 64000
  knowledgeCutoff: string | null // '2025-07-31'

  capabilities: {
    tools: boolean
    vision: boolean
    reasoning: boolean
    streaming: boolean
    json_mode: boolean
    system_prompt: boolean
    temperature: boolean
    attachment: boolean
    structured_output: boolean
    open_weights: boolean
  }

  modalities: {
    input: ('text' | 'image' | 'audio' | 'video' | 'pdf')[]
    output: ('text' | 'image' | 'audio' | 'video' | 'pdf')[]
  }

  pricing: {
    input: number       // USD per 1M tokens
    output: number
    cacheRead?: number
    cacheWrite?: number
    inputAudio?: number
    currency: 'USD'
    per: 1_000_000
    tiers?: Array<{ input: number; output: number; contextThreshold: number }>
    contextOverThreshold?: { input: number; output: number; contextThreshold: number }
  } | null

  status: 'active' | 'deprecated' | 'preview' | 'experimental'
  deprecationDate: string | null
  replacedBy: string | null
  aliases: string[]                // 旧 id 自动映射

  isAggregator: boolean            // true: 该 model id 含 'provider/model' 形式
  sources: string[]                // ['models.dev', 'aio-overrides']
}
```

## 文件清单

| 路径 | 用途 |
|---|---|
| `dist/catalog.json` | 完整数据（providers + models） |
| `dist/data/models.json` | 同上，便于 AIO bundled |
| `dist/data/{provider}.json` | 按厂商拆分 |
| `dist/index.json` | 轻量元信息（用于 UI 列厂商） |
| `dist/last-sync.md` | 本次同步 diff（人类可读） |
| `overrides.json` | 人工维护的补丁（aliases、deprecation、replacedBy） |

## 字段策略

| 字段 | 来源 | 说明 |
|---|---|---|
| `contextWindow`, `maxOutputTokens` | models.dev `limit` | |
| `capabilities.tools` | models.dev `tool_call` | |
| `capabilities.vision` | 派生：`modalities.input` 含 `image` 或 `attachment=true` | |
| `capabilities.reasoning` | models.dev `reasoning` | |
| `pricing.*` | models.dev `cost` | 缺则 `null` |
| `modalities` | models.dev `modalities` | 未知模态会被丢弃 |
| `displayName` | models.dev `name`，去 `(latest)` 后缀 | 原始 `(latest)` 名进 `aliases` |
| `status` | models.dev `status` | `experimental` 标志也会被映射 |
| `aliases` | `overrides.json` | 人工补的旧 id |
| `deprecationDate`, `replacedBy` | `overrides.json` | 人工补的迁移信息 |

## 维护 overrides

要标记某个模型为已弃用、补一个 alias，只改 `overrides.json` 然后提 PR，或 push 后手动 trigger `sync` workflow。

```json
{
  "deprecations": [
    {
      "id": "gpt-3.5-turbo",
      "provider": "openai",
      "status": "deprecated",
      "deprecationDate": "2025-09-01",
      "replacedBy": "gpt-4o-mini",
      "aliases": ["gpt-3.5-turbo-0613"]
    }
  ],
  "extraAliases": {
    "openai": {
      "gpt-4o": ["gpt-4o-2024-08-06"]
    }
  }
}
```

## 本地开发

```bash
npm install
npm run sync         # 跑一次同步，生成 dist/
npm run typecheck
npm run build
```

## CI 触发方式

- **自动**：每周日 04:00 UTC
- **手动**：GitHub → Actions → sync-models → Run workflow

## 许可

MIT
