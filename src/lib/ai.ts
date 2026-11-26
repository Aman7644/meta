import OpenAI from 'openai';

// ─────────────────────────────────────────────
//  Provider configuration
// ─────────────────────────────────────────────

export type Provider = 'meta' | 'baseten' | 'fireworks' | 'openai' | 'demo';

export interface ProviderConfig {
  label: string;
  icon: string;
  baseURL: string;
  docsURL: string;
  keyPlaceholder: string;
  keyHint: string;
  hackathonCredit?: string;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  meta: {
    label: 'Meta Llama API',
    icon: '🦙',
    baseURL: 'https://api.llama.com/v1',
    docsURL: 'https://developers.meta.ai',
    keyPlaceholder: 'LA-...',
    keyHint: 'Get from developers.meta.ai → API Keys',
    hackathonCredit: 'Official Meta hackathon endpoint',
  },
  baseten: {
    label: 'Baseten',
    icon: '⚡',
    baseURL: 'https://bridge.baseten.co/v1/direct',
    docsURL: 'https://www.baseten.co/library/llama-4-maverick',
    keyPlaceholder: 'Your Baseten API key...',
    keyHint: 'Get from app.baseten.co → Settings → API Keys',
    hackathonCredit: '$100 credit — 2M TPM rate limit',
  },
  fireworks: {
    label: 'Fireworks AI',
    icon: '🎆',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    docsURL: 'https://fireworks.ai/models',
    keyPlaceholder: 'fw_...',
    keyHint: 'Get from fireworks.ai → Settings → API Keys',
    hackathonCredit: '$25 credit for Meta open-weights',
  },
  openai: {
    label: 'OpenAI',
    icon: '🤖',
    baseURL: 'https://api.openai.com/v1',
    docsURL: 'https://platform.openai.com',
    keyPlaceholder: 'sk-...',
    keyHint: 'Get from platform.openai.com → API Keys',
  },
  demo: {
    label: 'Demo Mode',
    icon: '🎭',
    baseURL: '',
    docsURL: '',
    keyPlaceholder: '',
    keyHint: 'No API key needed',
  },
};

// ─────────────────────────────────────────────
//  Model registry
// ─────────────────────────────────────────────

export interface ModelInfo {
  id: string;
  label: string;
  provider: Provider;
  vision: boolean;      // supports image input
  contextK: number;     // context window in K tokens
  description: string;
  recommended?: boolean;
}

export const MODELS: ModelInfo[] = [
  // ── Meta Llama API ──
  {
    id: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
    label: 'Llama 4 Maverick',
    provider: 'meta',
    vision: true,
    contextK: 128,
    description: '400B total params, 128 experts — best reasoning & multimodal',
    recommended: true,
  },
  {
    id: 'Llama-4-Scout-17B-16E-Instruct-FP8',
    label: 'Llama 4 Scout',
    provider: 'meta',
    vision: true,
    contextK: 10000,
    description: '10M token context — huge documents & codebases',
  },
  {
    id: 'Llama-3.3-70B-Instruct',
    label: 'Llama 3.3 70B',
    provider: 'meta',
    vision: false,
    contextK: 128,
    description: 'Text-only powerhouse, great cost/performance',
  },
  {
    id: 'Llama-3.2-11B-Vision-Instruct',
    label: 'Llama 3.2 11B Vision',
    provider: 'meta',
    vision: true,
    contextK: 128,
    description: 'Fast multimodal — image + text',
  },
  {
    id: 'Llama-3.2-90B-Vision-Instruct',
    label: 'Llama 3.2 90B Vision',
    provider: 'meta',
    vision: true,
    contextK: 128,
    description: 'High-accuracy multimodal',
  },
  // ── Baseten (hackathon $100 credit) ──
  {
    id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    label: 'Llama 4 Maverick (Baseten)',
    provider: 'baseten',
    vision: true,
    contextK: 128,
    description: '2M TPM rate limit — ideal for hackathon demos',
    recommended: true,
  },
  {
    id: 'meta-llama/Llama-4-Scout-17B-16E-Instruct-FP8',
    label: 'Llama 4 Scout (Baseten)',
    provider: 'baseten',
    vision: true,
    contextK: 10000,
    description: '10M context on Baseten infrastructure',
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    label: 'Llama 3.3 70B (Baseten)',
    provider: 'baseten',
    vision: false,
    contextK: 128,
    description: 'Fast & cost-effective on Baseten',
  },
  // ── Fireworks AI (hackathon $25 credit) ──
  {
    id: 'accounts/fireworks/models/llama4-maverick-instruct-basic',
    label: 'Llama 4 Maverick (Fireworks)',
    provider: 'fireworks',
    vision: true,
    contextK: 128,
    description: 'Meta open-weights on Fireworks infrastructure',
    recommended: true,
  },
  {
    id: 'accounts/fireworks/models/llama4-scout-instruct-basic',
    label: 'Llama 4 Scout (Fireworks)',
    provider: 'fireworks',
    vision: true,
    contextK: 10000,
    description: '10M context window on Fireworks',
  },
  {
    id: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    label: 'Llama 3.3 70B (Fireworks)',
    provider: 'fireworks',
    vision: false,
    contextK: 128,
    description: 'Cost-efficient text model on Fireworks',
  },
  // ── OpenAI ──
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'openai',
    vision: true,
    contextK: 128,
    description: 'Fast, cheap OpenAI fallback',
    recommended: true,
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    vision: true,
    contextK: 128,
    description: 'Flagship OpenAI model',
  },
];

