import { create } from 'zustand';
import { STORAGE_KEYS } from '@/constants';
import { readJSON, writeJSON } from '@/utils/storage';

type ProgressMap = Record<string, Record<string, boolean>>; // repoId -> stepId -> completed

interface ProgressState {
  progress: ProgressMap;
  toggleStep: (repoId: string, stepId: string) => void;
  markAll: (repoId: string, stepIds: string[], value: boolean) => void;
  completionFor: (repoId: string, total: number) => number; // percent 0-100
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: readJSON<ProgressMap>(STORAGE_KEYS.progress, {}),

  toggleStep: (repoId, stepId) => {
    const current = get().progress[repoId] ?? {};
    const updated = { ...current, [stepId]: !current[stepId] };
    const next = { ...get().progress, [repoId]: updated };
    writeJSON(STORAGE_KEYS.progress, next);
    set({ progress: next });
  },

  markAll: (repoId, stepIds, value) => {
    const updated: Record<string, boolean> = {};
    stepIds.forEach((id) => (updated[id] = value));
    const next = { ...get().progress, [repoId]: updated };
    writeJSON(STORAGE_KEYS.progress, next);
    set({ progress: next });
  },

  completionFor: (repoId, total) => {
    if (total === 0) return 0;
    const map = get().progress[repoId] ?? {};
    const done = Object.values(map).filter(Boolean).length;
    return Math.min(100, Math.round((done / total) * 100));
  },

  reset: () => {
    writeJSON(STORAGE_KEYS.progress, {});
    set({ progress: {} });
  },
}));
