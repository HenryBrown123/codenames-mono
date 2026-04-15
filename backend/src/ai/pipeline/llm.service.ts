/**
 * Universal LLM Service using OpenAI SDK
 *
 * Works with any OpenAI-compatible API:
 * - Gemini:   baseURL = https://generativelanguage.googleapis.com/v1beta/openai
 * - Ollama:   baseURL = http://localhost:11434/v1
 * - OpenAI:   baseURL = https://api.openai.com/v1
 * - DeepSeek: baseURL = https://api.deepseek.com/v1
 */

import OpenAI from "openai";

export type LLMConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
};

export type LLMGenerateOptions = {
  prompt: string;
  format?: "json";
  temperature?: number;
  maxTokens?: number;
};

/**
 * Creates a universal LLM service for AI gameplay decisions
 */
export const createLLMService = (config: LLMConfig) => {
  const {
    baseURL,
    apiKey,
    model,
    temperature = 0.7,
    maxTokens = 4096,
  } = config;

  const client = new OpenAI({
    baseURL,
    apiKey,
  });

  let requestCount = 0;

  /**
   * Generate text/JSON from the LLM
   */
  const generate = async (options: LLMGenerateOptions): Promise<string> => {
    const requestId = ++requestCount;
    const startTime = Date.now();
    const effectiveTemp = options.temperature ?? temperature;
    const effectiveMaxTokens = options.maxTokens ?? maxTokens;
    const promptLength = options.prompt.length;

    console.log(
      `[LLM #${requestId}] REQUEST: model=${model} temp=${effectiveTemp} prompt_chars=${promptLength}`,
    );

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: options.prompt }],
      temperature: effectiveTemp,
      max_tokens: effectiveMaxTokens,
      ...(options.format === "json" && {
        response_format: { type: "json_object" },
      }),
    });

    const elapsed = Date.now() - startTime;
    const content = response.choices[0]?.message?.content || "";

    console.log(
      `[LLM #${requestId}] SUCCESS: ${content.length} chars in ${elapsed}ms`,
    );

    return content;
  };

  /**
   * Generate and parse JSON response
   */
  const generateJSON = async <T = unknown>(
    prompt: string,
    overrides?: Omit<LLMGenerateOptions, "prompt" | "format">,
  ): Promise<T> => {
    const raw = await generate({ prompt, format: "json", ...overrides });

    // Strip any markdown fences (some providers still add these)
    let cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Strip <think>...</think> blocks (reasoning models like DeepSeek-R1)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Handle unclosed think tags
    if (cleaned.startsWith("<think>")) {
      const jsonStart = cleaned.search(/[{\[]/);
      cleaned = jsonStart >= 0 ? cleaned.substring(jsonStart) : "";
    }

    if (!cleaned) {
      throw new Error("LLM returned empty response after cleanup");
    }

    console.log(
      "[AI-DEBUG] Parsing JSON:",
      cleaned.substring(0, 200) + (cleaned.length > 200 ? "..." : ""),
    );

    return JSON.parse(cleaned) as T;
  };

  return {
    model,
    generate,
    generateJSON,
  };
};

/**
 * Type for the LLM service
 */
export type LLMService = ReturnType<typeof createLLMService>;
