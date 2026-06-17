import { HomePollItem } from '../models/home-poll.model';

export function getSoonestPerCategory(polls: HomePollItem[]): HomePollItem[] {
  const map = new Map<string, HomePollItem>();
  for (const s of polls) {
    const cat = s.category ?? 'Uncategorized';
    const end = s.end_date ? new Date(s.end_date).getTime() : Infinity;
    const existing = map.get(cat);
    const existingEnd = existing?.end_date ? new Date(existing.end_date).getTime() : Infinity;
    if (!existing || end < existingEnd) {
      map.set(cat, s);
    }
  }
  return Array.from(map.values());
}

export function partitionPollsByDate(polls: HomePollItem[]) {
  return {
    activePolls: polls.filter((s) => s.isActive),
    pastPolls: polls.filter((s) => s.isPast),
  };
}

export function buildHomePollData(polls: HomePollItem[]) {
  if (!polls?.length)
    return { soonEnding: [], activePolls: [], pastPolls: [], categoryCards: [] };

  const soonEnding = getSoonestPerCategory(polls).filter((s) => !!s.end_date);
  const { activePolls, pastPolls } = partitionPollsByDate(polls);

  return {
    soonEnding,
    activePolls,
    pastPolls,
    categoryCards: [...polls],
  };
}

function groupByCategory(polls: HomePollItem[], category: string): HomePollItem[] {
  return polls.filter((s) => (s.category ?? 'Uncategorized') === category);
}

function divideByStatus(polls: HomePollItem[]): { active: HomePollItem[]; past: HomePollItem[] } {
  return {
    active: polls.filter((s) => s.isActive),
    past: polls.filter((s) => s.isPast),
  };
}

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
