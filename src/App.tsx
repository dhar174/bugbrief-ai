import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BugInputPanel } from './components/BugInputPanel';
import { TriageReportView } from './components/TriageReportView';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { HistoryModal } from './components/HistoryModal';
import { TriageReport, TriageHistoryItem } from './types';
import { SampleBug } from './data/sampleBugs';
import {
  getStoredHistory,
  saveTriageToHistory,
  deleteHistoryItem,
  clearHistory,
} from './utils/storage';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [rawReport, setRawReport] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [currentReport, setCurrentReport] = useState<TriageReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<TriageHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    const stored = getStoredHistory();
    setHistory(stored);
  }, []);

  const handleAnalyze = async () => {
    if (!rawReport.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-bug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawReport,
          context: context.trim() || undefined,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to analyze bug report.');
      }

      const report: TriageReport = {
        ...data.data,
        model_used: data.modelUsed || selectedModel,
      };
      setCurrentReport(report);

      // Persist to browser localStorage (up to 5 items)
      const updatedHistory = saveTriageToHistory(report, rawReport, context);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error('Triage error:', err);
      setErrorMessage(
        err?.message ||
          'Failed to communicate with the triage engine. Please verify your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleBug) => {
    setRawReport(sample.rawText);
    setContext(sample.context || '');
    setErrorMessage(null);
  };

  const handleNewTriage = () => {
    setRawReport('');
    setContext('');
    setCurrentReport(null);
    setErrorMessage(null);
  };

  const handleSelectHistoryItem = (item: TriageHistoryItem) => {
    setRawReport(item.rawReport);
    setContext(item.context || '');
    setCurrentReport(item.report);
    setErrorMessage(null);
  };

  const handleDeleteHistory = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-200">
      {/* Top Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onNewTriage={handleNewTriage}
        recentItems={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isLoading={isLoading}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start justify-between gap-3 text-rose-200 animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider font-mono text-rose-400">
                  Triage Analysis Error
                </div>
                <div className="text-xs sm:text-sm text-rose-200 mt-0.5">
                  {errorMessage}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Raw Bug Input */}
          <div className="lg:col-span-5 sticky lg:top-20">
            <BugInputPanel
              rawReport={rawReport}
              setRawReport={setRawReport}
              context={context}
              setContext={setContext}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onClear={handleNewTriage}
            />
          </div>

          {/* Right Column: Structured Engineering Triage Report */}
          <div className="lg:col-span-7">
            {isLoading ? (
              <LoadingState />
            ) : currentReport ? (
              <TriageReportView report={currentReport} rawReport={rawReport} />
            ) : (
              <EmptyState onSelectSample={handleSelectSample} />
            )}
          </div>
        </div>
      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        items={history}
        onSelectItem={handleSelectHistoryItem}
        onDeleteItem={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        currentReportTitle={currentReport?.concise_title}
      />
    </div>
  );
}
