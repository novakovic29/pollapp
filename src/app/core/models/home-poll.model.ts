/** Lightweight poll item used on the home page list. */
export interface HomePollItem {
  /** Unique identifier. */
  id: string;
  /** Display name. */
  name: string;
  /** Topic category, or null if uncategorised. */
  category: string | null;
  /** ISO date string of the end date, or null. */
  end_date: string | null;
  /** Human-readable time remaining, computed client-side. */
  endsIn?: string;
  /** True when the end date is in the past. */
  isPast?: boolean;
  /** True when the poll is still open. */
  isActive?: boolean;
}
