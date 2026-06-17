export interface PollAnswerRecord {
  id: string;
  question_id: string;
  text: string;
  votes?: number;
}
