import React from 'react';
import { TriageHistoryItem } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { X, Trash2, Clock, ArrowRight, Layers, Bug } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: TriageHistoryItem[];
  onSelectItem: (item: TriageHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  currentReportTitle?: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  currentReportTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              Recent Bug Triage Reports
            </h3>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
              {items.length} / 5 stored
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of items */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-zinc-800/40">
          {items.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No recent triage history stored yet.
            </div>
          ) : (
            items.map((item) => {
              const isSelected = item.report.concise_title === currentReportTitle;
              const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className={`pt-2.5 first:pt-0 p-3 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
                    isSelected
                      ? 'bg-sky-950/20 border-sky-500/40'
                      : 'bg-zinc-950/40 border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-950/80'
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      onSelectItem(item);
                      onClose();
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <SeverityBadge severity={item.report.severity} size="sm" />
                      <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {item.report.likely_component}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">· {dateStr}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-sky-300 transition-colors">
                      {item.report.concise_title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                      {item.report.symptom_summary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                      title="Load this report"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              Stores up to 5 most recent reports locally
            </span>
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
