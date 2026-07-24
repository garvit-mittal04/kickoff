export type Message = { role: 'system' | 'user' | 'assistant'; content: string };

const MODEL = '@cf/meta/llama-3.2-3b-instruct';

export interface AIBinding {
  run(model: string, input: { messages: Message[]; max_tokens?: number; temperature?: number }): Promise<{ response?: string; result?: { response?: string } }>;
}

export async function callAI(
  ai: AIBinding,
  messages: Message[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const { maxTokens = 1024, temperature = 0.7 } = opts;
  const result = await ai.run(MODEL, {
    messages,
    max_tokens: maxTokens,
    temperature,
  });
  const text = (result as any).response ?? (result as any).result?.response ?? '';
  if (!text || typeof text !== 'string') {
    throw new Error('empty_ai_response');
  }
  return text.trim();
}
