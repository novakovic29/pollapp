/** Represents a poll as returned from the database. */
export interface Poll {
  /** Unique identifier of the poll. */
  id: string;
  /** Display name of the poll. */
  name: string;
  /** Topic category, or null if uncategorised. */
  category: string | null;
  /** ISO date string of the end date, or null if the poll has no deadline. */
  end_date: string | null;
  /** Human-readable time remaining, computed client-side. */
  endsIn?: string;
  /** Optional description text. */
  description?: string;
  /** True when the end date is in the past. */
  isPast?: boolean;
  /** True when the poll is still open for voting. */
  isActive?: boolean;
}
