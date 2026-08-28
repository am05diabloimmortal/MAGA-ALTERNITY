import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { PublicView } from '@/pages/PublicView';
import { EditorView } from '@/pages/EditorView';
import type { BoardState, ViewMode } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

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

  useEffect(() => {
    saveState(state);
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
