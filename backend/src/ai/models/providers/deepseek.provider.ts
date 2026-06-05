import type { ProviderConfig, LLMProviderClient, GenerateRequest } from "./types";

type DeepSeekChoice = {
  message?: { content?: string };
};

type DeepSeekResponse = {
  choices?: DeepSeekChoice[];
};

/**
 * DeepSeek provider — OpenAI-compatible Chat Completions API.
 *
 * Same wire shape as OpenAI (`Bearer` auth, `choices[0].message.content`),
 * so it talks to `${baseURL}/chat/completions` with the model tag passed
 * straight through (e.g. `deepseek-v4-flash`, `deepseek-v4-pro`).
 *
 * Opts into native JSON mode (`response_format: json_object`) when the
 * request asks for JSON — DeepSeek enforces valid JSON output, which is far
 * more reliable than prompt instructions alone.
 *
 * V4 models default to thinking mode, which streams a chain-of-thought into
 * a separate `reasoning_content` field and adds noticeable latency on every
 * call. The decision loop drives a real-time game and only consumes the final
 * `content`, so we explicitly disable thinking (`thinking.type: "disabled"`)
 * for responsiveness. DeepSeek's docs show this under the OpenAI SDK's
 * `extra_body`; over raw HTTP it's a top-level request field.
 */
export const createDeepSeekProvider = (config: ProviderConfig): LLMProviderClient => {
  const { apiKey, model, baseURL, httpClient } = config;

  return {
    generate: async (request: GenerateRequest) => {
      const data = await httpClient.postJson<DeepSeekResponse>(
        `${baseURL}/chat/completions`,
        {
          model,
          messages: [{ role: "user", content: request.prompt }],
          temperature: request.temperature,
          thinking: { type: "disabled" },
          ...(request.maxTokens ? { max_tokens: request.maxTokens } : {}),
          ...(request.format === "json" ? { response_format: { type: "json_object" } } : {}),
        },
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          source: "DeepSeek",
        },
      );

      const content = data.choices?.[0]?.message?.content ?? "";

      return { content };
    },
  };
};
