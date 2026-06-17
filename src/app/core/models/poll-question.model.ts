export interface PollQuestion {
  id: string;
  survey_id: string;
  text: string;
  type: 'single' | 'multiple' | 'text';
}
