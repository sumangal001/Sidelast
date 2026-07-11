import Anthropic from '@anthropic-ai/sdk';
import { getApiKey, getSettings } from './settings';

const BASE_SYSTEM_PROMPT = `Fix grammar, spelling, and awkward phrasing. Preserve the author's voice and intent. Return ONLY the corrected text, nothing else. Do not add explanations, quotes, or markdown.`;

export type FixTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

function normalizeLlmOutput(text: string): string {
  let result = text.trim();

  if (result.startsWith('```')) {
    result = result.replace(/^```[\w-]*\n?/, '').replace(/\n?```$/, '').trim();
  }

  if (
    (result.startsWith('"') && result.endsWith('"')) ||
    (result.startsWith("'") && result.endsWith("'"))
  ) {
    result = result.slice(1, -1).trim();
  }

  return result;
}

export async function fixText(original: string): Promise<FixTextResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: 'API key not set (use ANTHROPIC_API_KEY for now)',
    };
  }

  const { model } = getSettings();
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: BASE_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: original }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return { ok: false, error: 'Empty LLM response' };
    }

    const corrected = normalizeLlmOutput(textBlock.text);
    if (!corrected) {
      return { ok: false, error: 'Empty correction' };
    }

    return { ok: true, text: corrected };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'LLM request failed';
    return { ok: false, error: message };
  }
}
