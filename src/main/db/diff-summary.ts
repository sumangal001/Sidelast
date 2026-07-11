export function buildDiffSummary(original: string, corrected: string): string {
  if (original.trim() === corrected.trim()) {
    return 'No visible changes';
  }

  const delta = corrected.length - original.length;
  if (delta === 0) {
    return 'Same length; wording revised';
  }

  const sign = delta > 0 ? '+' : '';
  return `Length ${sign}${delta} chars; wording revised`;
}
