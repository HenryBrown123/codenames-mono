/**
 * Local LLM Service using Ollama
 * Provides AI decision-making for Codenames gameplay
 *
 * Uses /api/chat (not /api/generate) so we can pass think: false
 * to disable reasoning tokens on models like Qwen3 and DeepSeek-R1.
 */

export type LocalLLMConfig = {
  ollamaUrl: string;
  model: string;
  temperature?: number;
  numCtx?: number;
};

export type LLMGenerateOptions = {
  prompt: string;
  format?: "json";
  temperature?: number;
  top_k?: number;
  num_ctx?: number;
};

/**
 * Response from Ollama /api/chat endpoint
 */
type OllamaChatResponse = {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
};

/**
 * Creates a local LLM service for AI gameplay decisions
 */
export const createLocalLLMService = (config: LocalLLMConfig) => {
  const { ollamaUrl, model, temperature = 0.7, numCtx = 4096 } = config;

  let requestCount = 0;

  /**
   * Generate text/JSON from the LLM via /api/chat
   */
  const generate = async (options: LLMGenerateOptions): Promise<string> => {
    const requestId = ++requestCount;
    const startTime = Date.now();
    const effectiveTemp = options.temperature ?? temperature;
    const effectiveCtx = options.num_ctx ?? numCtx;
    const effectiveTopK = options.top_k ?? 40;
    const promptLength = options.prompt.length;

    console.log(`[LLM #${requestId}] REQUEST: model=${model} temp=${effectiveTemp} ctx=${effectiveCtx} top_k=${effectiveTopK} prompt_chars=${promptLength}`);

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: options.prompt }],
        stream: false,
        format: options.format,
        think: false,
        options: {
          temperature: effectiveTemp,
          num_ctx: effectiveCtx,
          top_k: effectiveTopK,
        },
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      console.log(`[LLM #${requestId}] FAILED: ${response.statusText} (${elapsed}ms)`);
      throw new Error(`LLM request failed: ${response.statusText}`);
    }

    const data: OllamaChatResponse = await response.json();
    const content = data.message?.content || "";

    console.log(`[LLM #${requestId}] SUCCESS: ${content.length} chars in ${elapsed}ms`);

    return content;
  };

  /**
   * Generate and parse JSON response.
   * Includes cleanup for edge cases where models still emit
   * think tags or markdown fences despite think: false.
   */
  const generateJSON = async <T = unknown>(
    prompt: string,
    overrides?: Omit<LLMGenerateOptions, "prompt" | "format">,
  ): Promise<T> => {
    const raw = await generate({ prompt, format: "json", ...overrides });

    // Strip <think>...</think> blocks (safety net — shouldn't appear with think: false)
    let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Handle unclosed think tags (model got cut off mid-thought)
    if (cleaned.startsWith("<think>")) {
      const jsonStart = cleaned.search(/[{\[]/);
      cleaned = jsonStart >= 0 ? cleaned.substring(jsonStart) : "";
    }

    // Strip markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    if (!cleaned) {
      throw new Error("LLM returned empty response after cleanup");
    }

    console.log("[AI-DEBUG] Parsing JSON:", cleaned.substring(0, 200) + (cleaned.length > 200 ? "..." : ""));

    return JSON.parse(cleaned) as T;
  };

  return {
    model,
    generate,
    generateJSON,
  };
};

/**
 * Type for the local LLM service
 */
export type LocalLLMService = ReturnType<typeof createLocalLLMService>;
