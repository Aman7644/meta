import { create } from 'zustand';
import type { Provider } from '@/lib/ai';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Quiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: Date;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  resources: string[];
  status: 'completed' | 'active' | 'locked';
  estimatedTime: string;
}

export interface Roadmap {
  id: string;
  topic: string;
  goal: string;
  steps: RoadmapStep[];
  createdAt: Date;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export interface UserProfile {
  name: string;
  xp: number;
  streak: number;
  lastStudied: Date | null;
  totalSessions: number;
  apiKey: string;
  apiProvider: Provider;
  modelId: string; // selected model ID (overrides default for provider)
}

interface AppState {
  profile: UserProfile;
  messages: Message[];
  quizzes: Quiz[];
  roadmaps: Roadmap[];
  flashcards: Flashcard[];
  activeTab: string;
  currentTopicContext: string;

  setActiveTab: (tab: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  addQuiz: (quiz: Quiz) => void;
  addRoadmap: (roadmap: Roadmap) => void;
  addFlashcards: (cards: Flashcard[]) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  addXP: (amount: number) => void;
  setCurrentTopicContext: (topic: string) => void;
  getDueFlashcards: () => Flashcard[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'Learner',
        xp: 0,
        streak: 0,
        lastStudied: null,
        totalSessions: 0,
        apiKey: '',
        apiProvider: 'demo',
        modelId: '',
      },
      messages: [],
      quizzes: [],
      roadmaps: [],
      flashcards: [],
      activeTab: 'dashboard',
      currentTopicContext: '',

      setActiveTab: (tab) => set({ activeTab: tab }),

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      addMessage: (msg) =>
        set((s) => ({ messages: [...s.messages, msg] })),

      clearMessages: () => set({ messages: [] }),

      addQuiz: (quiz) =>
        set((s) => ({ quizzes: [quiz, ...s.quizzes] })),

      addRoadmap: (roadmap) =>
        set((s) => ({ roadmaps: [roadmap, ...s.roadmaps] })),

      addFlashcards: (cards) =>
        set((s) => ({ flashcards: [...s.flashcards, ...cards] })),

      updateFlashcard: (id, updates) =>
        set((s) => ({
          flashcards: s.flashcards.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      addXP: (amount) =>
        set((s) => ({
          profile: { ...s.profile, xp: s.profile.xp + amount },
        })),

      setCurrentTopicContext: (topic) => set({ currentTopicContext: topic }),

      getDueFlashcards: () => {
        const now = new Date();
        return get().flashcards.filter(
          (c) => new Date(c.nextReview) <= now
        );
      },
    }),
    {
      name: 'neurolearn-store',
      partialize: (s) => ({
        profile: s.profile,
        quizzes: s.quizzes,
        roadmaps: s.roadmaps,
        flashcards: s.flashcards,
        currentTopicContext: s.currentTopicContext,
      }),
    }
  )
);
