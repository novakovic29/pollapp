export interface AnswerOption {
  id: number;
  text: string;
  percentage?: number;
  selected?: boolean;
}

export interface QuestionDetail {
  id: number;
  text: string;
  answers: AnswerOption[];
  allow_multiple?: boolean;
}

export interface PollDetailView {
  id: string;
  name: string;
  description?: string;
  category: string | null;
  end_date: string | null;
  questions: QuestionDetail[];
}

export interface VoteRecord {
  option_id: number;
}
