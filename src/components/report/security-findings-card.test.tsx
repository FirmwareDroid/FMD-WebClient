import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { SecurityFindingsCard } from "./security-findings-card";
import { InterestingFinding } from "@/lib/report-utils";

const mockFindings: InterestingFinding[] = [
    {
        id: "1",
        reportId: "rep-1",
        scannerName: "TruffleHog",
        severity: "critical",
        title: "Verified Secret: AWS",
        description: "Active credential verified against live provider APIs",
        snippet: "AKIAIOSFODNN7EXAMPLE",
        location: "src/config.json:12",
        appId: "app-1",
        appFilename: "com.example.app.apk",
        firmwareId: "fw-1",
    },
    {
        id: "2",
        reportId: "rep-2",
        scannerName: "APKLeaks",
        severity: "high",
        title: "Exposed Pattern / Secret: Google API Key",
        snippet: "AIzaSyD-mock-key-1",
        appId: "app-1",
        appFilename: "com.example.app.apk",
        firmwareId: "fw-1",
    },
    {
        id: "3",
        reportId: "rep-3",
        scannerName: "MobSFScan",
        severity: "medium",
        title: "App is debuggable in production",
        location: "AndroidManifest.xml",
        appId: "app-1",
        firmwareId: "fw-1",
    },
];

describe("SecurityFindingsCard", () => {
    it("renders findings with proper severity badges and counts", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        expect(screen.getByText("Interesting Security Findings")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument(); // total count
        expect(screen.getByText("1 Critical")).toBeInTheDocument();
        expect(screen.getByText("1 High")).toBeInTheDocument();
        expect(screen.getByText("1 Medium")).toBeInTheDocument();

        expect(screen.getByText("Verified Secret: AWS")).toBeInTheDocument();
        expect(screen.getByText("Exposed Pattern / Secret: Google API Key")).toBeInTheDocument();
        expect(screen.getByText("App is debuggable in production")).toBeInTheDocument();
        expect(screen.getAllByText("View Full Report").length).toBe(3);
    });

    it("filters findings when clicking Critical & High Only", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        const filterBtn = screen.getByRole("button", { name: /Critical & High/i });
        fireEvent.click(filterBtn);

        expect(screen.getByText("Verified Secret: AWS")).toBeInTheDocument();
        expect(screen.getByText("Exposed Pattern / Secret: Google API Key")).toBeInTheDocument();
        expect(screen.queryByText("App is debuggable in production")).not.toBeInTheDocument();
    });

    it("filters findings by search query", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText("Filter findings...");
        fireEvent.change(searchInput, { target: { value: "AWS" } });

        expect(screen.getByText("Verified Secret: AWS")).toBeInTheDocument();
        expect(screen.queryByText("Exposed Pattern / Secret: Google API Key")).not.toBeInTheDocument();
    });

    it("renders clean state when there are 0 findings", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={[]} />
            </MemoryRouter>
        );

        expect(screen.getByText("No Critical or High-Risk Security Findings Detected")).toBeInTheDocument();
    });
});
