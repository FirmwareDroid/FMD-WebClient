import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ScanJobsPage } from "./scan-jobs-page";
import { MemoryRouter } from "react-router";
import { MockedProvider } from "@apollo/client/testing/react";

// Mock child components that rely on WebSocket or GraphQL polling
vi.mock("@/components/apk-scanner-log-view/apk-scanner-log-view", () => ({
    ApkScannerLogView: () => <div data-testid="mock-apk-log-view">Mock Log View</div>,
}));

vi.mock("@/components/rq-jobs-table", () => ({
    RqJobsTable: () => <div data-testid="mock-rq-jobs-table">Mock RQ Jobs Table</div>,
}));

describe("ScanJobsPage", () => {
    it("renders default overview when no return state is provided", () => {
        render(
            <MockedProvider>
                <MemoryRouter initialEntries={["/scan-jobs"]}>
                    <ScanJobsPage />
                </MemoryRouter>
            </MockedProvider>
        );

        expect(screen.getByText("Recent App Scan Jobs")).toBeInTheDocument();
        expect(screen.getByText("Scanner Pipeline Monitoring")).toBeInTheDocument();
        expect(screen.getByText("Live Scanner Console Logs")).toBeInTheDocument();
        expect(screen.getByText("Background Worker Tasks")).toBeInTheDocument();
        expect(screen.queryByText("Scan Queued Successfully")).not.toBeInTheDocument();
    });

    it("renders return banner when returnUrl is passed via location.state", () => {
        const testState = {
            returnUrl: "/firmware/fw123/apps/app456",
            returnTitle: "Settings.apk",
            targetName: "com.android.settings",
            scannedCount: 3,
        };

        render(
            <MockedProvider>
                <MemoryRouter initialEntries={[{ pathname: "/scan-jobs", state: testState }]}>
                    <ScanJobsPage />
                </MemoryRouter>
            </MockedProvider>
        );

        expect(screen.getByText("Scan Queued Successfully")).toBeInTheDocument();
        expect(screen.getByText("3 Scanners")).toBeInTheDocument();
        expect(screen.getByText("com.android.settings")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /back to settings\.apk/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /view reports/i })).toBeInTheDocument();
    });
});
