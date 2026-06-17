export function computeTimeRemaining(endDate: string | null): string {
  if (!endDate) return '';

  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);

  if (diff < 0) return 'Ended';
  if (diff === 0) return 'Ends today';
  return `${diff} days`;
}
