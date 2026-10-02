import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtractFirmwareFilesDialog } from "./extract-firmware-files-dialog.tsx";

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("@/stores/toast.ts", () => ({
    useToastStore: () => ({
        success: mockToastSuccess,
        error: mockToastError,
    }),
}));

const mockExportFirmwareFiles = vi.fn();

vi.mock("@/lib/apollo-hooks", () => ({
    useMutation: () => [
        mockExportFirmwareFiles,
        { loading: false },
    ],
}));

describe("ExtractFirmwareFilesDialog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders trigger button and opens dialog on click", async () => {
        render(
            <ExtractFirmwareFilesDialog
                firmwareId="6abe0f0e2054afddb74d8fb7"
                firmwareName="Pixel_Stock.zip"
            />
        );

        const trigger = screen.getByRole("button", { name: /extract all files/i });
        expect(trigger).toBeInTheDocument();

        fireEvent.click(trigger);

        expect(await screen.findByText(/extract firmware files to disk/i)).toBeInTheDocument();
        expect(screen.getByText(/resource intensive task/i)).toBeInTheDocument();
    });

    it("triggers extraction mutation on confirm", async () => {
        mockExportFirmwareFiles.mockResolvedValueOnce({
            data: {
                exportFirmwareFile: {
                    jobId: "extract-job-12345",
                },
            },
        });

        const onStarted = vi.fn();

        render(
            <ExtractFirmwareFilesDialog
                firmwareId="6abe0f0e2054afddb74d8fb7"
                onExtractionStarted={onStarted}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /extract all files/i }));

        const confirmButton = await screen.findByRole("button", { name: /start extraction/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockExportFirmwareFiles).toHaveBeenCalledWith({
                variables: {
                    firmwareIdList: ["6abe0f0e2054afddb74d8fb7"],
                    filenameRegex: ".*",
                    queueName: "extractor",
                },
            });
            expect(mockToastSuccess).toHaveBeenCalledWith(
                expect.stringContaining("extract-job-12345")
            );
            expect(onStarted).toHaveBeenCalledWith("extract-job-12345");
        });
    });

    it("handles extraction mutation error gracefully", async () => {
        mockExportFirmwareFiles.mockRejectedValueOnce(new Error("Queue offline"));

        render(
            <ExtractFirmwareFilesDialog
                firmwareId="6abe0f0e2054afddb74d8fb7"
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /extract all files/i }));

        const confirmButton = await screen.findByRole("button", { name: /start extraction/i });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalledWith("Queue offline");
        });
    });
});
