import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ExportFirmwareDataDialog } from "./export-firmware-data-dialog";
import { useToastStore } from "@/stores/toast";

describe("ExportFirmwareDataDialog", () => {
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

    it("renders trigger button with default text", () => {
        render(<ExportFirmwareDataDialog firmwareId="6abe0f0e2054afddb74d8fb7" />);
        const button = screen.getByRole("button", { name: /export scan data/i });
        expect(button).toBeInTheDocument();
    });

    it("opens dialog with default ZIP format and selected collections", async () => {
        const user = userEvent.setup();
        render(<ExportFirmwareDataDialog firmwareId="6abe0f0e2054afddb74d8fb7" />);

        const trigger = screen.getByRole("button", { name: /export scan data/i });
        await user.click(trigger);

        expect(screen.getByRole("heading", { name: /export firmware scan data/i })).toBeInTheDocument();
        expect(screen.getByText(/zip archive/i)).toBeInTheDocument();
        expect(screen.getByText(/single merged jsonl/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/firmware metadata/i)).toBeChecked();
        expect(screen.getByLabelText(/extracted android apps/i)).toBeChecked();
        expect(screen.getByLabelText(/security scanner reports/i)).toBeChecked();
    });

    it("fetches export endpoint and triggers file download on submit", async () => {
        const user = userEvent.setup();
        const mockBlob = new Blob(["mock-zip-binary"], { type: "application/zip" });
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            blob: vi.fn().mockResolvedValue(mockBlob),
            headers: new Headers({
                "content-disposition": 'attachment; filename="firmware_6abe0f0e2054afddb74d8fb7_scan_data.zip"',
            }),
        });

        render(
            <ExportFirmwareDataDialog
                firmwareId="6abe0f0e2054afddb74d8fb7"
                firmwareName="my_test_firmware.zip"
            />
        );

        // Open dialog
        await user.click(screen.getByRole("button", { name: /export scan data/i }));

        // Click download button inside dialog
        const downloadButton = screen.getByRole("button", { name: /download export/i });
        await user.click(downloadButton);

        await waitFor(() => {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/download/firmware/6abe0f0e2054afddb74d8fb7/export/"),
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                })
            );
            expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
            expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/mock-blob");
        });
    });

    it("handles 429 rate limit error gracefully", async () => {
        const user = userEvent.setup();
        const toastErrorSpy = vi.spyOn(useToastStore.getState(), "error");

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            json: vi.fn().mockResolvedValue({
                error: "An export is already running for this firmware. Please wait a moment before trying again.",
            }),
            headers: new Headers(),
        });

        render(<ExportFirmwareDataDialog firmwareId="6abe0f0e2054afddb74d8fb7" />);

        await user.click(screen.getByRole("button", { name: /export scan data/i }));
        await user.click(screen.getByRole("button", { name: /download export/i }));

        await waitFor(() => {
            expect(toastErrorSpy).toHaveBeenCalledWith(
                "An export is already running for this firmware. Please wait a moment before trying again."
            );
        });
    });
});
