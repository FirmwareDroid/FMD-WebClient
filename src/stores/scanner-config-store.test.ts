import { describe, it, expect, beforeEach } from "vitest";
import {
    useScannerConfigStore,
    validateVirusTotalApiKey,
} from "./scanner-config-store";

describe("scanner-config-store", () => {
    beforeEach(() => {
        useScannerConfigStore.setState({
            configs: {
                VIRUSTOTAL: { apiKey: "" },
                TRUFFLEHOG: { scanMode: "lightweight" },
            },
        });
        localStorage.clear();
    });

    describe("validateVirusTotalApiKey", () => {
        it("rejects empty keys", () => {
            expect(validateVirusTotalApiKey("").isValid).toBe(false);
            expect(validateVirusTotalApiKey("   ").isValid).toBe(false);
        });

        it("rejects keys shorter than 10 characters", () => {
            const res = validateVirusTotalApiKey("short123");
            expect(res.isValid).toBe(false);
            expect(res.error).toContain("at least 10 characters");
        });

        it("rejects keys with forbidden characters like spaces or quotes", () => {
            const res = validateVirusTotalApiKey("1234567890 12345");
            expect(res.isValid).toBe(false);
            expect(res.error).toContain("invalid characters");
        });

        it("accepts valid keys with alphanumeric, dot, underscore, dash", () => {
            const res = validateVirusTotalApiKey("vt_key_abcdef1234567890-valid.token");
            expect(res.isValid).toBe(true);
            expect(res.error).toBeUndefined();
        });
    });

    describe("store behavior", () => {
        it("initial state reports VIRUSTOTAL as not configured", () => {
            const state = useScannerConfigStore.getState();
            expect(state.scannerRequiresConfiguration("VIRUSTOTAL")).toBe(true);
            expect(state.isScannerConfigured("VIRUSTOTAL")).toBe(false);
            expect(state.scannerRequiresConfiguration("ANDROGUARD")).toBe(false);
            expect(state.isScannerConfigured("ANDROGUARD")).toBe(true);
        });

        it("updates and validates VirusTotal API key", () => {
            const { setVirusTotalApiKey } = useScannerConfigStore.getState();
            setVirusTotalApiKey("  abc123456789def  ");

            const updated = useScannerConfigStore.getState();
            expect(updated.configs.VIRUSTOTAL.apiKey).toBe("abc123456789def");
            expect(updated.isScannerConfigured("VIRUSTOTAL")).toBe(true);
        });

        it("updates TruffleHog scan mode", () => {
            const { setTruffleHogScanMode } = useScannerConfigStore.getState();
            setTruffleHogScanMode("apktool");

            expect(useScannerConfigStore.getState().configs.TRUFFLEHOG.scanMode).toBe("apktool");
        });

        it("clears scanner config back to defaults", () => {
            const { setVirusTotalApiKey, clearScannerConfig } = useScannerConfigStore.getState();
            setVirusTotalApiKey("abc123456789def");
            expect(useScannerConfigStore.getState().isScannerConfigured("VIRUSTOTAL")).toBe(true);

            clearScannerConfig("VIRUSTOTAL");
            expect(useScannerConfigStore.getState().configs.VIRUSTOTAL.apiKey).toBe("");
            expect(useScannerConfigStore.getState().isScannerConfigured("VIRUSTOTAL")).toBe(false);
        });

        it("detects unconfigured scanners from a list", () => {
            const { getUnconfiguredScanners } = useScannerConfigStore.getState();
            const unconfigured = getUnconfiguredScanners(["ANDROGUARD", "VIRUSTOTAL", "MANIFEST"]);
            expect(unconfigured.length).toBe(1);
            expect(unconfigured[0].id).toBe("VIRUSTOTAL");
            expect(unconfigured[0].requiresConfiguration).toBe(true);
            expect(unconfigured[0].isConfigured).toBe(false);
        });
    });
});
