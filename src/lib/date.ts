export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function differenceInCalendarDays(dateLeft: Date, dateRight: Date) {
  const day = 86_400_000;
  const left = Date.UTC(dateLeft.getUTCFullYear(), dateLeft.getUTCMonth(), dateLeft.getUTCDate());
  const right = Date.UTC(dateRight.getUTCFullYear(), dateRight.getUTCMonth(), dateRight.getUTCDate());
  return Math.round((left - right) / day);
}

export function formatDate(date: Date) {
  return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
}
