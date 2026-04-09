import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore, ToastType } from '@/stores/toast';

// Ensure Date.now() produces distinct IDs even within the same millisecond
let nowCounter = 0;
vi.spyOn(Date, 'now').mockImplementation(() => ++nowCounter * 1000);

// Reset store state before each test
beforeEach(() => {
    useToastStore.setState({ toasts: [] });
});

describe('ToastType constant', () => {
    it('has correct values', () => {
        expect(ToastType.info).toBe('info');
        expect(ToastType.success).toBe('success');
        expect(ToastType.warning).toBe('warning');
        expect(ToastType.error).toBe('error');
    });
});

describe('useToastStore.add', () => {
    it('adds a toast with default info type', () => {
        const { add } = useToastStore.getState();
        const toast = add({ message: 'Hello', timeout: 3000 });

        expect(toast.type).toBe(ToastType.info);
        expect(toast.messages).toEqual(['Hello']);
        expect(toast.timeout).toBe(3000);
        expect(toast.active).toBe(true);
        expect(typeof toast._id).toBe('number');

        const { toasts } = useToastStore.getState();
        expect(toasts).toHaveLength(1);
        expect(toasts[0]).toEqual(toast);
    });

    it('adds multiple toasts', () => {
        const { add } = useToastStore.getState();
        add({ message: 'First', timeout: 1000 });
        add({ message: 'Second', timeout: 2000 });

        const { toasts } = useToastStore.getState();
        expect(toasts).toHaveLength(2);
        expect(toasts[0].messages[0]).toBe('First');
        expect(toasts[1].messages[0]).toBe('Second');
    });

    it('respects the provided type', () => {
        const { add } = useToastStore.getState();
        const toast = add({ message: 'err', type: ToastType.error, timeout: 5000 });
        expect(toast.type).toBe(ToastType.error);
    });
});

describe('useToastStore.update', () => {
    it('appends a message to the matched toast', () => {
        const { add, update } = useToastStore.getState();
        const toast = add({ message: 'first', timeout: 1000 });
        update(toast._id, 'second');

        const { toasts } = useToastStore.getState();
        expect(toasts[0].messages).toEqual(['first', 'second']);
    });

    it('does not affect other toasts', () => {
        const { add, update } = useToastStore.getState();
        const t1 = add({ message: 'a', timeout: 1000 });
        const t2 = add({ message: 'b', timeout: 1000 });
        update(t1._id, 'updated');

        const { toasts } = useToastStore.getState();
        expect(toasts.find((t) => t._id === t1._id)!.messages).toEqual(['a', 'updated']);
        expect(toasts.find((t) => t._id === t2._id)!.messages).toEqual(['b']);
    });
});

describe('useToastStore.remove', () => {
    it('removes the specified toast', () => {
        const { add, remove } = useToastStore.getState();
        const toast = add({ message: 'bye', timeout: 1000 });
        remove(toast);

        const { toasts } = useToastStore.getState();
        expect(toasts).toHaveLength(0);
    });

    it('leaves other toasts intact', () => {
        const { add, remove } = useToastStore.getState();
        const t1 = add({ message: 'keep', timeout: 1000 });
        const t2 = add({ message: 'remove', timeout: 1000 });
        remove(t2);

        const { toasts } = useToastStore.getState();
        expect(toasts).toHaveLength(1);
        expect(toasts[0]._id).toBe(t1._id);
    });
});

describe('useToastStore convenience methods', () => {
    it('success() creates a success toast', () => {
        const toast = useToastStore.getState().success('All good');
        expect(toast.type).toBe(ToastType.success);
        expect(toast.messages[0]).toBe('All good');
        expect(toast.timeout).toBe(5000);
    });

    it('success() accepts a custom duration', () => {
        const toast = useToastStore.getState().success('ok', 1000);
        expect(toast.timeout).toBe(1000);
    });

    it('info() creates an info toast', () => {
        const toast = useToastStore.getState().info('FYI');
        expect(toast.type).toBe(ToastType.info);
        expect(toast.messages[0]).toBe('FYI');
    });

    it('warning() creates a warning toast', () => {
        const toast = useToastStore.getState().warning('Careful');
        expect(toast.type).toBe(ToastType.warning);
        expect(toast.messages[0]).toBe('Careful');
    });

    it('error() creates an error toast with a custom message', () => {
        const toast = useToastStore.getState().error('Oops');
        expect(toast.type).toBe(ToastType.error);
        expect(toast.messages[0]).toBe('Oops');
    });

    it('error() uses the default message when none provided', () => {
        const toast = useToastStore.getState().error();
        expect(toast.type).toBe(ToastType.error);
        expect(toast.messages[0]).toBe('Something went wrong. Please try again later');
    });
});
