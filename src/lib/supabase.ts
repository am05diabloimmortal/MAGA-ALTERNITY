import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { BoardState } from './types';
import { ROOMS } from './types';

const BOARD_ID = 'main';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    client = createClient(supabaseUrl, supabaseKey);
  } catch {
    client = null;
  }
}

export function isSupabaseConfigured(): boolean {
  return client !== null;
}

/**
 * Load the 'main' board from Supabase. Returns null if Supabase is not
 * configured, the row doesn't exist, or the request fails — caller falls
 * back to localStorage in that case.
 */
export async function loadBoardFromSupabase(): Promise<BoardState | null> {
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('planner_state')
      .select('state')
      .eq('id', BOARD_ID)
      .maybeSingle();

    if (error || !data) return null;

    const parsed = data.state as BoardState;
    if (!parsed || !Array.isArray(parsed.players)) return null;
    return { ...parsed, rooms: ROOMS };
  } catch {
    return null;
  }
}

/**
 * Save the board state to Supabase (upsert on id='main').
 * Swallows errors so the app keeps working even if Supabase is down.
 */
export async function saveBoardToSupabase(state: BoardState): Promise<void> {
  if (!client) return;
  try {
    await client
      .from('planner_state')
      .upsert(
        { id: BOARD_ID, state: state as unknown as Record<string, unknown>, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      );
  } catch {
    // Supabase unavailable — localStorage is the fallback, ignore
  }
}
