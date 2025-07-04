import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  displayedToasts: Set<string>;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  clearDisplayedHistory: () => void;
}

const generateToastKey = (type: ToastType, title: string, message?: string) => {
  return `${type}:${title}${message ? `:${message}` : ''}`;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  displayedToasts: new Set<string>(),
  
  addToast: (toast) => {
    const toastKey = generateToastKey(toast.type, toast.title, toast.message);
    
    if (get().displayedToasts.has(toastKey)) {
      console.log(`Toast去重：忽略重复的toast - ${toastKey}`);
      return;
    }
    
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };
    
    set((state) => {
      const newDisplayedToasts = new Set(state.displayedToasts);
      newDisplayedToasts.add(toastKey);
      return {
        toasts: [...state.toasts, newToast],
        displayedToasts: newDisplayedToasts
      };
    });
    
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
  
  clearDisplayedHistory: () => {
    set({ displayedToasts: new Set<string>() });
  },
}));

export const toast = {
  success: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      ...options,
    });
  },
  
  error: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: 6000,
      ...options,
    });
  },
  
  warning: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'warning',
      title,
      message,
      ...options,
    });
  },
  
  info: (title: string, message?: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      ...options,
    });
  },
}; 