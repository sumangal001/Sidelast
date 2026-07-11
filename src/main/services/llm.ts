import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CorrectionRecord } from '../db/corrections';
import type { LlmProvider } from '../../shared/providers';
import { getApiKey, getModel, getProvider } from './settings';

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

function missingKeyMessage(provider: LlmProvider): string {
  if (provider === 'groq') {
    return 'API key not set — get free key at console.groq.com';
  }
  if (provider === 'gemini') {
    return 'API key not set — get free key at aistudio.google.com';
  }
  return 'API key not set — add Anthropic key in Settings';
}

async function callGroq(system: string, user: string): Promise<FixTextResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: missingKeyMessage('groq') };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: `Groq error ${response.status}: ${body.slice(0, 120)}` };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = normalizeLlmOutput(data.choices?.[0]?.message?.content ?? '');
  return text ? { ok: true, text } : { ok: false, error: 'Empty Groq response' };
}

async function callGeminiRest(
  system: string,
  user: string,
  apiKey: string
): Promise<FixTextResult> {
  const model = getModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: `Gemini error ${response.status}: ${body.slice(0, 120)}` };
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = normalizeLlmOutput(
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  );
  return text ? { ok: true, text } : { ok: false, error: 'Empty Gemini response' };
}

async function callGemini(system: string, user: string): Promise<FixTextResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: missingKeyMessage('gemini') };
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: getModel(),
      systemInstruction: system,
    });
    const response = await model.generateContent(user);
    const text = normalizeLlmOutput(response.response.text());
    if (text) {
      return { ok: true, text };
    }
  } catch {
    // Fall through to REST API (works with more key formats)
  }

  return callGeminiRest(system, user, apiKey);
}

async function callAnthropic(
  system: string,
  user: string,
  maxTokens: number
): Promise<FixTextResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, error: missingKeyMessage('anthropic') };
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: getModel(),
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return { ok: false, error: 'Empty LLM response' };
  }

  const text = normalizeLlmOutput(textBlock.text);
  return text ? { ok: true, text } : { ok: false, error: 'Empty response' };
}

async function callLlm(
  system: string,
  user: string,
  maxTokens = 4096
): Promise<FixTextResult> {
  const provider = getProvider();

  try {
    if (provider === 'groq') {
      return await callGroq(system, user);
    }
    if (provider === 'gemini') {
      return await callGemini(system, user);
    }
    return await callAnthropic(system, user, maxTokens);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'LLM request failed';
    return { ok: false, error: message };
  }
}

export async function fixText(
  original: string,
  styleProfile = ''
): Promise<FixTextResult> {
  if (!original.trim()) {
    return { ok: false, error: 'No text to fix' };
  }
  return callLlm(buildFixSystemPrompt(styleProfile), original);
}

export async function summarizeStyleProfile(input: {
  accepted: CorrectionRecord[];
  rejected: CorrectionRecord[];
  previousProfile: string;
}): Promise<SummarizeProfileResult> {
  if (input.accepted.length === 0 && input.rejected.length === 0) {
    return { ok: false, error: 'No corrections to summarize' };
  }

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

  const result = await callLlm(
    'You analyze writing correction history and produce a concise personal style profile. Return only bullet points, no preamble.',
    sections.join('\n\n'),
    1024
  );

  if (!result.ok) {
    return result;
  }

  return { ok: true, profile: result.text };
}
