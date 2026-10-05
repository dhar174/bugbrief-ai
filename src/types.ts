export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ChecklistItem {
  item: string;
  reason: string;
}

export interface RecommendedTest {
  test_type: string;
  description: string;
}

export interface TriageReport {
  concise_title: string;
  severity: SeverityLevel;
  likely_component: string;
  symptom_summary: string;
  reproduction_steps: string[];
  likely_causes: string[];
  investigation_checklist: ChecklistItem[];
  recommended_tests: RecommendedTest[];
  questions_for_reporter: string[];
  alternative_hypothesis: string;
  model_used?: string;
}

export interface FlashModelOption {
  id: string;
  name: string;
  tag: string;
  description: string;
}

export const FLASH_MODELS: FlashModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Recommended',
    description: 'Flagship speed & deep technical triage reasoning',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    tag: 'Latest Stable',
    description: 'Latest standard Gemini Flash model',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Ultra Fast',
    description: 'Lightweight, ultra-low latency triage',
  },
];

export interface TriageHistoryItem {
  id: string;
  timestamp: string;
  rawReport: string;
  context?: string;
  modelUsed?: string;
  report: TriageReport;
}

export interface ApiResponse {
  success: boolean;
  data?: TriageReport;
  modelUsed?: string;
  error?: string;
  message?: string;
  analyzedAt?: string;
}
