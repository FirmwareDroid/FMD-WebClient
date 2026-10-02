import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { DownloadApkButton } from "./action-buttons";
import { useToastStore } from "@/stores/toast";

describe("DownloadApkButton", () => {
    const originalFetch = globalThis.fetch;
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;

    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-blob");
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
    });

    it("renders download icon button with default tooltip", () => {
        render(<DownloadApkButton appId="507f1f77bcf86cd799439011" />);
        const button = screen.getByRole("button", { name: /download apk/i });
        expect(button).toBeInTheDocument();
    });

    it("renders with custom text label when text prop is provided", () => {
        render(<DownloadApkButton appId="507f1f77bcf86cd799439011" text="Download APK File" />);
        expect(screen.getByRole("button", { name: /download apk file/i })).toBeInTheDocument();
    });

    it("successfully fetches APK and triggers download", async () => {
        const user = userEvent.setup();
        const mockBlob = new Blob(["mock-apk-binary"], { type: "application/vnd.android.package-archive" });
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers({
                "content-disposition": 'attachment; filename="Calculator.apk"',
            }),
            blob: vi.fn().mockResolvedValue(mockBlob),
        });

        render(<DownloadApkButton appId="507f1f77bcf86cd799439011" text="Download APK" />);
        const button = screen.getByRole("button", { name: /download apk/i });
        await user.click(button);

        expect(globalThis.fetch).toHaveBeenCalledWith("/download/android_app/507f1f77bcf86cd799439011/", {
            method: "GET",
            credentials: "include",
        });

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-blob");
        });
    });

    it("displays error toast when backend rejects download", async () => {
        const user = userEvent.setup();
        const toastErrorSpy = vi.spyOn(useToastStore.getState(), "error");

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 403,
            json: vi.fn().mockResolvedValue({ error: "Access denied: File is outside permitted storage directories." }),
        });

        render(<DownloadApkButton appId="507f1f77bcf86cd799439011" text="Download APK" />);
        const button = screen.getByRole("button", { name: /download apk/i });
        await user.click(button);

        await waitFor(() => {
            expect(toastErrorSpy).toHaveBeenCalledWith("Access denied: File is outside permitted storage directories.");
        });
    });
    it("resolves Relay base64 Global ID to raw hexadecimal ObjectId", async () => {
        const user = userEvent.setup();
        const relayId = btoa("AndroidAppNode:507f1f77bcf86cd799439011");
        const mockBlob = new Blob(["mock-apk-binary"], { type: "application/vnd.android.package-archive" });
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            headers: new Headers({
                "content-disposition": 'attachment; filename="Calculator.apk"',
            }),
            blob: vi.fn().mockResolvedValue(mockBlob),
        });

        render(<DownloadApkButton appId={relayId} text="Download APK" />);
        const button = screen.getByRole("button", { name: /download apk/i });
        await user.click(button);

        expect(globalThis.fetch).toHaveBeenCalledWith("/download/android_app/507f1f77bcf86cd799439011/", {
            method: "GET",
            credentials: "include",
        });
    });
});
