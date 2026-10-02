import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface VirusTotalConfig {
    apiKey: string;
}

export interface TruffleHogConfig {
    scanMode: "lightweight" | "apktool";
}

export interface ScannerConfigs {
    VIRUSTOTAL: VirusTotalConfig;
    TRUFFLEHOG: TruffleHogConfig;
}

export interface ScannerRequirementInfo {
    id: string;
    label: string;
    isConfigured: boolean;
    requiresConfiguration: boolean;
    reason?: string;
}

const DEFAULT_CONFIGS: ScannerConfigs = {
    VIRUSTOTAL: {
        apiKey: "",
    },
    TRUFFLEHOG: {
        scanMode: "lightweight",
    },
};

/**
 * Validates a VirusTotal API key using the backend validation rules:
 * - String
 * - At least 10 characters long
 * - Only alphanumeric and `._-` characters
 */
export function validateVirusTotalApiKey(key: string): { isValid: boolean; error?: string } {
    const trimmed = key.trim();
    if (!trimmed) {
        return { isValid: false, error: "API key is required." };
    }
    if (trimmed.length < 10) {
        return { isValid: false, error: "API key must be at least 10 characters long." };
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        return { isValid: false, error: "API key contains invalid characters (allowed: alphanumeric, '.', '_', '-')." };
    }
    return { isValid: true };
}

export interface ScannerConfigState {
    configs: ScannerConfigs;
    setVirusTotalApiKey: (apiKey: string) => void;
    setTruffleHogScanMode: (mode: "lightweight" | "apktool") => void;
    clearScannerConfig: (scannerId: keyof ScannerConfigs) => void;
    isScannerConfigured: (scannerId: string) => boolean;
    scannerRequiresConfiguration: (scannerId: string) => boolean;
    getScannerRequirement: (scannerId: string) => ScannerRequirementInfo;
    getUnconfiguredScanners: (scannerIds: string[]) => ScannerRequirementInfo[];
}

export const useScannerConfigStore = create<ScannerConfigState>()(
    persist(
        (set, get) => ({
            configs: DEFAULT_CONFIGS,

            setVirusTotalApiKey: (apiKey: string) => {
                const sanitized = apiKey.trim();
                set((state) => ({
                    configs: {
                        ...state.configs,
                        VIRUSTOTAL: {
                            ...state.configs.VIRUSTOTAL,
                            apiKey: sanitized,
                        },
                    },
                }));
            },

            setTruffleHogScanMode: (scanMode: "lightweight" | "apktool") => {
                set((state) => ({
                    configs: {
                        ...state.configs,
                        TRUFFLEHOG: {
                            ...state.configs.TRUFFLEHOG,
                            scanMode,
                        },
                    },
                }));
            },

            clearScannerConfig: (scannerId: keyof ScannerConfigs) => {
                set((state) => ({
                    configs: {
                        ...state.configs,
                        [scannerId]: DEFAULT_CONFIGS[scannerId],
                    },
                }));
            },

            scannerRequiresConfiguration: (scannerId: string): boolean => {
                const normalized = scannerId.trim().toUpperCase();
                return normalized === "VIRUSTOTAL";
            },

            isScannerConfigured: (scannerId: string): boolean => {
                const normalized = scannerId.trim().toUpperCase();
                if (normalized === "VIRUSTOTAL") {
                    const key = get().configs.VIRUSTOTAL?.apiKey || "";
                    return validateVirusTotalApiKey(key).isValid;
                }
                return true;
            },

            getScannerRequirement: (scannerId: string): ScannerRequirementInfo => {
                const normalized = scannerId.trim().toUpperCase();
                if (normalized === "VIRUSTOTAL") {
                    const key = get().configs.VIRUSTOTAL?.apiKey || "";
                    const validation = validateVirusTotalApiKey(key);
                    return {
                        id: "VIRUSTOTAL",
                        label: "VirusTotal",
                        requiresConfiguration: true,
                        isConfigured: validation.isValid,
                        reason: validation.isValid ? undefined : (validation.error || "VirusTotal API key required."),
                    };
                }
                if (normalized === "TRUFFLEHOG") {
                    return {
                        id: "TRUFFLEHOG",
                        label: "TruffleHog",
                        requiresConfiguration: false,
                        isConfigured: true,
                    };
                }
                return {
                    id: scannerId,
                    label: scannerId,
                    requiresConfiguration: false,
                    isConfigured: true,
                };
            },

            getUnconfiguredScanners: (scannerIds: string[]): ScannerRequirementInfo[] => {
                return scannerIds
                    .map((id) => get().getScannerRequirement(id))
                    .filter((req) => req.requiresConfiguration && !req.isConfigured);
            },
        }),
        {
            name: "fmd_scanner_configs",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