// ─────────────────────────────────────────────
//  Client factory — all providers use OpenAI-compatible endpoints
// ─────────────────────────────────────────────

export function getAIClient(apiKey: string, provider: Provider): OpenAI | null {
  if (provider === 'demo' || !apiKey) return null;

  const config = PROVIDERS[provider];
  if (!config?.baseURL) return null;

  return new OpenAI({
    apiKey,
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: false, // always call from server-side API routes
  });
}

/**
 * Get the best default model for a provider.
 * Falls back to first available model for the provider.
 */
export function getDefaultModel(provider: Provider): string {
  const recommended = MODELS.find((m) => m.provider === provider && m.recommended);
  const fallback = MODELS.find((m) => m.provider === provider);
  return recommended?.id ?? fallback?.id ?? 'Llama-4-Maverick-17B-128E-Instruct-FP8';
}

/** Get model info by ID */
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === modelId);
}

/** Get all models for a given provider */
export function getModelsForProvider(provider: Provider): ModelInfo[] {
  return MODELS.filter((m) => m.provider === provider);
}

// ─────────────────────────────────────────────
//  Legacy helpers (kept for backwards compatibility)
// ─────────────────────────────────────────────

/** @deprecated Use getDefaultModel(provider) instead */
export function getModel(provider: string): string {
  return getDefaultModel(provider as Provider);
}

// ─────────────────────────────────────────────
//  SM-2 Spaced Repetition Algorithm
// ─────────────────────────────────────────────

export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): { interval: number; repetitions: number; easeFactor: number; nextReview: Date } {
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * easeFactor);
    newRepetitions = repetitions + 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEaseFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return { interval: newInterval, repetitions: newRepetitions, easeFactor: newEaseFactor, nextReview };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function levelFromXP(xp: number): { level: number; title: string; nextXP: number } {
  const thresholds = [0, 100, 250, 500, 900, 1500, 2500, 4000, 6000, 9000, 13000];
  const titles = ['Novice', 'Explorer', 'Learner', 'Scholar', 'Adept', 'Expert', 'Master', 'Sage', 'Luminary', 'Genius', 'Legend'];
  let level = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i;
  }
  return { level: level + 1, title: titles[level], nextXP: thresholds[Math.min(level + 1, thresholds.length - 1)] };
}

// ─────────────────────────────────────────────
//  Demo responses (no API key)
// ─────────────────────────────────────────────

export const demoResponses = {
  chat: (topic: string) => `Great question about **${topic}**! 

Here's what you need to know:

1. **Core Concept** — The fundamental idea is built around [key principle]. Understanding this unlocks everything else.

2. **Why It Matters** — This topic is essential because it connects to real-world applications in multiple domains.

3. **Common Misconception** — Many beginners think [X], but actually [Y] is more accurate.

**Would you like me to:**
- 🧩 Break this down into smaller concepts?
- 📝 Generate a practice quiz?
- 🗺️ Create a learning roadmap?

*This is a demo response. Add a Meta Llama, Baseten, Fireworks, or OpenAI API key in Settings for real AI responses!*`,
};
