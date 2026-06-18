import { z } from 'zod';

declare const ModalitySchema: z.ZodEnum<["text", "image", "audio", "video", "pdf"]>;
type Modality = z.infer<typeof ModalitySchema>;
declare const CapabilitySchema: z.ZodEnum<["tools", "vision", "reasoning", "streaming", "json_mode", "system_prompt", "temperature", "attachment", "structured_output", "open_weights"]>;
type Capability = z.infer<typeof CapabilitySchema>;
declare const PricingSchema: z.ZodObject<{
    input: z.ZodNumber;
    output: z.ZodNumber;
    cacheRead: z.ZodOptional<z.ZodNumber>;
    cacheWrite: z.ZodOptional<z.ZodNumber>;
    inputAudio: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodLiteral<"USD">>;
    per: z.ZodDefault<z.ZodLiteral<1000000>>;
    tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        contextThreshold: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        input: number;
        output: number;
        contextThreshold: number;
    }, {
        input: number;
        output: number;
        contextThreshold: number;
    }>, "many">>;
    contextOverThreshold: z.ZodOptional<z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        contextThreshold: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        input: number;
        output: number;
        contextThreshold: number;
    }, {
        input: number;
        output: number;
        contextThreshold: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    input: number;
    output: number;
    currency: "USD";
    per: 1000000;
    cacheRead?: number | undefined;
    cacheWrite?: number | undefined;
    inputAudio?: number | undefined;
    tiers?: {
        input: number;
        output: number;
        contextThreshold: number;
    }[] | undefined;
    contextOverThreshold?: {
        input: number;
        output: number;
        contextThreshold: number;
    } | undefined;
}, {
    input: number;
    output: number;
    cacheRead?: number | undefined;
    cacheWrite?: number | undefined;
    inputAudio?: number | undefined;
    currency?: "USD" | undefined;
    per?: 1000000 | undefined;
    tiers?: {
        input: number;
        output: number;
        contextThreshold: number;
    }[] | undefined;
    contextOverThreshold?: {
        input: number;
        output: number;
        contextThreshold: number;
    } | undefined;
}>;
type Pricing = z.infer<typeof PricingSchema>;
declare const ModelMetaSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodString;
    providerName: z.ZodString;
    displayName: z.ZodString;
    family: z.ZodNullable<z.ZodString>;
    releaseDate: z.ZodNullable<z.ZodString>;
    lastUpdated: z.ZodNullable<z.ZodString>;
    knowledgeCutoff: z.ZodNullable<z.ZodString>;
    contextWindow: z.ZodNumber;
    maxOutputTokens: z.ZodNullable<z.ZodNumber>;
    capabilities: z.ZodObject<{
        tools: z.ZodDefault<z.ZodBoolean>;
        vision: z.ZodDefault<z.ZodBoolean>;
        reasoning: z.ZodDefault<z.ZodBoolean>;
        streaming: z.ZodDefault<z.ZodBoolean>;
        json_mode: z.ZodDefault<z.ZodBoolean>;
        system_prompt: z.ZodDefault<z.ZodBoolean>;
        temperature: z.ZodDefault<z.ZodBoolean>;
        attachment: z.ZodDefault<z.ZodBoolean>;
        structured_output: z.ZodDefault<z.ZodBoolean>;
        open_weights: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        tools: boolean;
        vision: boolean;
        reasoning: boolean;
        streaming: boolean;
        json_mode: boolean;
        system_prompt: boolean;
        temperature: boolean;
        attachment: boolean;
        structured_output: boolean;
        open_weights: boolean;
    }, {
        tools?: boolean | undefined;
        vision?: boolean | undefined;
        reasoning?: boolean | undefined;
        streaming?: boolean | undefined;
        json_mode?: boolean | undefined;
        system_prompt?: boolean | undefined;
        temperature?: boolean | undefined;
        attachment?: boolean | undefined;
        structured_output?: boolean | undefined;
        open_weights?: boolean | undefined;
    }>;
    modalities: z.ZodObject<{
        input: z.ZodArray<z.ZodEnum<["text", "image", "audio", "video", "pdf"]>, "many">;
        output: z.ZodArray<z.ZodEnum<["text", "image", "audio", "video", "pdf"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        input: ("text" | "image" | "audio" | "video" | "pdf")[];
        output: ("text" | "image" | "audio" | "video" | "pdf")[];
    }, {
        input: ("text" | "image" | "audio" | "video" | "pdf")[];
        output: ("text" | "image" | "audio" | "video" | "pdf")[];
    }>;
    pricing: z.ZodNullable<z.ZodObject<{
        input: z.ZodNumber;
        output: z.ZodNumber;
        cacheRead: z.ZodOptional<z.ZodNumber>;
        cacheWrite: z.ZodOptional<z.ZodNumber>;
        inputAudio: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodDefault<z.ZodLiteral<"USD">>;
        per: z.ZodDefault<z.ZodLiteral<1000000>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            contextThreshold: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            input: number;
            output: number;
            contextThreshold: number;
        }, {
            input: number;
            output: number;
            contextThreshold: number;
        }>, "many">>;
        contextOverThreshold: z.ZodOptional<z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            contextThreshold: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            input: number;
            output: number;
            contextThreshold: number;
        }, {
            input: number;
            output: number;
            contextThreshold: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        input: number;
        output: number;
        currency: "USD";
        per: 1000000;
        cacheRead?: number | undefined;
        cacheWrite?: number | undefined;
        inputAudio?: number | undefined;
        tiers?: {
            input: number;
            output: number;
            contextThreshold: number;
        }[] | undefined;
        contextOverThreshold?: {
            input: number;
            output: number;
            contextThreshold: number;
        } | undefined;
    }, {
        input: number;
        output: number;
        cacheRead?: number | undefined;
        cacheWrite?: number | undefined;
        inputAudio?: number | undefined;
        currency?: "USD" | undefined;
        per?: 1000000 | undefined;
        tiers?: {
            input: number;
            output: number;
            contextThreshold: number;
        }[] | undefined;
        contextOverThreshold?: {
            input: number;
            output: number;
            contextThreshold: number;
        } | undefined;
    }>>;
    status: z.ZodDefault<z.ZodEnum<["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]>>;
    deprecationDate: z.ZodNullable<z.ZodString>;
    replacedBy: z.ZodNullable<z.ZodString>;
    aliases: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isAggregator: z.ZodDefault<z.ZodBoolean>;
    sources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted";
    id: string;
    provider: string;
    providerName: string;
    displayName: string;
    family: string | null;
    releaseDate: string | null;
    lastUpdated: string | null;
    knowledgeCutoff: string | null;
    contextWindow: number;
    maxOutputTokens: number | null;
    capabilities: {
        tools: boolean;
        vision: boolean;
        reasoning: boolean;
        streaming: boolean;
        json_mode: boolean;
        system_prompt: boolean;
        temperature: boolean;
        attachment: boolean;
        structured_output: boolean;
        open_weights: boolean;
    };
    modalities: {
        input: ("text" | "image" | "audio" | "video" | "pdf")[];
        output: ("text" | "image" | "audio" | "video" | "pdf")[];
    };
    pricing: {
        input: number;
        output: number;
        currency: "USD";
        per: 1000000;
        cacheRead?: number | undefined;
        cacheWrite?: number | undefined;
        inputAudio?: number | undefined;
        tiers?: {
            input: number;
            output: number;
            contextThreshold: number;
        }[] | undefined;
        contextOverThreshold?: {
            input: number;
            output: number;
            contextThreshold: number;
        } | undefined;
    } | null;
    deprecationDate: string | null;
    replacedBy: string | null;
    aliases: string[];
    isAggregator: boolean;
    sources: string[];
}, {
    id: string;
    provider: string;
    providerName: string;
    displayName: string;
    family: string | null;
    releaseDate: string | null;
    lastUpdated: string | null;
    knowledgeCutoff: string | null;
    contextWindow: number;
    maxOutputTokens: number | null;
    capabilities: {
        tools?: boolean | undefined;
        vision?: boolean | undefined;
        reasoning?: boolean | undefined;
        streaming?: boolean | undefined;
        json_mode?: boolean | undefined;
        system_prompt?: boolean | undefined;
        temperature?: boolean | undefined;
        attachment?: boolean | undefined;
        structured_output?: boolean | undefined;
        open_weights?: boolean | undefined;
    };
    modalities: {
        input: ("text" | "image" | "audio" | "video" | "pdf")[];
        output: ("text" | "image" | "audio" | "video" | "pdf")[];
    };
    pricing: {
        input: number;
        output: number;
        cacheRead?: number | undefined;
        cacheWrite?: number | undefined;
        inputAudio?: number | undefined;
        currency?: "USD" | undefined;
        per?: 1000000 | undefined;
        tiers?: {
            input: number;
            output: number;
            contextThreshold: number;
        }[] | undefined;
        contextOverThreshold?: {
            input: number;
            output: number;
            contextThreshold: number;
        } | undefined;
    } | null;
    deprecationDate: string | null;
    replacedBy: string | null;
    status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
    aliases?: string[] | undefined;
    isAggregator?: boolean | undefined;
    sources?: string[] | undefined;
}>;
type ModelMeta = z.infer<typeof ModelMetaSchema>;
declare const ProviderMetaSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    env: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    npm: z.ZodNullable<z.ZodString>;
    api: z.ZodNullable<z.ZodString>;
    doc: z.ZodNullable<z.ZodString>;
    modelCount: z.ZodNumber;
    isAggregator: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    isAggregator: boolean;
    name: string;
    env: string[];
    npm: string | null;
    api: string | null;
    doc: string | null;
    modelCount: number;
}, {
    id: string;
    isAggregator: boolean;
    name: string;
    npm: string | null;
    api: string | null;
    doc: string | null;
    modelCount: number;
    env?: string[] | undefined;
}>;
type ProviderMeta = z.infer<typeof ProviderMetaSchema>;
declare const CatalogSchema: z.ZodObject<{
    version: z.ZodString;
    generatedAt: z.ZodString;
    source: z.ZodString;
    providerCount: z.ZodNumber;
    modelCount: z.ZodNumber;
    providers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        env: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        npm: z.ZodNullable<z.ZodString>;
        api: z.ZodNullable<z.ZodString>;
        doc: z.ZodNullable<z.ZodString>;
        modelCount: z.ZodNumber;
        isAggregator: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        isAggregator: boolean;
        name: string;
        env: string[];
        npm: string | null;
        api: string | null;
        doc: string | null;
        modelCount: number;
    }, {
        id: string;
        isAggregator: boolean;
        name: string;
        npm: string | null;
        api: string | null;
        doc: string | null;
        modelCount: number;
        env?: string[] | undefined;
    }>, "many">;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodString;
        providerName: z.ZodString;
        displayName: z.ZodString;
        family: z.ZodNullable<z.ZodString>;
        releaseDate: z.ZodNullable<z.ZodString>;
        lastUpdated: z.ZodNullable<z.ZodString>;
        knowledgeCutoff: z.ZodNullable<z.ZodString>;
        contextWindow: z.ZodNumber;
        maxOutputTokens: z.ZodNullable<z.ZodNumber>;
        capabilities: z.ZodObject<{
            tools: z.ZodDefault<z.ZodBoolean>;
            vision: z.ZodDefault<z.ZodBoolean>;
            reasoning: z.ZodDefault<z.ZodBoolean>;
            streaming: z.ZodDefault<z.ZodBoolean>;
            json_mode: z.ZodDefault<z.ZodBoolean>;
            system_prompt: z.ZodDefault<z.ZodBoolean>;
            temperature: z.ZodDefault<z.ZodBoolean>;
            attachment: z.ZodDefault<z.ZodBoolean>;
            structured_output: z.ZodDefault<z.ZodBoolean>;
            open_weights: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            tools: boolean;
            vision: boolean;
            reasoning: boolean;
            streaming: boolean;
            json_mode: boolean;
            system_prompt: boolean;
            temperature: boolean;
            attachment: boolean;
            structured_output: boolean;
            open_weights: boolean;
        }, {
            tools?: boolean | undefined;
            vision?: boolean | undefined;
            reasoning?: boolean | undefined;
            streaming?: boolean | undefined;
            json_mode?: boolean | undefined;
            system_prompt?: boolean | undefined;
            temperature?: boolean | undefined;
            attachment?: boolean | undefined;
            structured_output?: boolean | undefined;
            open_weights?: boolean | undefined;
        }>;
        modalities: z.ZodObject<{
            input: z.ZodArray<z.ZodEnum<["text", "image", "audio", "video", "pdf"]>, "many">;
            output: z.ZodArray<z.ZodEnum<["text", "image", "audio", "video", "pdf"]>, "many">;
        }, "strip", z.ZodTypeAny, {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        }, {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        }>;
        pricing: z.ZodNullable<z.ZodObject<{
            input: z.ZodNumber;
            output: z.ZodNumber;
            cacheRead: z.ZodOptional<z.ZodNumber>;
            cacheWrite: z.ZodOptional<z.ZodNumber>;
            inputAudio: z.ZodOptional<z.ZodNumber>;
            currency: z.ZodDefault<z.ZodLiteral<"USD">>;
            per: z.ZodDefault<z.ZodLiteral<1000000>>;
            tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
                input: z.ZodNumber;
                output: z.ZodNumber;
                contextThreshold: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                input: number;
                output: number;
                contextThreshold: number;
            }, {
                input: number;
                output: number;
                contextThreshold: number;
            }>, "many">>;
            contextOverThreshold: z.ZodOptional<z.ZodObject<{
                input: z.ZodNumber;
                output: z.ZodNumber;
                contextThreshold: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                input: number;
                output: number;
                contextThreshold: number;
            }, {
                input: number;
                output: number;
                contextThreshold: number;
            }>>;
        }, "strip", z.ZodTypeAny, {
            input: number;
            output: number;
            currency: "USD";
            per: 1000000;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        }, {
            input: number;
            output: number;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            currency?: "USD" | undefined;
            per?: 1000000 | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        }>>;
        status: z.ZodDefault<z.ZodEnum<["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]>>;
        deprecationDate: z.ZodNullable<z.ZodString>;
        replacedBy: z.ZodNullable<z.ZodString>;
        aliases: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        isAggregator: z.ZodDefault<z.ZodBoolean>;
        sources: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted";
        id: string;
        provider: string;
        providerName: string;
        displayName: string;
        family: string | null;
        releaseDate: string | null;
        lastUpdated: string | null;
        knowledgeCutoff: string | null;
        contextWindow: number;
        maxOutputTokens: number | null;
        capabilities: {
            tools: boolean;
            vision: boolean;
            reasoning: boolean;
            streaming: boolean;
            json_mode: boolean;
            system_prompt: boolean;
            temperature: boolean;
            attachment: boolean;
            structured_output: boolean;
            open_weights: boolean;
        };
        modalities: {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        };
        pricing: {
            input: number;
            output: number;
            currency: "USD";
            per: 1000000;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        } | null;
        deprecationDate: string | null;
        replacedBy: string | null;
        aliases: string[];
        isAggregator: boolean;
        sources: string[];
    }, {
        id: string;
        provider: string;
        providerName: string;
        displayName: string;
        family: string | null;
        releaseDate: string | null;
        lastUpdated: string | null;
        knowledgeCutoff: string | null;
        contextWindow: number;
        maxOutputTokens: number | null;
        capabilities: {
            tools?: boolean | undefined;
            vision?: boolean | undefined;
            reasoning?: boolean | undefined;
            streaming?: boolean | undefined;
            json_mode?: boolean | undefined;
            system_prompt?: boolean | undefined;
            temperature?: boolean | undefined;
            attachment?: boolean | undefined;
            structured_output?: boolean | undefined;
            open_weights?: boolean | undefined;
        };
        modalities: {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        };
        pricing: {
            input: number;
            output: number;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            currency?: "USD" | undefined;
            per?: 1000000 | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        } | null;
        deprecationDate: string | null;
        replacedBy: string | null;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        aliases?: string[] | undefined;
        isAggregator?: boolean | undefined;
        sources?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    modelCount: number;
    version: string;
    generatedAt: string;
    source: string;
    providerCount: number;
    providers: {
        id: string;
        isAggregator: boolean;
        name: string;
        env: string[];
        npm: string | null;
        api: string | null;
        doc: string | null;
        modelCount: number;
    }[];
    models: {
        status: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted";
        id: string;
        provider: string;
        providerName: string;
        displayName: string;
        family: string | null;
        releaseDate: string | null;
        lastUpdated: string | null;
        knowledgeCutoff: string | null;
        contextWindow: number;
        maxOutputTokens: number | null;
        capabilities: {
            tools: boolean;
            vision: boolean;
            reasoning: boolean;
            streaming: boolean;
            json_mode: boolean;
            system_prompt: boolean;
            temperature: boolean;
            attachment: boolean;
            structured_output: boolean;
            open_weights: boolean;
        };
        modalities: {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        };
        pricing: {
            input: number;
            output: number;
            currency: "USD";
            per: 1000000;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        } | null;
        deprecationDate: string | null;
        replacedBy: string | null;
        aliases: string[];
        isAggregator: boolean;
        sources: string[];
    }[];
}, {
    modelCount: number;
    version: string;
    generatedAt: string;
    source: string;
    providerCount: number;
    providers: {
        id: string;
        isAggregator: boolean;
        name: string;
        npm: string | null;
        api: string | null;
        doc: string | null;
        modelCount: number;
        env?: string[] | undefined;
    }[];
    models: {
        id: string;
        provider: string;
        providerName: string;
        displayName: string;
        family: string | null;
        releaseDate: string | null;
        lastUpdated: string | null;
        knowledgeCutoff: string | null;
        contextWindow: number;
        maxOutputTokens: number | null;
        capabilities: {
            tools?: boolean | undefined;
            vision?: boolean | undefined;
            reasoning?: boolean | undefined;
            streaming?: boolean | undefined;
            json_mode?: boolean | undefined;
            system_prompt?: boolean | undefined;
            temperature?: boolean | undefined;
            attachment?: boolean | undefined;
            structured_output?: boolean | undefined;
            open_weights?: boolean | undefined;
        };
        modalities: {
            input: ("text" | "image" | "audio" | "video" | "pdf")[];
            output: ("text" | "image" | "audio" | "video" | "pdf")[];
        };
        pricing: {
            input: number;
            output: number;
            cacheRead?: number | undefined;
            cacheWrite?: number | undefined;
            inputAudio?: number | undefined;
            currency?: "USD" | undefined;
            per?: 1000000 | undefined;
            tiers?: {
                input: number;
                output: number;
                contextThreshold: number;
            }[] | undefined;
            contextOverThreshold?: {
                input: number;
                output: number;
                contextThreshold: number;
            } | undefined;
        } | null;
        deprecationDate: string | null;
        replacedBy: string | null;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        aliases?: string[] | undefined;
        isAggregator?: boolean | undefined;
        sources?: string[] | undefined;
    }[];
}>;
type Catalog = z.infer<typeof CatalogSchema>;

