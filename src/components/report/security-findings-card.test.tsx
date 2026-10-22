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
        severity: "high",
        title: "Verified Secret: AWS",
        description: "Active credential verified against live provider APIs",
        snippet: "AKIAIOSFODNN7EXAMPLE",
        location: "src/config.json:12",
        appId: "app-1",
        appFilename: "com.example.app.apk",
        category: "m1-credential-usage",
        cwe: "CWE-798",
        masvs: "MASVS-STORAGE",
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
        category: "m1-credential-usage",
        cwe: "CWE-798",
        masvs: "MASVS-STORAGE",
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
        category: "m8-security-misconfiguration",
        cwe: "CWE-489",
        masvs: "MASVS-PLATFORM",
        firmwareId: "fw-1",
    },
];

describe("SecurityFindingsCard", () => {
    it("renders findings with proper severity badges, OWASP/MITRE category badges, and counts", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        expect(screen.getByText("Interesting Security Findings")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument(); // total count
        expect(screen.getByText("2 High")).toBeInTheDocument();
        expect(screen.getByText("1 Medium")).toBeInTheDocument();

        expect(screen.getByText("Verified Secret: AWS")).toBeInTheDocument();
        expect(screen.getByText("Exposed Pattern / Secret: Google API Key")).toBeInTheDocument();
        expect(screen.getByText("App is debuggable in production")).toBeInTheDocument();
        expect(screen.getAllByText("M1: Improper Credential Usage").length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText("M8: Security Misconfiguration").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("CWE-798").length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText("CWE-489")).toBeInTheDocument();
        expect(screen.getAllByText("View Full Report").length).toBe(3);
    });

    it("filters findings when clicking High severity filter or Category filter pill", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        const filterBtn = screen.getByRole("button", { name: /^High \(2\)$/i });
        fireEvent.click(filterBtn);

        expect(screen.getByText("Verified Secret: AWS")).toBeInTheDocument();
        expect(screen.getByText("Exposed Pattern / Secret: Google API Key")).toBeInTheDocument();
        expect(screen.queryByText("App is debuggable in production")).not.toBeInTheDocument();

        // Reset severity to All and filter by M8: Misconfiguration category
        fireEvent.click(screen.getByRole("button", { name: /^All \(3\)$/i }));
        fireEvent.click(screen.getByRole("button", { name: /M8: Misconfiguration \(1\)/i }));
        expect(screen.getByText("App is debuggable in production")).toBeInTheDocument();
        expect(screen.queryByText("Verified Secret: AWS")).not.toBeInTheDocument();

        // Switch to Group by Category mode
        fireEvent.click(screen.getByRole("button", { name: /All Categories/i }));
        fireEvent.click(screen.getByRole("button", { name: /Group by Category/i }));
        expect(screen.getByTestId("grouped-findings-container")).toBeInTheDocument();
    });

    it("filters findings by search query", () => {
        render(
            <MemoryRouter>
                <SecurityFindingsCard findings={mockFindings} />
            </MemoryRouter>
        );

        const searchInput = screen.getByPlaceholderText("Filter findings or categories...");
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

        expect(screen.getByText("No High-Risk Security Findings Detected")).toBeInTheDocument();
    });
});
