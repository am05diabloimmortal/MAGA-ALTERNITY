import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { PublicView } from '@/pages/PublicView';
import { EditorView } from '@/pages/EditorView';
import type { BoardState, ViewMode } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { loadBoardFromSupabase, saveBoardToSupabase } from '@/lib/supabase';

const VIEW_KEY = 'alternity-view';

export default function App() {
  const [state, setState] = useState<BoardState>(() => loadState());
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem(VIEW_KEY) as ViewMode) ?? 'editor';
    } catch {
      return 'editor';
    }
  });

  // On startup, try to load the saved 'main' board from Supabase.
  // If a saved Supabase state exists, use it (and refresh localStorage).
  // If no Supabase state exists yet, keep localStorage and push it to Supabase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await loadBoardFromSupabase();
      if (cancelled || !remote) return;
      setState(remote);
      saveState(remote);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // If localStorage has data but Supabase doesn't (first connect),
  // seed Supabase with the existing local state. Runs once on boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await loadBoardFromSupabase();
      if (cancelled) return;
      if (!remote) {
        // No Supabase state yet — upload the current local state as the initial state
        saveBoardToSupabase(state);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever state changes, save to both localStorage and Supabase.
  useEffect(() => {
    saveState(state);
    saveBoardToSupabase(state);
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, viewMode);
    } catch {
      // ignore
    }
  }, [viewMode]);

  const toggleView = () => {
    setViewMode((prev) => (prev === 'editor' ? 'public' : 'editor'));
  };

  return (
    <Shell viewMode={viewMode} onToggleView={toggleView}>
      {viewMode === 'editor' ? (
        <EditorView state={state} setState={setState} />
      ) : (
        <PublicView state={state} />
      )}
    </Shell>
  );
}
