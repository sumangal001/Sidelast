import {
  PROFILE_CORRECTION_SAMPLE_SIZE,
  PROFILE_SUMMARIZE_EVERY,
} from '../../shared/style-config';
import {
  countCorrectionsSince,
  getCorrectionsForSummarization,
  getLatestCorrectionId,
} from '../db/corrections';
import { getProfile, getStyleProfileContent, saveProfile } from '../db/profile';
import { summarizeStyleProfile } from './llm';
import { getAutoLearn } from './settings';

let summarizationInProgress = false;

export function getCurrentStyleProfile(): string {
  return getStyleProfileContent();
}

export function onCorrectionLogged(correctionId: number): void {
  if (!getAutoLearn()) {
    return;
  }

  const profile = getProfile();
  const pending = countCorrectionsSince(profile.last_correction_id);

  if (pending >= PROFILE_SUMMARIZE_EVERY) {
    void runProfileSummarization(correctionId);
  }
}

export async function runProfileSummarization(
  upToCorrectionId?: number
): Promise<void> {
  if (!getAutoLearn() || summarizationInProgress) {
    return;
  }

  summarizationInProgress = true;

  try {
    const previousProfile = getStyleProfileContent();
    const { accepted, rejected } = getCorrectionsForSummarization(
      PROFILE_CORRECTION_SAMPLE_SIZE
    );

    const result = await summarizeStyleProfile({
      accepted,
      rejected,
      previousProfile,
    });

    if (!result.ok) {
      console.warn('[style] Profile summarization skipped:', result.error);
      return;
    }

    const lastCorrectionId = upToCorrectionId ?? getLatestCorrectionId();
    saveProfile(result.profile, lastCorrectionId);
    console.log(
      `[style] Updated profile from ${accepted.length} accepted / ${rejected.length} rejected corrections`
    );
  } catch (error) {
    console.error('[style] Profile summarization failed', error);
  } finally {
    summarizationInProgress = false;
  }
}
