import { create, StateCreator } from 'zustand';

interface ToastState {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

type ToastStore = StateCreator<ToastState>;

export const useToast = create<ToastState>((set: ToastStore) => ({
  isOpen: false,
  setOpen: (open: boolean) => set({ isOpen: open }),
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
    set({
      title: props.title,
      description: props.description,
      variant: props.variant,
      isOpen: true,
    });
    setTimeout(() => {
      set({ isOpen: false });
    }, 3000);
  },
})); 