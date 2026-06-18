/** A raw answer record as returned from the database. */
export interface PollAnswerRecord {
  /** Unique identifier. */
  id: string;
  /** Id of the parent question. */
  question_id: string;
  /** Answer text. */
  text: string;
  /** Total votes received (optional aggregation field). */
  votes?: number;
}