interface NormalizeResult {
    models: ModelMeta[];
    providers: ProviderMeta[];
}
declare function normalizeModelsDev(raw: unknown): NormalizeResult;

declare const OverridesFileSchema: z.ZodObject<{
    comments: z.ZodOptional<z.ZodString>;
    deprecations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodString;
        status: z.ZodOptional<z.ZodEnum<["active", "deprecated", "preview", "experimental", "beta", "alpha", "unlisted"]>>;
        deprecationDate: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        replacedBy: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        aliases: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        displayName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        provider: string;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        displayName?: string | undefined;
        deprecationDate?: string | null | undefined;
        replacedBy?: string | null | undefined;
        aliases?: string[] | undefined;
    }, {
        id: string;
        provider: string;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        displayName?: string | undefined;
        deprecationDate?: string | null | undefined;
        replacedBy?: string | null | undefined;
        aliases?: string[] | undefined;
    }>, "many">>;
    extraAliases: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>>;
}, "strip", z.ZodTypeAny, {
    deprecations: {
        id: string;
        provider: string;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        displayName?: string | undefined;
        deprecationDate?: string | null | undefined;
        replacedBy?: string | null | undefined;
        aliases?: string[] | undefined;
    }[];
    extraAliases: Record<string, Record<string, string[]>>;
    comments?: string | undefined;
}, {
    comments?: string | undefined;
    deprecations?: {
        id: string;
        provider: string;
        status?: "active" | "deprecated" | "preview" | "experimental" | "beta" | "alpha" | "unlisted" | undefined;
        displayName?: string | undefined;
        deprecationDate?: string | null | undefined;
        replacedBy?: string | null | undefined;
        aliases?: string[] | undefined;
    }[] | undefined;
    extraAliases?: Record<string, Record<string, string[]>> | undefined;
}>;
type OverridesFile = z.infer<typeof OverridesFileSchema>;
declare function loadOverrides(path?: string): Promise<OverridesFile>;
declare function applyOverrides(models: ModelMeta[], ov: OverridesFile): ModelMeta[];

export { type Capability, CapabilitySchema, type Catalog, CatalogSchema, type Modality, ModalitySchema, type ModelMeta, ModelMetaSchema, type OverridesFile, type Pricing, PricingSchema, type ProviderMeta, ProviderMetaSchema, applyOverrides, loadOverrides, normalizeModelsDev };
