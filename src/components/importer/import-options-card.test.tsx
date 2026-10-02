import { useScannerConfigStore } from "@/stores/scanner-config-store";
import {render, screen, fireEvent} from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import {
    ImportOptionsCard,
    getResolvedScanModules,
} from "./import-options-card.tsx";

describe("getResolvedScanModules", () => {
    it("returns correct modules for lightweight profile", () => {
        const modules = getResolvedScanModules("lightweight", []);
        expect(modules).toEqual(["MANIFEST", "APKID", "EXODUS"]);
    });

    it("returns correct modules for deep profile", () => {
        const modules = getResolvedScanModules("deep", []);
        expect(modules).toEqual([
            "MANIFEST",
            "APKID",
            "EXODUS",
            "ANDROGUARD",
            "MOBSF",
            "APKSCAN",
            "TRUESEEING",
            "TRUFFLEHOG",
        ]);
    });

    it("returns correct modules for secrets profile", () => {
        const modules = getResolvedScanModules("secrets", []);
        expect(modules).toEqual(["MANIFEST", "TRUFFLEHOG", "APKLEAKS"]);
    });

    it("returns correct modules for vulns profile", () => {
        const modules = getResolvedScanModules("vulns", []);
        expect(modules).toEqual(["MANIFEST", "MOBSF", "QUARKENGINE", "SUPER", "TRUESEEING"]);
    });

    it("returns correct modules for malware profile", () => {
        const modules = getResolvedScanModules("malware", []);
        expect(modules).toEqual(["MANIFEST", "APKID", "VIRUSTOTAL", "QUARKENGINE"]);
    });

    it("returns empty array for none profile", () => {
        const modules = getResolvedScanModules("none", []);
        expect(modules).toEqual([]);
    });

    it("returns custom modules when profile is custom", () => {
        const custom = ["TRUFFLEHOG", "EXODUS"];
        const modules = getResolvedScanModules("custom", custom);
        expect(modules).toEqual(custom);
    });
});

describe("ImportOptionsCard", () => {
    const defaultProps = {
        keepFilesOnDisk: true,
        setKeepFilesOnDisk: vi.fn(),
        createFuzzyHashes: false,
        setCreateFuzzyHashes: vi.fn(),
        scanProfile: "lightweight" as const,
        setScanProfile: vi.fn(),
        customScanModules: ["MANIFEST", "APKID", "EXODUS"],
        setCustomScanModules: vi.fn(),
    };

    it("renders options with correct default states", () => {
        render(<ImportOptionsCard {...defaultProps} />);

        expect(screen.getByText("Import & Analysis Options")).toBeInTheDocument();
        expect(screen.getByText("Keep extracted files on disk")).toBeInTheDocument();
        expect(screen.getByText("Generate TLSH fuzzy hashes")).toBeInTheDocument();
        expect(screen.getByText("Automated App Security Scans")).toBeInTheDocument();

        // Default badge
        expect(screen.getByText("Default")).toBeInTheDocument();

        // Scan execution order
        expect(screen.getByText("Scan Execution Order (3 Scanners)")).toBeInTheDocument();
        expect(screen.getByText("MANIFEST")).toBeInTheDocument();
        expect(screen.getByText("APKID")).toBeInTheDocument();
        expect(screen.getByText("EXODUS")).toBeInTheDocument();
    });

    it("triggers setKeepFilesOnDisk when toggled", () => {
        const setKeepFilesOnDisk = vi.fn();
        render(<ImportOptionsCard {...defaultProps} setKeepFilesOnDisk={setKeepFilesOnDisk} />);

        const checkbox = screen.getByRole("checkbox", {name: /keep extracted files on disk/i});
        fireEvent.click(checkbox);
        expect(setKeepFilesOnDisk).toHaveBeenCalledWith(false);
    });

    it("displays warning banner when createFuzzyHashes is true", () => {
        const {rerender} = render(<ImportOptionsCard {...defaultProps} createFuzzyHashes={false} />);
        expect(screen.queryByText(/import will take significantly longer/i)).not.toBeInTheDocument();

        rerender(<ImportOptionsCard {...defaultProps} createFuzzyHashes={true} />);
        expect(screen.getByText(/import will take significantly longer/i)).toBeInTheDocument();
    });

    it("renders custom scanner selector chips when scanProfile is custom", () => {
        const setCustomScanModules = vi.fn();
        render(
            <ImportOptionsCard
                {...defaultProps}
                scanProfile="custom"
                customScanModules={["MANIFEST"]}
                setCustomScanModules={setCustomScanModules}
            />
        );

        expect(screen.getByText("Select Scanners to Run:")).toBeInTheDocument();
        expect(screen.getByText("TruffleHog")).toBeInTheDocument();
        expect(screen.getByText("MobSFScan")).toBeInTheDocument();

        // Click to add a scanner
        const trufflehogCheckbox = screen.getByRole("checkbox", {name: /trufflehog/i});
        fireEvent.click(trufflehogCheckbox);
        expect(setCustomScanModules).toHaveBeenCalledWith(["MANIFEST", "TRUFFLEHOG"]);
    });

    it("toggles off already selected scanner in custom profile", () => {
        const setCustomScanModules = vi.fn();
        render(
            <ImportOptionsCard
                {...defaultProps}
                scanProfile="custom"
                customScanModules={["MANIFEST", "APKID"]}
                setCustomScanModules={setCustomScanModules}
            />
        );

        const manifestCheckbox = screen.getByRole("checkbox", {name: /manifest/i});
        fireEvent.click(manifestCheckbox);
        expect(setCustomScanModules).toHaveBeenCalledWith(["APKID"]);
    });

    it("does not render scan execution order when profile is none", () => {
        render(<ImportOptionsCard {...defaultProps} scanProfile="none" />);
        expect(screen.queryByText(/scan execution order/i)).not.toBeInTheDocument();
    });

    it("displays warning banner when Malware profile is selected and VirusTotal is not configured", () => {
        useScannerConfigStore.setState({
            configs: {
                VIRUSTOTAL: { apiKey: "" },
                TRUFFLEHOG: { scanMode: "lightweight" },
            },
        });

        render(
            <ImportOptionsCard
                keepFilesOnDisk={true}
                setKeepFilesOnDisk={vi.fn()}
                createFuzzyHashes={false}
                setCreateFuzzyHashes={vi.fn()}
                scanProfile="malware"
                setScanProfile={vi.fn()}
                customScanModules={[]}
                setCustomScanModules={vi.fn()}
            />
        );

        expect(screen.getByText(/requires an API key before scanning can run/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Configure Key/i })).toBeInTheDocument();
    });

    it("hides warning banner when VirusTotal has a valid API key configured", () => {
        useScannerConfigStore.setState({
            configs: {
                VIRUSTOTAL: { apiKey: "sample-key-for-test-only" },
                TRUFFLEHOG: { scanMode: "lightweight" },
            },
        });

        render(
            <ImportOptionsCard
                keepFilesOnDisk={true}
                setKeepFilesOnDisk={vi.fn()}
                createFuzzyHashes={false}
                setCreateFuzzyHashes={vi.fn()}
                scanProfile="malware"
                setScanProfile={vi.fn()}
                customScanModules={[]}
                setCustomScanModules={vi.fn()}
            />
        );

        expect(screen.queryByText(/requires an API key before scanning can run/i)).not.toBeInTheDocument();
    });
});
