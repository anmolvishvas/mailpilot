import type { AIProvider } from "./ai-provider.interface";
import { GeminiProvider } from "./gemini-provider";
import { OpenAIProvider } from "./openai-provider";
import { MockAIProvider } from "./mock-provider";

export function getAIProvider(): AIProvider {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return new GeminiProvider(process.env.GEMINI_API_KEY, process.env.AI_MODEL || "gemini-3.6-flash");
  }

  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().length > 0) {
    return new OpenAIProvider(process.env.OPENAI_API_KEY, process.env.AI_MODEL || "gpt-4o-mini");
  }

  return new MockAIProvider();
}
