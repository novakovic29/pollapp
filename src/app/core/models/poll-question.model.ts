/** A raw question record as returned from the database. */
export interface PollQuestion {
  /** Unique identifier. */
  id: string;
  /** Id of the parent survey. */
  survey_id: string;
  /** Question text. */
  text: string;
  /** Question type: single-choice, multiple-choice, or free text. */
  type: 'single' | 'multiple' | 'text';
}
