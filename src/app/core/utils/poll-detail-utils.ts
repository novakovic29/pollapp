import { SupabaseClient } from '@supabase/supabase-js';
import { PollDetailView, QuestionDetail, AnswerOption, VoteRecord } from '../models/poll-detail.models';

export async function getPollById(client: SupabaseClient, id: string): Promise<PollDetailView> {
  const { data, error } = await client.from('surveys').select('*').eq('id', id).single();
  if (error) throw new Error('Poll load failed');
  return data as PollDetailView;
}

export async function getPollQuestions(client: SupabaseClient, id: string): Promise<QuestionDetail[]> {
  const { data, error } = await client.from('questions').select('*').eq('survey_id', id);
  if (error) throw new Error('Questions load failed');
  return (data as QuestionDetail[]) || [];
}

export async function getQuestionAnswers(client: SupabaseClient, questionId: number): Promise<AnswerOption[]> {
  const { data } = await client.from('answers').select('*').eq('question_id', questionId);
  return (data as AnswerOption[]) || [];
}

export async function getPollVotes(client: SupabaseClient, pollId: number): Promise<VoteRecord[]> {
  const { data, error } = await client.from('votes').select('option_id').eq('poll_id', pollId);
  if (error) throw new Error('Votes load failed');
  return (data as VoteRecord[]) || [];
}

export function applyVotePercentages(
  questions: QuestionDetail[],
  votes: VoteRecord[],
): QuestionDetail[] {
  const counts: Record<number, number> = {};
  for (const v of votes) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }
  for (const q of questions) {
    const total = q.answers.reduce((sum, a) => sum + (counts[a.id] || 0), 0);
    for (const a of q.answers) {
      const votesForAnswer = counts[a.id] || 0;
      a.percentage = total > 0 ? Math.round((votesForAnswer / total) * 100) : 0;
    }
  }
  return questions;
}
