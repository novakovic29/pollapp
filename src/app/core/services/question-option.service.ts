import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

/** Persists questions and their answer options to the database. */
@Injectable({ providedIn: 'root' })
export class QuestionOptionService {
  constructor(private db: DatabaseService) {}

  /**
   * Inserts each question for a poll, then inserts its answer options in parallel.
   *
   * @param pollId - Id of the parent poll.
   * @param questions - Array of question objects with nested answer arrays.
   */
  async saveQuestionsWithOptions(pollId: number, questions: any[]): Promise<void> {
    for (const q of questions) {
      await this.saveQuestion(pollId, q);
    }
  }

  /** Inserts a single question and its answer options in parallel. */
  private async saveQuestion(pollId: number, q: any): Promise<void> {
    const { data: question } = await this.db.client
      .from('questions')
      .insert({ survey_id: pollId, text: q.text, allow_multiple: q.allowMultiple })
      .select()
      .single();
    await Promise.all(
      q.answers.map((a: any) =>
        this.db.client.from('answers').insert({ question_id: question.id, text: a.text }),
      ),
    );
  }
}
