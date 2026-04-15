import type { ProviderConfig, LLMProviderClient, GenerateRequest } from "./types";

export const createOllamaProvider = (config: ProviderConfig): LLMProviderClient => {
  const { model, baseURL } = config;

  return {
    generate: async (request: GenerateRequest) => {
      const url = `${baseURL}/api/chat`;

      const body: Record<string, unknown> = {
        model,
        messages: [{ role: "user", content: request.prompt }],
        stream: false,
        options: {
          temperature: request.temperature,
          ...(request.maxTokens ? { num_ctx: request.maxTokens } : {}),
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Ollama API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const content = data.message?.content ?? "";

      return { content };
    },
  };
};
