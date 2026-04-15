import type { ProviderConfig, LLMProviderClient, GenerateRequest } from "./types";

export const createGeminiProvider = (config: ProviderConfig): LLMProviderClient => {
  const { apiKey, model, baseURL } = config;

  return {
    generate: async (request: GenerateRequest) => {
      const url = `${baseURL}/v1beta/models/${model}:generateContent`;

      const body: Record<string, unknown> = {
        contents: [{ parts: [{ text: request.prompt }] }],
        generationConfig: {
          temperature: request.temperature,
          ...(request.maxTokens ? { maxOutputTokens: request.maxTokens } : {}),
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const parts: Array<{ text?: string; thought?: boolean }> =
        data.candidates?.[0]?.content?.parts ?? [];
      // Gemini 2.5 thinking models return thought parts separately — skip them
      const contentParts = parts.filter((p) => !p.thought);
      const content = contentParts.map((p) => p.text ?? "").join("");

      return { content };
    },
  };
};
