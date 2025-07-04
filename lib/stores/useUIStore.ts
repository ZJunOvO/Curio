import { create } from 'zustand';

export type ViewMode = 'flow' | 'minimal';

interface UIState {
  viewMode: ViewMode;
  showFavorites: boolean;
  isNavExpanded: boolean;
  setViewMode: (mode: ViewMode) => void;
  toggleShowFavorites: () => void;
  setIsNavExpanded: (isExpanded: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'flow',
  showFavorites: false,
  isNavExpanded: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleShowFavorites: () => set((state) => ({ showFavorites: !state.showFavorites })),
  setIsNavExpanded: (isExpanded) => set({ isNavExpanded: isExpanded }),
})); 