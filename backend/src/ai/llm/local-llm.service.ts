/**
 * Local LLM Service using Ollama
 * Provides AI decision-making for Codenames gameplay
 */

export type LocalLLMConfig = {
  ollamaUrl: string;
  model: string;
  temperature?: number;
};

export type LLMGenerateOptions = {
  prompt: string;
  format?: "json";
  temperature?: number;
};

/**
 * Response from Ollama API
 */
type OllamaResponse = {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
};

/**
 * Creates a local LLM service for AI gameplay decisions
 */
export const createLocalLLMService = (config: LocalLLMConfig) => {
  const { ollamaUrl, model, temperature = 0.7 } = config;

  /**
   * Generate text/JSON from the LLM
   */
  const generate = async (options: LLMGenerateOptions): Promise<string> => {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: options.prompt,
        stream: false,
        format: options.format,
        options: {
          temperature: options.temperature ?? temperature,
          num_ctx: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  };

  /**
   * Generate and parse JSON response
   */
  const generateJSON = async <T = unknown>(prompt: string): Promise<T> => {
    const response = await generate({ prompt, format: "json" });
    return JSON.parse(response) as T;
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
