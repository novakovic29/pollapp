import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

/** Handles inserting vote records into the database. */
@Injectable({ providedIn: 'root' })
export class UserVoteService {
  constructor(private db: DatabaseService) {}

  /**
   * Records a single vote for an answer option.
   *
   * @param payload - Poll id, question id, and option id to record.
   * @throws When the Supabase insert fails.
   */
  async castVote(payload: { poll_id: number; question_id: number; option_id: number }): Promise<void> {
    const { error } = await this.db.client.from('votes').insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
