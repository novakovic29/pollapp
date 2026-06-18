/** A single answer option belonging to a question. */
export interface AnswerOption {
  /** Database id of the answer option. */
  id: number;
  /** Answer text displayed to the voter. */
  text: string;
  /** Percentage of total votes this option received (0–100). */
  percentage?: number;
  /** Whether the current user has selected this option. */
  selected?: boolean;
}

/** A question with its list of answer options. */
export interface QuestionDetail {
  /** Database id of the question. */
  id: number;
  /** Question text. */
  text: string;
  /** Answer options belonging to this question. */
  answers: AnswerOption[];
  /** When true the voter may select more than one answer. */
  allow_multiple?: boolean;
}

/** Full detail view of a poll including its questions and answers. */
export interface PollDetailView {
  /** Unique identifier of the poll. */
  id: string;
  /** Display name of the poll. */
  name: string;
  /** Optional description text. */
  description?: string;
  /** Topic category, or null if uncategorised. */
  category: string | null;
  /** ISO date string of the end date, or null. */
  end_date: string | null;
  /** Questions belonging to this poll. */
  questions: QuestionDetail[];
}

/** A single vote record as stored in the database. */
export interface VoteRecord {
  /** Id of the answer option that was voted for. */
  option_id: number;
}
