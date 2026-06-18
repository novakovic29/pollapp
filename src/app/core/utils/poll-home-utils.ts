import { HomePollItem } from '../models/home-poll.model';

/**
 * Returns one poll per category — the one with the earliest end date.
 * Polls without a category are grouped under `'Uncategorized'`.
 *
 * @param polls - The full list of polls to group.
 * @returns One representative poll per category, sorted by earliest end date.
 */
export function getSoonestPerCategory(polls: HomePollItem[]): HomePollItem[] {
  const map = new Map<string, HomePollItem>();
  for (const s of polls) {
    const cat = s.category ?? 'Uncategorized';
    const end = s.end_date ? new Date(s.end_date).getTime() : Infinity;
    const existing = map.get(cat);
    const existingEnd = existing?.end_date ? new Date(existing.end_date).getTime() : Infinity;
    if (!existing || end < existingEnd) map.set(cat, s);
  }
  return Array.from(map.values());
}

/**
 * Splits a flat poll list into active and past sub-lists.
 *
 * @param polls - The full list of polls to partition.
 * @returns An object with `activePolls` and `pastPolls` arrays.
 */
export function partitionPollsByDate(polls: HomePollItem[]) {
  return {
    activePolls: polls.filter((s) => s.isActive),
    pastPolls: polls.filter((s) => s.isPast),
  };
}

/**
 * Derives all data needed by the home page from a raw poll list.
 * Returns empty arrays when the input is empty or nullish.
 *
 * @param polls - The raw list of enriched polls from the database.
 * @returns An object with `soonEnding`, `activePolls`, `pastPolls`, and `categoryCards` arrays.
 */
export function buildHomePollData(polls: HomePollItem[]) {
  if (!polls?.length)
    return { soonEnding: [], activePolls: [], pastPolls: [], categoryCards: [] };

  const soonEnding = getSoonestPerCategory(polls).filter((s) => !!s.end_date);
  const { activePolls, pastPolls } = partitionPollsByDate(polls);
  return { soonEnding, activePolls, pastPolls, categoryCards: [...polls] };
}

/**
 * Returns only the polls whose category matches {@link category}.
 *
 * @param polls - The list of polls to filter.
 * @param category - The category name to match against.
 * @returns Polls whose category equals {@link category}.
 */
function groupByCategory(polls: HomePollItem[], category: string): HomePollItem[] {
  return polls.filter((s) => (s.category ?? 'Uncategorized') === category);
}

/**
 * Splits a poll list into active and past buckets.
 *
 * @param polls - The list of polls to divide.
 * @returns An object with `active` and `past` arrays.
 */
function divideByStatus(polls: HomePollItem[]): { active: HomePollItem[]; past: HomePollItem[] } {
  return {
    active: polls.filter((s) => s.isActive),
    past: polls.filter((s) => s.isPast),
  };
}

/**
 * Filters polls by category and active tab, returning separate active/past lists.
 * Returns empty lists when {@link category} is falsy.
 *
 * @param polls - The full list of polls to filter.
 * @param category - The category to filter by; empty string resets to no filter.
 * @param activeTab - Which tab is visible (`'active'` or `'past'`).
 * @returns An object with `activePolls` and `pastPolls` arrays for the current view.
 */
export function filterPollsByCategory(
  polls: HomePollItem[],
  category: string,
  activeTab: 'active' | 'past',
) {
  if (!category) return { activePolls: [], pastPolls: [] };
  const filtered = groupByCategory(polls, category);
  const { active, past } = divideByStatus(filtered);
  return activeTab === 'active'
    ? { activePolls: active, pastPolls: [] }
    : { activePolls: [], pastPolls: past };
}
