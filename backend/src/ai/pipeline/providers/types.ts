export type LLMProvider = "gemini" | "openai" | "anthropic" | "ollama";

export type ProviderConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
};

export type GenerateRequest = {
  prompt: string;
  temperature: number;
  maxTokens?: number;
};

export type GenerateResponse = {
  content: string;
};

export type LLMProviderClient = {
  generate: (request: GenerateRequest) => Promise<GenerateResponse>;
};
