import Anthropic from '@anthropic-ai/sdk';
import type { CorrectionRecord } from '../db/corrections';
import { getApiKey, getSettings } from './settings';

const BASE_SYSTEM_PROMPT = `Fix grammar, spelling, and awkward phrasing. Preserve the author's voice and intent. Return ONLY the corrected text, nothing else. Do not add explanations, quotes, or markdown.`;

export type FixTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export type SummarizeProfileResult =
  | { ok: true; profile: string }
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

function createClient(): Anthropic | null {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  return new Anthropic({ apiKey });
}

function buildFixSystemPrompt(styleProfile: string): string {
  const profile = styleProfile.trim();
  if (!profile) {
    return BASE_SYSTEM_PROMPT;
  }

  return `${BASE_SYSTEM_PROMPT}

Author style profile (follow these preferences when correcting):
${profile}`;
}

function formatCorrectionExamples(records: CorrectionRecord[]): string {
  return records
    .map(
      (record, index) =>
        `${index + 1}. Original: """${record.original_text}"""\n   Corrected: """${record.corrected_text}"""`
    )
    .join('\n\n');
}

export async function fixText(
  original: string,
  styleProfile = ''
): Promise<FixTextResult> {
  const client = createClient();
  if (!client) {
    return {
      ok: false,
      error: 'API key not set (use ANTHROPIC_API_KEY for now)',
    };
  }

  const { model } = getSettings();

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 4096,
      system: buildFixSystemPrompt(styleProfile),
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

export async function summarizeStyleProfile(input: {
  accepted: CorrectionRecord[];
  rejected: CorrectionRecord[];
  previousProfile: string;
}): Promise<SummarizeProfileResult> {
  const client = createClient();
  if (!client) {
    return { ok: false, error: 'API key not set' };
  }

  if (input.accepted.length === 0 && input.rejected.length === 0) {
    return { ok: false, error: 'No corrections to summarize' };
  }

  const { model } = getSettings();
  const sections: string[] = [
    'Here are examples of text this user wrote and how it was corrected.',
    'Identify recurring patterns: common typos, grammar habits, tone/voice preferences, phrases they overuse, and intentional style choices that should NOT be changed.',
    'Output a concise style profile as bullet points (max 12 bullets). Merge with the previous profile rather than growing unbounded.',
  ];

  if (input.previousProfile.trim()) {
    sections.push(
      `Previous profile to refine:\n${input.previousProfile.trim()}`
    );
  }

  if (input.accepted.length > 0) {
    sections.push(
      `Accepted corrections:\n${formatCorrectionExamples(input.accepted)}`
    );
  }

  if (input.rejected.length > 0) {
    sections.push(
      `Rejected corrections (user undid these — avoid repeating these changes):\n${formatCorrectionExamples(input.rejected)}`
    );
  }

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system:
        'You analyze writing correction history and produce a concise personal style profile. Return only bullet points, no preamble.',
      messages: [{ role: 'user', content: sections.join('\n\n') }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return { ok: false, error: 'Empty profile response' };
    }

    const profile = normalizeLlmOutput(textBlock.text);
    if (!profile) {
      return { ok: false, error: 'Empty profile' };
    }

    return { ok: true, profile };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Profile summarization failed';
    return { ok: false, error: message };
  }
}
