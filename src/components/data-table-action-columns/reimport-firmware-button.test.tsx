import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { ReimportFirmwareButton } from "./action-buttons";

globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

const mockReimportMutation = vi.fn().mockResolvedValue({ data: { createFirmwareReImportJob: { jobId: "job-123" } } });
const mockGetRqJobList = vi.fn().mockResolvedValue({ data: { rq_job_list: [] } });

vi.mock("@/lib/apollo-hooks", () => ({
    useMutation: () => [mockReimportMutation, { loading: false }],
    useLazyQuery: () => [mockGetRqJobList, { data: undefined, loading: false }],
}));

vi.mock("@/stores/toast.ts", () => ({
    useToastStore: () => ({
        success: vi.fn(),
        error: vi.fn(),
    }),
}));

describe("ReimportFirmwareButton", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders destructive warning button with text in toolbar mode", () => {
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={["QW5kcm9pZEZpcm13YXJlVHlwZTo2NmZhNmE2ZjFiMTRhMjJiN2QwNGUzYWI="]}
                    text="Reimport (Warning)"
                    tooltip="Warning: Reimport this firmware"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Warning: Reimport this firmware/i });
        expect(button).toBeInTheDocument();
        expect(screen.getByText("Reimport (Warning)")).toBeInTheDocument();
        expect(button.className).toContain("bg-destructive");
    });

    it("renders destructive warning button in table mode", () => {
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={["QW5kcm9pZEZpcm13YXJlVHlwZTo2NmZhNmE2ZjFiMTRhMjJiN2QwNGUzYWI="]}
                    tooltip="Warning: Reimport firmware (permanently deletes all apps & reports)"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Warning: Reimport firmware/i });
        expect(button).toBeInTheDocument();
        expect(button.className).toContain("bg-destructive");
    });

    it("opens prominent permanent data deletion warning dialog when clicked", async () => {
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={["QW5kcm9pZEZpcm13YXJlVHlwZTo2NmZhNmE2ZjFiMTRhMjJiN2QwNGUzYWI="]}
                    text="Reimport (Warning)"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Reimport/i });
        fireEvent.click(button);

        expect(screen.getByText("Reimport Firmware")).toBeInTheDocument();
        expect(screen.getByText("Warning: Permanent Data Deletion")).toBeInTheDocument();
        expect(screen.getByText(/All extracted Android apps/i)).toBeInTheDocument();
        expect(screen.getByText(/All static and dynamic analysis reports/i)).toBeInTheDocument();
        expect(screen.getByText(/All indexed files, hashes, and partition data/i)).toBeInTheDocument();
        expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it("toggles fuzzy hash generation checkbox", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={["QW5kcm9pZEZpcm13YXJlVHlwZTo2NmZhNmE2ZjFiMTRhMjJiN2QwNGUzYWI="]}
                    text="Reimport (Warning)"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Reimport/i });
        fireEvent.click(button);

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    it("submits reimport mutation when Confirm Reimport is clicked", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={["QW5kcm9pZEZpcm13YXJlVHlwZTo2NmZhNmE2ZjFiMTRhMjJiN2QwNGUzYWI="]}
                    text="Reimport (Warning)"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Reimport/i });
        fireEvent.click(button);

        const confirmButton = screen.getByRole("button", { name: /Confirm Reimport/i });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockReimportMutation).toHaveBeenCalledWith({
                variables: {
                    firmwareIdList: ["66fa6a6f1b14a22b7d04e3ab"],
                    queueName: "extractor",
                    createFuzzyHashes: false,
                },
            });
        });
    });

    it("is disabled when ids array is empty", () => {
        render(
            <MemoryRouter>
                <ReimportFirmwareButton
                    ids={[]}
                    tooltip="Warning: Reimport firmware"
                />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /Warning: Reimport firmware/i });
        expect(button).toBeDisabled();
    });
});
