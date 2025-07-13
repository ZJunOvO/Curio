import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type UsageCount = {
  count: number;
  lastUsed: string; // YYYY-MM-DD
}

export interface ReimbursementState {
  usage: {
    random: UsageCount;
    full: UsageCount;
    half: UsageCount;
  };
  getUsage: (mode: 'random' | 'full' | 'half') => UsageCount;
  useOnce: (mode: 'random' | 'full' | 'half') => void;
}

const initialUsage: UsageCount = { count: 0, lastUsed: '' };

const today = () => new Date().toISOString().split('T')[0];

export const useReimbursementStore = create<ReimbursementState>()(
  persist(
    (set, get) => ({
      usage: {
        random: { ...initialUsage },
        full: { ...initialUsage },
        half: { ...initialUsage },
      },
      
      getUsage: (mode) => {
        const usage = get().usage[mode];
        if (usage.lastUsed !== today()) {
          return { count: 0, lastUsed: today() };
        }
        return usage;
      },

      useOnce: (mode) => {
        const currentUsage = get().getUsage(mode);
        set(state => ({
          usage: {
            ...state.usage,
            [mode]: {
              count: currentUsage.count + 1,
              lastUsed: today()
            }
          }
        }))
      },
    }),
    {
      name: 'reimbursement-usage-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
) 