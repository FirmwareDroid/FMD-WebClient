import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirmwareExtractionProgressBar } from "./firmware-extraction-progress-bar.tsx";
import { MemoryRouter } from "react-router";

let mockQueryData: any = null;

vi.mock("@/lib/apollo-hooks", () => ({
    useQuery: () => ({
        data: mockQueryData,
        loading: false,
        error: null,
    }),
}));

describe("FirmwareExtractionProgressBar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryData = null;
    });

    it("renders nothing when there is no matching job", () => {
        mockQueryData = {
            rq_job_list: [],
        };

        const { container } = render(
            <MemoryRouter>
                <FirmwareExtractionProgressBar firmwareId="6abe0f0e2054afddb74d8fb7" />
            </MemoryRouter>
        );

        expect(container.firstChild).toBeNull();
    });

    it("renders active progress bar with stages and file counts", () => {
        mockQueryData = {
            rq_job_list: [
                {
                    id: "extract-job-1",
                    funcName: "start_file_export_by_regex",
                    queueName: "extractor",
                    status: "started",
                    isFinished: false,
                    isFailed: false,
                    startedAt: "2026-10-02T12:00:00Z",
                    meta: JSON.stringify({
                        firmware_id: "6abe0f0e2054afddb74d8fb7",
                        stage: "writing_files",
                        message: "Writing 5,000 files to disk...",
                        progress_percent: 45.0,
                        processed_files: 2250,
                        total_files: 5000,
                    }),
                },
            ],
        };

        render(
            <MemoryRouter>
                <FirmwareExtractionProgressBar firmwareId="6abe0f0e2054afddb74d8fb7" />
            </MemoryRouter>
        );

        expect(screen.getByText(/extracting firmware files to disk/i)).toBeInTheDocument();
        expect(screen.getByText(/writing files to disk/i)).toBeInTheDocument();
        expect(screen.getByText(/writing 5,000 files to disk\.\.\./i)).toBeInTheDocument();
        expect(screen.getByText(/\(2,250 \/ 5,000 files\)/i)).toBeInTheDocument();
        expect(screen.getByText("45%")).toBeInTheDocument();
    });

    it("renders completed state and allows dismissal", () => {
        const onComplete = vi.fn();
        mockQueryData = {
            rq_job_list: [
                {
                    id: "extract-job-2",
                    funcName: "start_file_export_by_regex",
                    queueName: "extractor",
                    status: "finished",
                    isFinished: true,
                    isFailed: false,
                    startedAt: "2026-10-02T12:00:00Z",
                    meta: JSON.stringify({
                        firmware_id: "6abe0f0e2054afddb74d8fb7",
                        stage: "completed",
                        message: "Extraction completed successfully.",
                        progress_percent: 100.0,
                    }),
                },
            ],
        };

        render(
            <MemoryRouter>
                <FirmwareExtractionProgressBar
                    firmwareId="6abe0f0e2054afddb74d8fb7"
                    onExtractionComplete={onComplete}
                />
            </MemoryRouter>
        );

        expect(screen.getByText(/firmware files ready on disk/i)).toBeInTheDocument();
        expect(screen.getByText("Extracted")).toBeInTheDocument();
        expect(onComplete).toHaveBeenCalled();

        const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
        fireEvent.click(dismissBtn);

        expect(screen.queryByText(/firmware files ready on disk/i)).not.toBeInTheDocument();
    });

    it("renders failed state when job fails", () => {
        mockQueryData = {
            rq_job_list: [
                {
                    id: "extract-job-3",
                    funcName: "start_file_export_by_regex",
                    queueName: "extractor",
                    status: "failed",
                    isFinished: false,
                    isFailed: true,
                    startedAt: "2026-10-02T12:00:00Z",
                    meta: JSON.stringify({
                        firmware_id: "6abe0f0e2054afddb74d8fb7",
                        stage: "failed",
                        message: "Extraction failed: Disk full",
                        error: "Disk full",
                    }),
                },
            ],
        };

        render(
            <MemoryRouter>
                <FirmwareExtractionProgressBar firmwareId="6abe0f0e2054afddb74d8fb7" />
            </MemoryRouter>
        );

        expect(screen.getByText(/firmware file extraction failed/i)).toBeInTheDocument();
        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.getByText(/disk full/i)).toBeInTheDocument();
    });
});
