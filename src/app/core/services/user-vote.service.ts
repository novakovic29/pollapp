import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class UserVoteService {
  constructor(private db: DatabaseService) {}

  async castVote(payload: { poll_id: number; question_id: number; option_id: number }): Promise<void> {
    const { error } = await this.db.client.from('votes').insert({
      ...payload,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
