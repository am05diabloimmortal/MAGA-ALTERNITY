import { useState } from 'react';
import { FileUp, X } from 'lucide-react';
import type { Player } from '@/lib/types';
import { parseCsvImport } from '@/lib/store';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (players: Player[]) => void;
}

const SAMPLE = `numbering,Name,Level,Class,Resonance,My Rank
1,Malthael#1188,60,Necromancer,8800,1
2,Barbarosa#2241,60,Barbarian,7600,2
3,Imperius#3390,60,Crusader,7200,3`;

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Player[] | null>(null);
  const [skipped, setSkipped] = useState(0);

  if (!open) return null;

  const handleProcess = () => {
    const { players, skipped: sk } = parseCsvImport(text);
    setPreview(players);
    setSkipped(sk);
  };

  const handleConfirm = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
    }
    setText('');
    setPreview(null);
    setSkipped(0);
    onClose();
  };

  const handleClose = () => {
    setText('');
    setPreview(null);
    setSkipped(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-obsidian-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="card-surface flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-obsidian-700/60 bg-obsidian-900/50 px-5 py-3">
          <h2 className="flex items-center gap-2 font-display text-base font-bold tracking-wide text-obsidian-50">
            <FileUp className="h-5 w-5 text-emerald-300" />
            Bulk Import Roster
          </h2>
          <button onClick={handleClose} className="text-obsidian-400 hover:text-obsidian-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-3 text-sm text-obsidian-300">
            Paste raw text from Diablo Immortal's <span className="font-semibold text-obsidian-100">"Export Member Data as CSV"</span> feature.
            The header row is ignored. Names, Classes, and Resonance are parsed; CR defaults to 0 and Role to DPS.
            All imported players go into the <span className="font-semibold text-obsidian-100">Reserved</span> standby pool.
          </p>
          <div className="mb-3 flex items-start gap-2 rounded-md border border-crimson-700/50 bg-crimson-900/20 px-3 py-2 text-xs text-crimson-200">
            <span className="font-bold uppercase tracking-wide">Warning</span>
            <span>Confirming an import <span className="font-bold">completely wipes and replaces</span> all existing player data with the new clipboard contents.</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="input font-mono text-xs leading-relaxed"
            placeholder={SAMPLE}
            aria-label="Paste CSV export data"
          />

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={() => setText(SAMPLE)}
              className="text-xs text-obsidian-400 hover:text-obsidian-200"
            >
              Load sample data
            </button>
            <button
              onClick={handleProcess}
              disabled={!text.trim()}
              className="btn-primary"
            >
              <FileUp className="h-4 w-4" />
              Process Import
            </button>
          </div>

          {preview !== null && (
            <div className="mt-4 animate-fade-in">
              <div className="mb-2 flex items-center gap-3 text-sm">
                <span className="font-semibold text-emerald-300">
                  {preview.length} player{preview.length !== 1 ? 's' : ''} ready
                </span>
                {skipped > 0 && (
                  <span className="text-amber-300">{skipped} line(s) skipped</span>
                )}
              </div>

              {preview.length > 0 ? (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-obsidian-700/50 bg-obsidian-900/40 p-2">
                  {preview.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded px-2 py-1 text-xs"
                    >
                      <span className="font-semibold text-obsidian-100">{p.name}</span>
                      <span className="text-obsidian-300">
                        {p.class} · Res {p.resonance.toLocaleString()} · DPS
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-sm text-amber-200">
                  No valid players found. Make sure the data includes a header row followed by comma-separated lines.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-obsidian-700/60 bg-obsidian-900/40 px-5 py-3">
          <button onClick={handleClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!preview || preview.length === 0}
            className="btn-primary"
          >
            Import {preview ? preview.length : 0} Player{(preview?.length ?? 0) !== 1 ? 's' : ''} (Overwrites All)
          </button>
        </div>
      </div>
    </div>
  );
}
