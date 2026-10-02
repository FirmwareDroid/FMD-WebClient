import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    DownloadFirmwareFileButton,
    DownloadExtractedArchiveButton,
} from "./download-firmware-file-button.tsx";

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/stores/toast.ts", () => ({
    useToastStore: () => ({
        success: mockToastSuccess,
        error: mockToastError,
    }),
}));

describe("DownloadFirmwareFileButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.fetch = vi.fn();
        window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-uuid");
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("renders disabled button when isOnDisk is false or null", () => {
        render(
            <DownloadFirmwareFileButton
                fileId="507f1f77bcf86cd799439011"
                isOnDisk={false}
                text="Download File"
            />
        );

        const button = screen.getByRole("button", { name: /file not extracted to disk/i });
        expect(button).toBeDisabled();
    });

    it("downloads file successfully when isOnDisk is true", async () => {
        const mockBlob = new Blob(["test-content"], { type: "application/octet-stream" });
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: new Headers({
                "content-disposition": 'attachment; filename="build.prop"',
            }),
            blob: async () => mockBlob,
        });

        render(
            <DownloadFirmwareFileButton
                fileId="507f1f77bcf86cd799439011"
                isOnDisk={true}
                fileName="build.prop"
                text="Download File"
            />
        );

        const button = screen.getByRole("button", { name: /download file/i });
        expect(button).not.toBeDisabled();
        fireEvent.click(button);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "/download/firmware_file/507f1f77bcf86cd799439011/",
                expect.objectContaining({ method: "GET", credentials: "include" })
            );
            expect(mockToastSuccess).toHaveBeenCalledWith("Downloaded build.prop");
        });
    });

    it("handles download error gracefully", async () => {
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ error: "Firmware file is not present on disk." }),
        });

        render(
            <DownloadFirmwareFileButton
                fileId="507f1f77bcf86cd799439011"
                isOnDisk={true}
                text="Download File"
            />
        );

        const button = screen.getByRole("button", { name: /download file/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith("Firmware file is not present on disk.");
        });
    });
});

describe("DownloadExtractedArchiveButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.fetch = vi.fn();
        window.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test-uuid");
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("triggers archive download on click", async () => {
        const mockBlob = new Blob(["zip-data"], { type: "application/zip" });
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: new Headers({
                "content-disposition": 'attachment; filename="extracted_files.zip"',
            }),
            blob: async () => mockBlob,
        });

        render(
            <DownloadExtractedArchiveButton
                firmwareId="6abe0f0e2054afddb74d8fb7"
                firmwareName="Pixel_Firmware"
            />
        );

        const button = screen.getByRole("button", { name: /download archive \(zip\)/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "/download/firmware/6abe0f0e2054afddb74d8fb7/files/archive/",
                expect.objectContaining({ method: "GET", credentials: "include" })
            );
            expect(mockToastSuccess).toHaveBeenCalledWith("Downloaded extracted_files.zip");
        });
    });
});
