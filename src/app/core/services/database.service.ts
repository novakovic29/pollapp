import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/** Provides a singleton Supabase client scoped to the application lifetime. */
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  /** The configured Supabase client instance. */
  get client(): SupabaseClient {
    return this.supabase;
  }
}
