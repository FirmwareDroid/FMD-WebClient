import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScannerConfigDialog } from "./scanner-config-dialog";
import { useScannerConfigStore } from "@/stores/scanner-config-store";

describe("ScannerConfigDialog", () => {
    beforeEach(() => {
        useScannerConfigStore.setState({
            configs: {
                VIRUSTOTAL: { apiKey: "" },
                TRUFFLEHOG: { scanMode: "lightweight" },
            },
        });
        localStorage.clear();
    });

    it("renders dialog content with tabs for VirusTotal and TruffleHog", () => {
        render(<ScannerConfigDialog open={true} onOpenChange={vi.fn()} />);

        expect(screen.getByText("Scanner Settings & Credentials")).toBeInTheDocument();
        expect(screen.getByText("VirusTotal")).toBeInTheDocument();
        expect(screen.getByText("TruffleHog")).toBeInTheDocument();
        expect(screen.getByText("API Key Mandatory for VirusTotal Scans")).toBeInTheDocument();
    });

    it("validates API key input and enables Save button only when valid", () => {
        render(<ScannerConfigDialog open={true} onOpenChange={vi.fn()} />);

        const input = screen.getByLabelText(/VirusTotal API Key:/i);
        const saveButton = screen.getByRole("button", { name: /Save API Key/i });

        // Initially disabled with empty input
        expect(saveButton).toBeDisabled();

        // Too short (<10 chars)
        fireEvent.change(input, { target: { value: "short" } });
        expect(saveButton).toBeDisabled();
        expect(screen.getByText(/at least 10 characters long/i)).toBeInTheDocument();

        // Valid key
        fireEvent.change(input, { target: { value: "vt_api_key_valid123456789" } });
        expect(saveButton).not.toBeDisabled();
        expect(screen.getByText(/API key format looks valid/i)).toBeInTheDocument();

        // Save
        fireEvent.click(saveButton);
        expect(useScannerConfigStore.getState().configs.VIRUSTOTAL.apiKey).toBe("vt_api_key_valid123456789");
        expect(useScannerConfigStore.getState().isScannerConfigured("VIRUSTOTAL")).toBe(true);
    });

    it("switches to TruffleHog tab and lets user select mode", () => {
        render(<ScannerConfigDialog open={true} onOpenChange={vi.fn()} initialScanner="TRUFFLEHOG" />);

        expect(screen.getByText(/Scan Execution Mode:/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Apply Mode/i })).toBeInTheDocument();
    });
});
