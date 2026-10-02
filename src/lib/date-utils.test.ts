import { describe, it, expect } from "vitest";
import { formatDateTime, isIsoDateTimeString } from "./date-utils.ts";

describe("date-utils", () => {
    describe("formatDateTime", () => {
        it("returns fallback for null, undefined, or empty string", () => {
            expect(formatDateTime(null)).toBe("—");
            expect(formatDateTime(undefined)).toBe("—");
            expect(formatDateTime("")).toBe("—");
            expect(formatDateTime(null, "N/A")).toBe("N/A");
        });

        it("formats ISO string with microseconds and timezone offset into YYYY-MM-DD HH:mm:ss", () => {
            const raw = "2026-10-01T07:35:38.989349+00:00";
            const formatted = formatDateTime(raw);
            const expectedDate = new Date(raw);
            const pad = (n: number) => n.toString().padStart(2, "0");
            const expected = `${expectedDate.getFullYear()}-${pad(expectedDate.getMonth() + 1)}-${pad(expectedDate.getDate())} ${pad(expectedDate.getHours())}:${pad(expectedDate.getMinutes())}:${pad(expectedDate.getSeconds())}`;
            expect(formatted).toBe(expected);
        });

        it("formats Date objects properly", () => {
            const d = new Date(2025, 4, 12, 14, 30, 45); // May 12, 2025 14:30:45
            expect(formatDateTime(d)).toBe("2025-05-12 14:30:45");
        });

        it("returns original non-empty invalid string if parsing fails", () => {
            expect(formatDateTime("invalid-date-string")).toBe("invalid-date-string");
        });
    });

    describe("isIsoDateTimeString", () => {
        it("detects valid ISO date-time strings", () => {
            expect(isIsoDateTimeString("2026-10-01T07:35:38.989349+00:00")).toBe(true);
            expect(isIsoDateTimeString("2026-10-01T07:35:38Z")).toBe(true);
            expect(isIsoDateTimeString("2026-10-01T07:35:38-05:00")).toBe(true);
        });

        it("rejects non-ISO or invalid strings", () => {
            expect(isIsoDateTimeString("2026-10-01")).toBe(false);
            expect(isIsoDateTimeString("hello world")).toBe(false);
            expect(isIsoDateTimeString(12345)).toBe(false);
            expect(isIsoDateTimeString(null)).toBe(false);
        });
    });
});
