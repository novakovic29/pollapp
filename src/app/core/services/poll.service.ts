import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { Poll } from '../models/poll.model';

@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(private db: DatabaseService) {}

  async getAllPolls(): Promise<Poll[]> {
    const { data, error } = await this.db.client
      .from('surveys')
      .select('*')
      .order('end_date', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

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
