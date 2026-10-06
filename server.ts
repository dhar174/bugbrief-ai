import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Handle favicon.ico to prevent 404 console errors in browser
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// Supported Gemini Flash models
export const SUPPORTED_FLASH_MODELS = [
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
] as const;

export type FlashModelId = (typeof SUPPORTED_FLASH_MODELS)[number]['id'];

// Initialize Google Gemini SDK on the server-side only
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema definition for BugBrief AI
const triageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    concise_title: {
      type: Type.STRING,
      description: 'A succinct, standard engineering title summarizing the defect (e.g., "[Service] Failure mode under condition").',
    },
    severity: {
      type: Type.STRING,
      description: 'Severity level must be exactly one of: "low", "medium", "high", or "critical".',
    },
    likely_component: {
      type: Type.STRING,
      description: 'The architectural subsystem, microservice, frontend module, or pipeline component likely causing the issue.',
    },
    symptom_summary: {
      type: Type.STRING,
      description: 'Clear, factual synthesis of observable failure symptoms, affected user segment, and blast radius.',
    },
    reproduction_steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ordered, deduplicated, and clarified steps to reliably reproduce the defect.',
    },
    likely_causes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Top plausible technical root causes based on symptoms, stack traces, and system interactions.',
    },
    investigation_checklist: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: {
            type: Type.STRING,
            description: 'Concrete technical task, command, log filter, or metric query to verify or rule out.',
          },
          reason: {
            type: Type.STRING,
            description: 'Why this investigation step matters and what signal it provides.',
          },
        },
        required: ['item', 'reason'],
      },
      description: 'Actionable engineering checklist to systematically diagnose the root cause.',
    },
    recommended_tests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          test_type: {
            type: Type.STRING,
            description: 'Test category, e.g. "Unit Test", "Integration Test", "End-to-End", "Concurrency / Race Condition", or "Regression".',
          },
          description: {
            type: Type.STRING,
            description: 'Specific test scenario and assertions to prevent regressions.',
          },
        },
        required: ['test_type', 'description'],
      },
      description: 'Targeted tests to validate the fix and prevent regressions.',
    },
    questions_for_reporter: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Targeted clarifying questions to ask the bug reporter for missing environmental or reproduction context.',
    },
    alternative_hypothesis: {
      type: Type.STRING,
      description: 'An unconventional or edge-case explanation if the primary assumption is a red herring.',
    },
  },
  required: [
    'concise_title',
    'severity',
    'likely_component',
    'symptom_summary',
    'reproduction_steps',
    'likely_causes',
    'investigation_checklist',
    'recommended_tests',
    'questions_for_reporter',
    'alternative_hypothesis',
  ],
};

// Healthcheck endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'BugBrief AI Server',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    availableModels: SUPPORTED_FLASH_MODELS,
    timestamp: new Date().toISOString(),
  });
});

// Models list endpoint
app.get('/api/models', (_req: Request, res: Response) => {
  res.json({
    models: SUPPORTED_FLASH_MODELS,
    defaultModel: 'gemini-3.8-flash',
  });
});

// Bug triage analysis endpoint
app.post('/api/analyze-bug', async (req: Request, res: Response) => {
  try {
    const { rawReport, context, model } = req.body;

    if (!rawReport || typeof rawReport !== 'string' || !rawReport.trim()) {
      return res.status(400).json({
        error: 'Missing or empty bug report text.',
        message: 'Please provide the raw bug report or error logs to analyze.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Missing Gemini API configuration',
        message: 'GEMINI_API_KEY is not defined in the server environment.',
      });
    }

    // Validate selected Gemini Flash model
    const requestedModel = typeof model === 'string' ? model.trim() : '';
    const selectedModel = SUPPORTED_FLASH_MODELS.some((m) => m.id === requestedModel)
      ? requestedModel
      : 'gemini-3.8-flash';

    const systemInstruction = `You are a Principal Staff Software Engineer and Technical Lead specializing in defect triage, post-mortem analysis, and engineering incident management.
Your role is to analyze unstructured, messy, emotional, incomplete, or fragmented software bug reports, error logs, user complaints, or stack traces, and transform them into a comprehensive, razor-sharp engineering triage report.

Guidelines:
1. Normalize and extract the core technical defect.
2. Determine severity accurately:
   - "critical": System downtime, severe data loss, payment failure, security breach, total blocker with no workaround.
   - "high": Major workflow broken, frequent failure affecting a large segment of users, serious degradation with difficult workaround.
   - "medium": Annoying defect, minor functional discrepancy, edge case with reasonable workaround.
   - "low": Cosmetic flaw, minor UI misalignment, small typo, low-impact developer ergonomics issue.
3. Identify likely_component with high precision (e.g., "Checkout Service / Stripe Webhook Dispatcher", "React Query Cache / Stale Hydration", "PostgreSQL Connection Pooler").
4. Formulate actionable reproduction steps, plausible causes, test suites, and concrete investigation checklist tasks.
5. Provide a realistic alternative hypothesis (e.g. clock skew, CDN caching, third-party outage, concurrency deadlock) in case the obvious culprit is a red herring.
6. Return purely valid JSON strictly matching the requested schema.`;

    const promptText = `Please triage the following raw software bug report:

--- RAW BUG REPORT START ---
${rawReport.trim()}
--- RAW BUG REPORT END ---

${context ? `Additional Architectural / Environment Context:\n${context.trim()}` : ''}`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: triageResponseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText.trim());
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON output:', responseText);
      throw new Error('Failed to parse structured triage response from AI model.');
    }

    // Normalize severity to lowercase and ensure valid range
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(parsedResult.severity?.toLowerCase())) {
      parsedResult.severity = 'medium';
    } else {
      parsedResult.severity = parsedResult.severity.toLowerCase();
    }

    return res.json({
      success: true,
      data: parsedResult,
      modelUsed: selectedModel,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error during bug triage analysis:', error);
    const errorMessage = error?.message || 'An unexpected error occurred while analyzing the bug report.';
    return res.status(500).json({
      error: 'Triage Analysis Failed',
      message: errorMessage,
    });
  }
});

// Setup Vite middleware or static serving
async function initServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        // Disable HMR WebSocket in cloud proxy/iframe environment to prevent connection error logs
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[BugBrief AI] Server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

initServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
