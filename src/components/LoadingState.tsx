import React, { useEffect, useState } from 'react';
import { Sparkles, Terminal, Activity, Layers, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Ingesting raw defect logs and error traces...',
  'Extracting failure signature & likely subsystem...',
  'Evaluating blast radius & determining severity level...',
  'Synthesizing reproduction steps & root cause hypotheses...',
  'Generating investigation checklist & regression test matrix...',
];

export const LoadingState: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6 animate-pulse">
      {/* Loading Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-200">
            Gemini Engineering Triage in Progress
          </div>
          <div className="text-xs text-sky-400 font-mono mt-0.5">
            {STEPS[currentStepIdx]}
          </div>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIdx;
          const isCurrent = idx === currentStepIdx;
          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs font-mono transition-opacity ${
                isDone
                  ? 'text-emerald-400 opacity-90'
                  : isCurrent
                  ? 'text-sky-300 opacity-100 font-medium'
                  : 'text-zinc-600 opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Shimmer Placeholder Cards */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="h-20 bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4 space-y-2">
          <div className="h-4 w-1/4 bg-zinc-800 rounded" />
          <div className="h-5 w-3/4 bg-zinc-800/80 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-32 bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-3 space-y-2">
            <div className="h-3 w-1/3 bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-800/60 rounded" />
            <div className="h-3 w-4/5 bg-zinc-800/60 rounded" />
          </div>
          <div className="h-32 bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-3 space-y-2">
            <div className="h-3 w-1/3 bg-zinc-800 rounded" />
            <div className="h-3 w-full bg-zinc-800/60 rounded" />
            <div className="h-3 w-4/5 bg-zinc-800/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
