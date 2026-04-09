import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

const MOBILE_BREAKPOINT = 768;

describe('useIsMobile', () => {
    let addEventListenerSpy: ReturnType<typeof vi.fn>;
    let removeEventListenerSpy: ReturnType<typeof vi.fn>;
    let mediaQueryListeners: Array<(e: Partial<MediaQueryListEvent>) => void>;

    beforeEach(() => {
        mediaQueryListeners = [];
        addEventListenerSpy = vi.fn((_event: string, handler: (e: Partial<MediaQueryListEvent>) => void) => {
            mediaQueryListeners.push(handler);
        });
        removeEventListenerSpy = vi.fn();

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockReturnValue({
                matches: false,
                addEventListener: addEventListenerSpy,
                removeEventListener: removeEventListenerSpy,
            }),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns false when window width is >= breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: MOBILE_BREAKPOINT });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('returns true when window width is below the breakpoint', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: MOBILE_BREAKPOINT - 1 });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('updates when a media-query change event fires', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: MOBILE_BREAKPOINT });
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        // Simulate window becoming mobile-sized
        act(() => {
            Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
            mediaQueryListeners.forEach((handler) => handler({}));
        });

        expect(result.current).toBe(true);
    });

    it('removes the event listener on unmount', () => {
        Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
        const { unmount } = renderHook(() => useIsMobile());
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
