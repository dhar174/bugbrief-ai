import { TriageHistoryItem, TriageReport } from '../types';

const STORAGE_KEY = 'bugbrief_recent_history_v1';
const MAX_HISTORY_ITEMS = 5;

export function getStoredHistory(): TriageHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_HISTORY_ITEMS);
    }
    return [];
  } catch (err) {
    console.error('Failed to read triage history from localStorage:', err);
    return [];
  }
}

export function saveTriageToHistory(
  report: TriageReport,
  rawReport: string,
  context?: string
): TriageHistoryItem[] {
  try {
    const current = getStoredHistory();
    const newItem: TriageHistoryItem = {
      id: `triage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      rawReport,
      context,
      report,
    };

    // Prepend new item and slice to 5 items max
    const updated = [newItem, ...current.filter((item) => item.report.concise_title !== report.concise_title)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save triage history to localStorage:', err);
    return getStoredHistory();
  }
}

export function deleteHistoryItem(id: string): TriageHistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return getStoredHistory();
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
