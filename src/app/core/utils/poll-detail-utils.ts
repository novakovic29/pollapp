import { SupabaseClient } from '@supabase/supabase-js';
import { PollDetailView, QuestionDetail, AnswerOption, VoteRecord } from '../models/poll-detail.models';

/**
 * Fetches a single poll by its id.
 * @throws When the Supabase query fails.
 */
export async function getPollById(client: SupabaseClient, id: string): Promise<PollDetailView> {
  const { data, error } = await client.from('surveys').select('*').eq('id', id).single();
  if (error) throw new Error('Poll load failed');
  return data as PollDetailView;
}

/**
 * Fetches all questions belonging to a poll.
 * @throws When the Supabase query fails.
 */
export async function getPollQuestions(client: SupabaseClient, id: string): Promise<QuestionDetail[]> {
  const { data, error } = await client.from('questions').select('*').eq('survey_id', id);
  if (error) throw new Error('Questions load failed');
  return (data as QuestionDetail[]) || [];
}

/**
 * Fetches all answer options for a single question.
 * Silently returns an empty array on error.
 */
export async function getQuestionAnswers(client: SupabaseClient, questionId: number): Promise<AnswerOption[]> {
  const { data } = await client.from('answers').select('*').eq('question_id', questionId);
  return (data as AnswerOption[]) || [];
}

/**
 * Fetches all votes cast for a poll.
 * @throws When the Supabase query fails.
 */
export async function getPollVotes(client: SupabaseClient, pollId: number): Promise<VoteRecord[]> {
  const { data, error } = await client.from('votes').select('option_id').eq('poll_id', pollId);
  if (error) throw new Error('Votes load failed');
  return (data as VoteRecord[]) || [];
}

/**
 * Mutates each answer's `percentage` field based on the provided vote records.
 * Percentages are calculated per-question so each question's votes sum to 100 %.
 *
 * @returns The same {@link questions} array with updated percentages.
 */
export function applyVotePercentages(questions: QuestionDetail[], votes: VoteRecord[]): QuestionDetail[] {
  const counts = buildVoteCounts(votes);
  for (const q of questions) {
    assignPercentages(q, counts);
  }
  return questions;
}

/** Builds a map of option_id → vote count from a flat list of vote records. */
function buildVoteCounts(votes: VoteRecord[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const v of votes) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }
  return counts;
}

/** Assigns vote percentages to each answer option of a single question. */
function assignPercentages(question: QuestionDetail, counts: Record<number, number>): void {
  const total = question.answers.reduce((sum, a) => sum + (counts[a.id] || 0), 0);
  for (const a of question.answers) {
    a.percentage = total > 0 ? Math.round(((counts[a.id] || 0) / total) * 100) : 0;
  }
}
