import React, { useState, useRef } from 'react';
import { SAMPLE_BUGS, SampleBug } from '../data/sampleBugs';
import {
  FileText,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  Check,
  Terminal,
} from 'lucide-react';

interface BugInputPanelProps {
  rawReport: string;
  setRawReport: (val: string) => void;
  context: string;
  setContext: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export const BugInputPanel: React.FC<BugInputPanelProps> = ({
  rawReport,
  setRawReport,
  context,
  setContext,
  onAnalyze,
  isLoading,
  onClear,
}) => {
  const [showSampleDropdown, setShowSampleDropdown] = useState(false);
  const [showContextField, setShowContextField] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const handleSelectSample = (sample: SampleBug) => {
    setRawReport(sample.rawText);
    if (sample.context) {
      setContext(sample.context);
      setShowContextField(true);
    }
    setSelectedSampleId(sample.id);
    setShowSampleDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (rawReport.trim() && !isLoading) {
        onAnalyze();
      }
    }
  };

  // Synchronize line number gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const charCount = rawReport.length;
  const wordCount = rawReport.trim() ? rawReport.trim().split(/\s+/).length : 0;

  // Calculate dynamic line count (minimum 12 lines for editor presence)
  const lineCount = Math.max((rawReport.match(/\n/g) || []).length + 1, 14);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Top Panel Bar */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500/80" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            Raw Defect Input
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Load Sample Bug Button & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSampleDropdown(!showSampleDropdown)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-medium transition-all"
              title="Quickly fill in realistic sample bug reports"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Load Sample Bug</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {showSampleDropdown && (
              <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-zinc-900 border border-zinc-700 shadow-2xl z-40 py-1.5 divide-y divide-zinc-800/60">
                <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-zinc-400">
                  Select a test scenario
                </div>
                {SAMPLE_BUGS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="w-full text-left px-3 py-2 hover:bg-zinc-800/80 flex items-start justify-between gap-2 transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-medium text-zinc-200 group-hover:text-white">
                        {sample.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {sample.category}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                        sample.severityLabel === 'Critical'
                          ? 'bg-red-500/10 border-red-500/40 text-red-300'
                          : sample.severityLabel === 'High'
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                          : sample.severityLabel === 'Medium'
                          ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300'
                          : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {sample.severityLabel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear button */}
          {rawReport && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title="Clear input"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea Container - Developer Console Aesthetic */}
      <div className="flex-1 flex flex-col p-4 relative min-h-[320px]">
        {/* Console Box with Top Status Ribbon, Line Numbers, and Code Editor Surface */}
        <div className="flex-1 flex flex-col rounded-lg border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-inner focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500/60 transition-all">
          {/* Console Header Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-800/80 text-[10px] font-mono text-zinc-500 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 opacity-70">
                <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
                <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
                <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
              </div>
              <span className="text-zinc-400 flex items-center gap-1 ml-1.5 font-medium">
                <Terminal className="w-3 h-3 text-sky-400" />
                <span>console.stdin</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              UTF-8 · text/plain
            </span>
          </div>

          {/* Code Editor Body with Line Numbers & Textarea */}
          <div className="flex-1 flex relative overflow-hidden min-h-[250px]">
            {/* Subtle Line Numbering Gutter */}
            <div
              ref={gutterRef}
              className="w-10 shrink-0 select-none py-3 text-right pr-2.5 font-mono text-[11px] leading-[22px] text-zinc-600 border-r border-zinc-800/80 bg-zinc-950/90 overflow-hidden"
              aria-hidden="true"
            >
              {lineNumbers.map((num) => (
                <div key={num} className="h-[22px] leading-[22px] font-mono">
                  {num}
                </div>
              ))}
            </div>

            {/* Monospace Developer Input */}
            <textarea
              ref={textareaRef}
              value={rawReport}
              onChange={(e) => setRawReport(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              placeholder="Paste messy defect description, stack trace, or terminal log...&#10;&#10;// Example:&#10;TypeError: Cannot read properties of undefined (reading 'token')&#10;    at AuthMiddleware (/server/auth.js:42:15)&#10;    at processTicksAndRejections (node:internal/process/task_queues:95:5)"
              className="w-full flex-1 min-h-[250px] resize-none bg-transparent py-3 px-3 font-mono text-xs leading-[22px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none overflow-y-auto selection:bg-sky-500/30"
              disabled={isLoading}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Small Character Count & Console Status Footer */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono select-none">
          <div className="flex items-center gap-2.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-400">
              {charCount} chars
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400">{wordCount} words</span>
            <span className="text-zinc-500">·</span>
            <button
              type="button"
              onClick={() => setShowContextField(!showContextField)}
              className="text-zinc-400 hover:text-sky-300 inline-flex items-center gap-1 transition-colors"
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              <span>{showContextField ? 'Hide context' : '+ Architecture context'}</span>
              {showContextField ? (
                <ChevronUp className="w-2.5 h-2.5" />
              ) : (
                <ChevronDown className="w-2.5 h-2.5" />
              )}
            </button>
          </div>
          <span className="hidden sm:inline text-zinc-500">
            Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-[9px] text-zinc-400 font-mono">⌘+Enter</kbd> to analyze
          </span>
        </div>

        {/* Collapsible Architectural Context Field */}
        {showContextField && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/90 animate-fadeIn">
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1.5">
              Architectural Context / Environment (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Node.js Express, PostgreSQL 16 on AWS RDS, Stripe API, Redis cache"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
              disabled={isLoading}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Bottom Submit Action */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!rawReport.trim() || isLoading}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg ${
            !rawReport.trim() || isLoading
              ? 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20 hover:shadow-sky-500/30 cursor-pointer active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Synthesizing Triage Report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Analyze Bug</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
