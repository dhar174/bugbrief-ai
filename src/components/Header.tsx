import React from 'react';
import { Bug, History, PlusCircle, Sparkles, Terminal } from 'lucide-react';
import { TriageHistoryItem } from '../types';
import { ModelSelector } from './ModelSelector';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
  onNewTriage: () => void;
  recentItems: TriageHistoryItem[];
  onSelectHistoryItem: (item: TriageHistoryItem) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
  onNewTriage,
  recentItems,
  onSelectHistoryItem,
  selectedModel,
  onSelectModel,
  isLoading,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-emerald-500/20 border border-zinc-700/80 flex items-center justify-center text-sky-400 shadow-inner shrink-0">
              <Bug className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                  BugBrief <span className="text-sky-400 font-mono">AI</span>
                </h1>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  v1.0 Triage Engine
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Turn chaos into an actionable bug report.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Gemini Flash Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
              disabled={isLoading}
            />

            {recentItems.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800/90 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-all focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Recent</span>
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center text-sky-400">
                    {historyCount}
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onNewTriage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-sky-500"
              title="Reset form for a new bug report"
            >
              <PlusCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>New Triage</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
