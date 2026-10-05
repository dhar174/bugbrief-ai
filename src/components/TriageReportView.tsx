import React, { useState } from 'react';
import { TriageReport } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { generateMarkdownReport, downloadMarkdownFile } from '../utils/markdownExporter';
import {
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Activity,
  GitCommit,
  HelpCircle,
  Lightbulb,
  CheckSquare,
  Square,
  ShieldAlert,
  ArrowRight,
  TestTube2,
  RotateCcw,
} from 'lucide-react';

interface TriageReportViewProps {
  report: TriageReport;
  rawReport?: string;
}

export const TriageReportView: React.FC<TriageReportViewProps> = ({ report, rawReport }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedComponent, setCopiedComponent] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);

  // Interactive state for Investigation Checklist
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, boolean>>({});

  // Interactive state for Recommended Tests
  const [checkedTests, setCheckedTests] = useState<Record<number, boolean>>({});

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport(report, rawReport);
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport(report, rawReport);
    const safeTitle = (report.concise_title || 'triage-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 40);
    downloadMarkdownFile(`triage-${safeTitle}.md`, md);
  };

  const handleCopyComponent = async () => {
    await navigator.clipboard.writeText(report.likely_component);
    setCopiedComponent(true);
    setTimeout(() => setCopiedComponent(false), 1500);
  };

  const handleCopyQuestions = async () => {
    const text = report.questions_for_reporter
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  // Toggle checklist item
  const toggleChecklist = (idx: number) => {
    setCheckedChecklist((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Toggle test item
  const toggleTest = (idx: number) => {
    setCheckedTests((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const totalChecklist = report.investigation_checklist?.length || 0;
  const checkedChecklistCount = Object.values(checkedChecklist).filter(Boolean).length;

  const totalTests = report.recommended_tests?.length || 0;
  const checkedTestsCount = Object.values(checkedTests).filter(Boolean).length;

  const toggleAllChecklist = () => {
    if (checkedChecklistCount === totalChecklist) {
      setCheckedChecklist({});
    } else {
      const all: Record<number, boolean> = {};
      for (let i = 0; i < totalChecklist; i++) all[i] = true;
      setCheckedChecklist(all);
    }
  };

  const toggleAllTests = () => {
    if (checkedTestsCount === totalTests) {
      setCheckedTests({});
    } else {
      const all: Record<number, boolean> = {};
      for (let i = 0; i < totalTests; i++) all[i] = true;
      setCheckedTests(all);
    }
  };

  // Glow color matching the requested severity scheme:
  // Critical: Red, High: Orange, Medium: Yellow, Low: Green
  const severityGlow = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-emerald-500',
  }[report.severity?.toLowerCase() || 'medium'] || 'bg-yellow-500';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Primary Header Card with Title, Severity Badge & Likely Component Beside It */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden">
        {/* Color glow based on severity */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none -mr-20 -mt-20 ${severityGlow}`}
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            {/* Severity Badge & Likely Component beside each other */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Prominent Visual Severity Badge */}
              <SeverityBadge severity={report.severity} size="lg" />

              {/* Likely Component directly beside severity badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/90 border border-zinc-700/80 font-mono text-xs shadow-sm">
                <span className="text-zinc-500 text-[11px] font-sans font-semibold uppercase tracking-wider">
                  Likely Component:
                </span>
                <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  {report.likely_component}
                </span>
                <button
                  type="button"
                  onClick={handleCopyComponent}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors ml-0.5"
                  title="Click to copy likely component"
                >
                  {copiedComponent ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Model Tag */}
              {report.model_used && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/70 border border-zinc-800 text-[11px] font-mono text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>⚡ {report.model_used}</span>
                </span>
              )}
            </div>

            {/* Concise Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight leading-snug">
              {report.concise_title}
            </h2>
          </div>

          {/* Markdown Export & Download Buttons */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                copiedMd
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-800/90 hover:bg-zinc-700 border-zinc-700 text-zinc-200 hover:text-white'
              }`}
              title="Copy complete triage report as GitHub/Jira Markdown"
            >
              {copiedMd ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Markdown!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Download as .md file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Symptom Summary & Blast Radius */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-zinc-300">
          <Activity className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
            Symptom Summary & Blast Radius
          </h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
          {report.symptom_summary}
        </p>
      </div>

      {/* 3. Reproduction Steps: Numbered Timeline */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-2 text-zinc-300">
            <GitCommit className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Reproduction Steps Timeline
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            {report.reproduction_steps?.length || 0} sequential steps
          </span>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-7 sm:pl-9 space-y-4 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/80 before:via-zinc-700 before:to-zinc-800/60">
          {report.reproduction_steps?.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Numbered circular node */}
              <div className="absolute -left-7 sm:-left-9 top-1 w-7 h-7 rounded-full bg-zinc-950 border-2 border-emerald-500/80 group-hover:border-emerald-400 flex items-center justify-center font-mono text-xs font-bold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.35)] transition-all shrink-0 z-10">
                {idx + 1}
              </div>

              {/* Step Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-950/90 transition-all">
                <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 font-semibold mb-1">
                  Step {String(idx + 1).padStart(2, '0')}
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Likely Root Causes */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Likely Root Causes & Architectural Hypotheses
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {report.likely_causes?.length || 0} hypotheses
          </span>
        </div>

        <ul className="space-y-2.5 text-xs text-zinc-300">
          {report.likely_causes?.map((cause, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80 leading-relaxed"
            >
              <ArrowRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span className="text-zinc-200 text-xs sm:text-sm">{cause}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Actionable Investigation Checklist (Interactive Checklist) */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <CheckSquare className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Actionable Investigation Checklist
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAllChecklist}
              className="text-[11px] font-mono text-zinc-400 hover:text-sky-300 transition-colors"
            >
              {checkedChecklistCount === totalChecklist ? 'Clear All' : 'Check All'}
            </button>
            <span className="text-[11px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
              {checkedChecklistCount} / {totalChecklist} verified
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {report.investigation_checklist?.map((check, idx) => {
            const isDone = !!checkedChecklist[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleChecklist(idx)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isDone
                    ? 'bg-zinc-950/90 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-950/60 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-950/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-xs sm:text-sm font-medium transition-colors ${
                        isDone
                          ? 'line-through text-zinc-400'
                          : 'text-zinc-200'
                      }`}
                    >
                      {check.item}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1 leading-normal">
                      <span className="font-semibold text-zinc-400">Rationale:</span> {check.reason}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Recommended Tests & Verification (Interactive Checklist) */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <TestTube2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Recommended Tests & Verification Checklist
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAllTests}
              className="text-[11px] font-mono text-zinc-400 hover:text-purple-300 transition-colors"
            >
              {checkedTestsCount === totalTests ? 'Clear All' : 'Check All'}
            </button>
            <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              {checkedTestsCount} / {totalTests} implemented
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {report.recommended_tests?.map((test, idx) => {
            const isDone = !!checkedTests[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleTest(idx)}
                className={`p-3 rounded-xl border cursor-pointer select-none transition-all ${
                  isDone
                    ? 'bg-zinc-950/90 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-950/60 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-950/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                        {test.test_type}
                      </span>
                    </div>
                    <div
                      className={`text-xs sm:text-sm leading-relaxed transition-colors ${
                        isDone
                          ? 'line-through text-zinc-400'
                          : 'text-zinc-200'
                      }`}
                    >
                      {test.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Questions for Reporter */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-300">
              Questions for Bug Reporter
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCopyQuestions}
            className="text-[11px] text-zinc-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            {copiedQuestions ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-300">Copied list!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy for Slack / Jira</span>
              </>
            )}
          </button>
        </div>

        <ul className="space-y-2 text-xs text-zinc-300">
          {report.questions_for_reporter?.map((q, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-md bg-zinc-950/40 border border-zinc-800/60"
            >
              <span className="text-cyan-400 font-mono font-bold shrink-0">?</span>
              <span className="text-zinc-300 leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 8. Alternative Hypothesis */}
      <div className="bg-gradient-to-br from-indigo-950/30 to-zinc-900/60 border border-indigo-900/50 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-indigo-300">
          <Lightbulb className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-indigo-300">
            Alternative Hypothesis & Edge Cases
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {report.alternative_hypothesis}
        </p>
      </div>
    </div>
  );
};
