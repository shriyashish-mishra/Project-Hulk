import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'error';

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: 'default',
  show: (message, variant = 'default') => set({ message, variant }),
  hide: () => set({ message: null }),
}));

/**
 * The public API — call `toast.show(...)` from anywhere (no provider or
 * navigation context needed) rather than importing the Zustand hook
 * directly. `<ToastHost />` (mounted once in `app/_layout.tsx`) is what
 * actually renders it.
 */
export const toast = {
  show: (message: string) => useToastStore.getState().show(message, 'default'),
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
};

export { useToastStore };
