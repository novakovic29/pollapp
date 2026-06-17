import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class QuestionOptionService {
  constructor(private db: DatabaseService) {}

  async saveQuestionsWithOptions(pollId: number, questions: any[]) {
    for (const q of questions) {
      const { data: question } = await this.db.client
        .from('questions')
        .insert({
          survey_id: pollId,
          text: q.text,
          allow_multiple: q.allowMultiple,
        })
        .select()
        .single();

      await Promise.all(
        q.answers.map((a: any) =>
          this.db.client
            .from('answers')
            .insert({ question_id: question.id, text: a.text }),
        ),
      );
    }
  }
}
