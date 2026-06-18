/**
 * Returns a human-readable string describing the time remaining until {@link endDate}.
 *
 * @param endDate - ISO date string, or null if the poll has no deadline.
 * @returns `''` for no deadline · `'Ended'` for past dates · `'Ends today'` for today · `'N days'` otherwise.
 */
export function computeTimeRemaining(endDate: string | null): string {
  if (!endDate) return '';
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Ended';
  if (diff === 0) return 'Ends today';
  return `${diff} days`;
}
