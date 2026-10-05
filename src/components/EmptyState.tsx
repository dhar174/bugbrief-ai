import React from 'react';
import { Bug, Sparkles, Terminal, FileCode, CheckCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_BUGS, SampleBug } from '../data/sampleBugs';

interface EmptyStateProps {
  onSelectSample: (sample: SampleBug) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample }) => {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[460px]">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
        <Bug className="w-7 h-7 text-sky-400 opacity-80" />
      </div>

      <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-1.5">
        No Bug Report Analyzed Yet
      </h3>
      <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
        Paste a messy defect log, Sentry error, or Slack thread on the left and click{' '}
        <span className="text-sky-300 font-medium">Analyze Bug</span>, or test one of the real-world samples below.
      </p>

      {/* Feature Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mb-8 text-[11px] font-mono text-zinc-400">
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-300">
          ✓ Severity Assessment
        </span>
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-300">
          ✓ Likely Component
        </span>
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-300">
          ✓ Reproduction Steps
        </span>
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-300">
          ✓ Investigation Checklist
        </span>
        <span className="px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-zinc-300">
          ✓ Export Markdown
        </span>
      </div>

      {/* Quick Sample Cards */}
      <div className="w-full max-w-lg">
        <div className="text-[11px] font-mono uppercase text-zinc-400 mb-2.5 text-left">
          Or try an instant sample:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {SAMPLE_BUGS.slice(0, 2).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className="p-3 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-sky-500/40 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  {sample.category}
                </span>
                <span
                  className={`text-[9px] font-mono px-1 py-0.5 rounded border ${
                    sample.severityLabel === 'Critical'
                      ? 'text-red-400 border-red-500/30'
                      : 'text-orange-400 border-orange-500/30'
                  }`}
                >
                  {sample.severityLabel}
                </span>
              </div>
              <div className="text-xs font-medium text-zinc-200 group-hover:text-sky-300 transition-colors flex items-center justify-between">
                <span>{sample.name}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-sky-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
