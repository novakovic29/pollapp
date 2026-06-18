import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Poll } from '../models/poll.model';

/** Handles CRUD operations for polls (surveys table). */
@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(private db: DatabaseService) {}

  /**
   * Fetches all polls ordered by end date ascending.
   * @throws When the Supabase query fails.
   */
  async getAllPolls(): Promise<Poll[]> {
    const { data, error } = await this.db.client
      .from('surveys')
      .select('*')
      .order('end_date', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Inserts a new poll record and returns its generated id.
   * @throws When the Supabase insert fails.
   */
  async createPoll(poll: Omit<Poll, 'id' | 'endsIn'>): Promise<number> {
    const { data, error } = await this.db.client
      .from('surveys')
      .insert([poll])
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }
}
