import { describe, it, expect, vi } from "vitest";
import { formatBytes, sanitizeFilename, downloadJsonFile } from "./format-utils.ts";

describe("format-utils", () => {
    describe("formatBytes", () => {
        it("returns fallback for null, undefined, negative or NaN", () => {
            expect(formatBytes(null)).toBe("—");
            expect(formatBytes(undefined)).toBe("—");
            expect(formatBytes(NaN)).toBe("—");
            expect(formatBytes(-10)).toBe("—");
        });

        it("formats zero bytes", () => {
            expect(formatBytes(0)).toBe("0 B");
        });

        it("formats small and large byte amounts accurately", () => {
            expect(formatBytes(500)).toBe("500 B");
            expect(formatBytes(1024)).toBe("1 KB");
            expect(formatBytes(12695)).toBe("12.4 KB");
            expect(formatBytes(1048576)).toBe("1 MB");
            expect(formatBytes(1073741824)).toBe("1 GB");
        });
    });

    describe("sanitizeFilename", () => {
        it("sanitizes filenames and blocks path traversal characters", () => {
            expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
            expect(sanitizeFilename("app<name>?.json")).toBe("app_name__.json");
            expect(sanitizeFilename("my-app.apk.json")).toBe("my-app.apk.json");
            expect(sanitizeFilename("")).toBe("download.json");
            expect(sanitizeFilename("..")).toBe("download.json");
            expect(sanitizeFilename(".")).toBe("download.json");
        });
    });

    describe("downloadJsonFile", () => {
        it("creates and triggers a download link then cleans up", () => {
            const createObjectURLMock = vi.fn().mockReturnValue("blob:http://localhost/test-blob");
            const revokeObjectURLMock = vi.fn();
            globalThis.URL.createObjectURL = createObjectURLMock;
            globalThis.URL.revokeObjectURL = revokeObjectURLMock;

            const appendChildSpy = vi.spyOn(document.body, "appendChild");
            const removeChildSpy = vi.spyOn(document.body, "removeChild");

            downloadJsonFile("test.json", { foo: "bar" });

            expect(createObjectURLMock).toHaveBeenCalled();
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/test-blob");
        });
    });
});
