import { SupabaseClient } from '@supabase/supabase-js';
import { PollDetailView, QuestionDetail, AnswerOption, VoteRecord } from '../models/poll-detail.models';

/**
 * Fetches a single poll by its id.
 *
 * @param client - The Supabase client instance to query with.
 * @param id - The string id of the poll to load.
 * @returns The matching poll record as a {@link PollDetailView}.
 * @throws When the Supabase query fails.
 */
export async function getPollById(client: SupabaseClient, id: string): Promise<PollDetailView> {
  const { data, error } = await client.from('surveys').select('*').eq('id', id).single();
  if (error) throw new Error('Poll load failed');
  return data as PollDetailView;
}

/**
 * Fetches all questions belonging to a poll.
 *
 * @param client - The Supabase client instance to query with.
 * @param id - The string id of the parent poll.
 * @returns An array of {@link QuestionDetail} objects, or an empty array if none exist.
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
 *
 * @param client - The Supabase client instance to query with.
 * @param questionId - The numeric id of the parent question.
 * @returns An array of {@link AnswerOption} objects, or an empty array on error.
 */
export async function getQuestionAnswers(client: SupabaseClient, questionId: number): Promise<AnswerOption[]> {
  const { data } = await client.from('answers').select('*').eq('question_id', questionId);
  return (data as AnswerOption[]) || [];
}

/**
 * Fetches all votes cast for a poll.
 *
 * @param client - The Supabase client instance to query with.
 * @param pollId - The numeric id of the poll.
 * @returns An array of {@link VoteRecord} objects, or an empty array if none exist.
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
 * @param questions - The list of questions whose answer percentages will be updated.
 * @param votes - Flat list of vote records used to compute counts.
 * @returns The same {@link questions} array with updated percentages.
 */
export function applyVotePercentages(questions: QuestionDetail[], votes: VoteRecord[]): QuestionDetail[] {
  const counts = buildVoteCounts(votes);
  for (const q of questions) {
    assignPercentages(q, counts);
  }
  return questions;
}

/**
 * Builds a map of option_id → vote count from a flat list of vote records.
 *
 * @param votes - The vote records to aggregate.
 * @returns A record mapping each option id to its total vote count.
 */
function buildVoteCounts(votes: VoteRecord[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const v of votes) {
    counts[v.option_id] = (counts[v.option_id] || 0) + 1;
  }
  return counts;
}

/**
 * Assigns vote percentages to each answer option of a single question.
 *
 * @param question - The question whose answer percentages will be set.
 * @param counts - A map of option_id → vote count produced by {@link buildVoteCounts}.
 */
function assignPercentages(question: QuestionDetail, counts: Record<number, number>): void {
  const total = question.answers.reduce((sum, a) => sum + (counts[a.id] || 0), 0);
  for (const a of question.answers) {
    a.percentage = total > 0 ? Math.round(((counts[a.id] || 0) / total) * 100) : 0;
  }
}
