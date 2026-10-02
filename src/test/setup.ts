import "@testing-library/jest-dom/vitest";
import {afterEach, vi} from "vitest";
import {cleanup} from "@testing-library/react";

// Ensure a standard localStorage mock is in place for jsdom/vitest environments
if (typeof window !== "undefined") {
    const memoryStore: Record<string, string> = {};
    const mockStorage = {
        getItem: (key: string) => memoryStore[key] ?? null,
        setItem: (key: string, value: string) => {
            memoryStore[key] = String(value);
        },
        removeItem: (key: string) => {
            delete memoryStore[key];
        },
        clear: () => {
            Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
        },
        get length() {
            return Object.keys(memoryStore).length;
        },
        key: (i: number) => Object.keys(memoryStore)[i] ?? null,
    };

    Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
        value: mockStorage,
        writable: true,
    });
}

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
