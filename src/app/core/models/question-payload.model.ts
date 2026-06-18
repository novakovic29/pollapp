/** Payload shape used when creating a new question via the API. */
export interface QuestionPayload {
  /** Question text. */
  text: string;
  /** Answer options to create alongside the question. */
  answers: { text: string }[];
}
