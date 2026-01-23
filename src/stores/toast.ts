// typescript
// file: `src/stores/toast.ts`
import { create } from 'zustand';

export const ToastType = {
    info: "info",
    success: "success",
    warning: "warning",
    error: "error",
} as const;

export type ToastType = (typeof ToastType)[keyof typeof ToastType];

interface Toast {
    _id: number;
    active: boolean;
    type: ToastType;
    messages: string[];
    timeout: number;
}

interface ToastState {
    toasts: Toast[];
    add: (params: { message: string; type?: ToastType; timeout: number }) => Toast;
    update: (id: number, message: string) => void;
    success: (message: string, durationSeconds?: number) => Toast;
    info: (message: string, durationSeconds?: number) => Toast;
    warning: (message: string, durationSeconds?: number) => Toast;
    error: (message?: string, durationSeconds?: number) => Toast;
    remove: (toast: Toast) => void;
}

const DEFAULT_DURATION_SECONDS = 5000;
const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again later';

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    add: ({ message, type = ToastType.info, timeout }) => {
        const toast: Toast = {
            _id: Date.now(),
            active: true,
            type,
            messages: [message],
            timeout,
        };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        return toast;
    },

    update: (id, message) => {
        set((state) => ({
            toasts: state.toasts.map((t) =>
                t._id === id ? { ...t, messages: [...t.messages, message] } : t
            ),
        }));
    },

    success: (message, durationSeconds = DEFAULT_DURATION_SECONDS) => {
        return get().add({
            message,
            type: ToastType.success,
            timeout: durationSeconds,
        });
    },

    info: (message, durationSeconds = DEFAULT_DURATION_SECONDS) => {
        return get().add({
            message,
            type: ToastType.info,
            timeout: durationSeconds,
        });
    },

    warning: (message, durationSeconds = DEFAULT_DURATION_SECONDS) => {
        return get().add({
            message,
            type: ToastType.warning,
            timeout: durationSeconds,
        });
    },

    error: (message = DEFAULT_ERROR_MESSAGE, durationSeconds = DEFAULT_DURATION_SECONDS) => {
        return get().add({
            message,
            type: ToastType.error,
            timeout: durationSeconds,
        });
    },

    remove: (toast) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t._id !== toast._id),
        }));
    },
}));
