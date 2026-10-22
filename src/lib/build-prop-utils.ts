import {
    FindingCategory,
    getFindingCategoryMeta,
    InterestingFinding,
    NormalizedSeverity,
    sortFindingsBySeverity,
} from "@/lib/report-utils.ts";

export type PropCategory = "all" | "security" | "device" | "os_build" | "runtime" | "system";

export interface ParsedPropItem {
    rawKey: string;
    displayKey: string;
    value: string;
    category: PropCategory;
    isSecuritySensitive?: boolean;
    securitySeverity?: "critical" | "warning" | "info";
    securityNote?: string;
}

export interface BuildPropHighlights {
    debuggable?: { value: string; isRisk: boolean };
    secure?: { value: string; isRisk: boolean };
    adbSecure?: { value: string; isRisk: boolean };
    buildTags?: { value: string; isTestKeys: boolean };
    buildType?: string;
    securityPatch?: string;
    brand?: string;
    model?: string;
    device?: string;
    manufacturer?: string;
    androidVersion?: string;
    sdkVersion?: string;
    fingerprint?: string;
    cpuAbi?: string;
    buildDate?: string;
}

/**
 * Normalizes property keys from MongoDB underscore representation back to standard
 * Android dot-separated build.prop notation (e.g. ro_build_id -> ro.build.id).
 */
export function normalizePropKey(rawKey: string): string {
    return rawKey.replace(/_/g, ".");
}

/**
 * Categorizes a build property and inspects its security risk posture.
 */
export function categorizeProperty(rawKey: string, value: string): {
    category: PropCategory;
    isSecuritySensitive?: boolean;
    securitySeverity?: "critical" | "warning" | "info";
    securityNote?: string;
} {
    const k = rawKey.toLowerCase();
    const v = (value || "").toLowerCase().trim();

    // 1. Critical & High-Risk Security Properties
    if (k === "ro_debuggable" || k === "ro.debuggable") {
        const isRisk = v === "1" || v === "true";
        return {
            category: "security",
            isSecuritySensitive: true,
            securitySeverity: isRisk ? "critical" : "info",
            securityNote: isRisk
                ? "Debuggable build: ADB root daemon and global JDWP debugging enabled"
                : "Production build: Debugging disabled",
        };
    }

    if (k === "ro_secure" || k === "ro.secure") {
        const isRisk = v === "0" || v === "false";
        return {
            category: "security",
            isSecuritySensitive: true,
            securitySeverity: isRisk ? "critical" : "info",
            securityNote: isRisk
                ? "Insecure build: System security enforcement checks disabled"
                : "Enforced security build",
        };
    }

    if (k === "ro_adb_secure" || k === "ro.adb.secure") {
        const isRisk = v === "0" || v === "false";
        return {
            category: "security",
            isSecuritySensitive: true,
            securitySeverity: isRisk ? "critical" : "info",
            securityNote: isRisk
                ? "Unauthenticated ADB: Does not require RSA host confirmation"
                : "ADB authorization required",
        };
    }

    if (k.includes("build_tags") || k.includes("build.tags")) {
        const isTestKeys = v.includes("test-keys");
        return {
            category: "security",
            isSecuritySensitive: isTestKeys,
            securitySeverity: isTestKeys ? "warning" : "info",
            securityNote: isTestKeys
                ? "Signed with public AOSP test-keys; susceptible to unauthorized system app impersonation"
                : "Signed with release keys",
        };
    }

    if (k === "ro_build_type" || k === "ro.build.type") {
        const isDev = v === "userdebug" || v === "eng";
        return {
            category: "security",
            isSecuritySensitive: isDev,
            securitySeverity: isDev ? "warning" : "info",
            securityNote: isDev
                ? `${value} flavor: Includes developer instrumentation and relaxed SELinux rules`
                : "User release build",
        };
    }

    if (k.includes("security_patch") || k.includes("security.patch")) {
        return {
            category: "security",
            isSecuritySensitive: true,
            securitySeverity: "info",
            securityNote: `Security patch level: ${value}`,
        };
    }

    if (k.includes("crypto") || k.includes("fde_") || k.includes("fbe_") || k.startsWith("security_")) {
        return {
            category: "security",
            isSecuritySensitive: true,
            securitySeverity: "info",
        };
    }

    if (k.includes("allow_mock") || k.includes("oem_unlock")) {
        const isWarning = v === "1" || v === "true";
        return {
            category: "security",
            isSecuritySensitive: isWarning,
            securitySeverity: isWarning ? "warning" : "info",
        };
    }

    // 2. Device & Hardware
    if (
        k.startsWith("ro_product_") ||
        k.startsWith("ro.product.") ||
        k.startsWith("ro_board_") ||
        k.startsWith("ro.board.") ||
        k.startsWith("ro_hardware") ||
        k.includes("cputype") ||
        k.includes("chipname") ||
        k.startsWith("ro_soc")
    ) {
        return { category: "device" };
    }

    // 3. OS & Build Metadata
    if (
        k.startsWith("ro_build_") ||
        k.startsWith("ro.build.") ||
        k.startsWith("ro_system_") ||
        k.startsWith("ro.system.") ||
        k.startsWith("ro_odm_") ||
        k.startsWith("ro.odm.") ||
        k.startsWith("ro_vendor_") ||
        k.startsWith("ro.vendor.") ||
        k.startsWith("ro_treble_") ||
        k.startsWith("ro_vndk_")
    ) {
        return { category: "os_build" };
    }

    // 4. Runtime & Dalvik
    if (
        k.startsWith("dalvik_") ||
        k.startsWith("dalvik.") ||
        k.startsWith("pm_dexopt_") ||
        k.startsWith("pm.dexopt.") ||
        k.startsWith("ro_zygote") ||
        k.startsWith("ro_lmk_") ||
        k.startsWith("ro_iorapd_")
    ) {
        return { category: "runtime" };
    }

    // 5. General System & Networking
    return { category: "system" };
}

/**
 * Extracts high-level security & identity highlights from a properties dictionary.
 */
export function extractBuildPropHighlights(props: Record<string, string>): BuildPropHighlights {
    const highlights: BuildPropHighlights = {};

    for (const [key, val] of Object.entries(props)) {
        const k = key.toLowerCase();
        const v = String(val).trim();

        if (k === "ro_debuggable" || k === "ro.debuggable") {
            highlights.debuggable = { value: v, isRisk: v === "1" || v === "true" };
        } else if (k === "ro_secure" || k === "ro.secure") {
            highlights.secure = { value: v, isRisk: v === "0" || v === "false" };
        } else if (k === "ro_adb_secure" || k === "ro.adb.secure") {
            highlights.adbSecure = { value: v, isRisk: v === "0" || v === "false" };
        } else if (k.includes("build_tags") || k.includes("build.tags")) {
            highlights.buildTags = { value: v, isTestKeys: v.toLowerCase().includes("test-keys") };
        } else if (k === "ro_build_type" || k === "ro.build.type") {
            highlights.buildType = v;
        } else if (k.includes("security_patch") || k.includes("security.patch")) {
            if (!highlights.securityPatch || v > highlights.securityPatch) {
                highlights.securityPatch = v;
            }
        } else if (k.includes("fingerprint")) {
            if (!highlights.fingerprint || k.startsWith("ro_system_") || k.startsWith("ro.system.")) {
                highlights.fingerprint = v;
            }
        } else if (k.includes("cpu_abi") && !k.includes("abilist") && !k.includes("abi2")) {
            highlights.cpuAbi = v;
        } else if (k === "ro_build_version_release" || k === "ro.build.version.release") {
            highlights.androidVersion = v;
        } else if (k === "ro_build_version_sdk" || k === "ro.build.version.sdk") {
            highlights.sdkVersion = v;
        } else if (k === "ro_build_date" || k === "ro.build.date") {
            highlights.buildDate = v;
        } else if (k.includes("brand")) {
            if (!highlights.brand || k.includes("system")) highlights.brand = v;
        } else if (k.includes("model")) {
            if (!highlights.model || k.includes("system")) highlights.model = v;
        } else if (k.includes("device") && !k.includes("abi")) {
            if (!highlights.device || k.includes("system")) highlights.device = v;
        } else if (k.includes("manufacturer")) {
            if (!highlights.manufacturer || k.includes("system")) highlights.manufacturer = v;
        }
    }

    return highlights;
}

/**
 * Parses a raw properties dictionary into structured and sorted `ParsedPropItem[]`.
 */
export function parseBuildPropDictionary(props: Record<string, string>): ParsedPropItem[] {
    const items: ParsedPropItem[] = [];

    for (const [rawKey, rawValue] of Object.entries(props)) {
        const value = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
        const displayKey = normalizePropKey(rawKey);
        const { category, isSecuritySensitive, securitySeverity, securityNote } = categorizeProperty(rawKey, value);

        items.push({
            rawKey,
            displayKey,
            value,
            category,
            isSecuritySensitive,
            securitySeverity,
            securityNote,
        });
    }

    return items.sort((a, b) => a.displayKey.localeCompare(b.displayKey));
}

/**
 * Formats a properties dictionary into clean `key=value\n` text suitable for raw display and export.
 */
export function formatRawBuildProps(props: Record<string, string>, commentHeader?: string): string {
    const keys = Object.keys(props).sort((a, b) => normalizePropKey(a).localeCompare(normalizePropKey(b)));
    const lines: string[] = [];

    if (commentHeader) {
        lines.push(`# ${commentHeader}`);
        lines.push(`# Extracted by FMD`);
        lines.push("");
    }

    for (const key of keys) {
        const displayKey = normalizePropKey(key);
        const val = props[key] ?? "";
        lines.push(`${displayKey}=${val}`);
    }

    return lines.join("\n");
}

/**
 * Triggers a direct browser download of the raw .prop file.
 */
export function downloadBuildPropFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".prop") ? filename : `${filename}.prop`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface BuildPropFileForSecurityAnalysis {
    id?: string | null;
    pk?: string | null;
    properties?: string | Record<string, unknown> | null;
    firmwareFileIdReference?: {
        id?: string | null;
        name?: string | null;
        relativePath?: string | null;
        partitionName?: string | null;
    } | null;
}

const MAX_BUILD_PROP_FILES = 50;
const MAX_PROPERTIES_PER_FILE = 5000;
const MAX_PROP_STRING_LEN = 512;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function truncateSafe(value: string, maxLen = MAX_PROP_STRING_LEN): string {
    return value.length > maxLen ? `${value.slice(0, maxLen)}…` : value;
}

/**
 * Extracts firmware-level security misconfigurations from `build.prop` files as normalized `InterestingFinding` items.
 * Defends against prototype pollution, malformed JSON, and excessive property counts.
 */
export function extractBuildPropSecurityFindings(
    buildPropFiles: readonly (BuildPropFileForSecurityAnalysis | null | undefined)[] | null | undefined,
    firmwareId?: string
): InterestingFinding[] {
    if (!Array.isArray(buildPropFiles) || buildPropFiles.length === 0) {
        return [];
    }

    const findings: InterestingFinding[] = [];
    const seenSignatures = new Set<string>();
    const boundedFiles = buildPropFiles.slice(0, MAX_BUILD_PROP_FILES);

    for (let fileIdx = 0; fileIdx < boundedFiles.length; fileIdx++) {
        const bpFile = boundedFiles[fileIdx];
        if (!bpFile || !bpFile.properties) continue;

        let parsedObj: Record<string, unknown> | null = null;
        if (typeof bpFile.properties === "string") {
            const trimmed = bpFile.properties.trim();
            if (!trimmed || trimmed === "{}") continue;
            try {
                const candidate = JSON.parse(trimmed);
                if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
                    parsedObj = candidate as Record<string, unknown>;
                }
            } catch {
                parsedObj = null;
            }
        } else if (typeof bpFile.properties === "object" && !Array.isArray(bpFile.properties)) {
            parsedObj = bpFile.properties as Record<string, unknown>;
        }

        if (!parsedObj) continue;

        const partitionName = bpFile.firmwareFileIdReference?.partitionName?.trim() || undefined;
        const relativePath = bpFile.firmwareFileIdReference?.relativePath?.trim() || undefined;
        const fileName = bpFile.firmwareFileIdReference?.name?.trim() || "build.prop";
        const location = relativePath
            ? truncateSafe(relativePath)
            : partitionName
            ? `${truncateSafe(partitionName, 64)}/${truncateSafe(fileName, 128)}`
            : truncateSafe(fileName, 128);

        const entries = Object.entries(parsedObj).slice(0, MAX_PROPERTIES_PER_FILE);
        for (let propIdx = 0; propIdx < entries.length; propIdx++) {
            const [rawKey, rawVal] = entries[propIdx];
            if (!rawKey || FORBIDDEN_KEYS.has(rawKey)) continue;

            const valueStr = truncateSafe(
                typeof rawVal === "string" ? rawVal.trim() : JSON.stringify(rawVal ?? "")
            );
            const displayKey = truncateSafe(normalizePropKey(rawKey), 128);
            const { isSecuritySensitive, securitySeverity, securityNote } = categorizeProperty(rawKey, valueStr);

            if (!isSecuritySensitive || (securitySeverity !== "critical" && securitySeverity !== "warning")) {
                continue;
            }

            const dedupKey = `${partitionName || ""}::${displayKey.toLowerCase()}::${valueStr.toLowerCase()}`;
            if (seenSignatures.has(dedupKey)) {
                continue;
            }
            seenSignatures.add(dedupKey);

            const kLower = rawKey.toLowerCase();
            let severity: NormalizedSeverity = securitySeverity === "critical" ? "high" : "medium";
            let title = `Insecure Build Property: ${displayKey}`;
            let category: FindingCategory = "m8-security-misconfiguration";
            let cwe = "CWE-16";

            if (kLower === "ro_debuggable" || kLower === "ro.debuggable") {
                severity = "high";
                title = "Debuggable Firmware Build (ro.debuggable=1)";
                category = "m8-security-misconfiguration";
                cwe = "CWE-489";
            } else if (kLower === "ro_secure" || kLower === "ro.secure") {
                severity = "high";
                title = "System Security Checks Disabled (ro.secure=0)";
                category = "m8-security-misconfiguration";
                cwe = "CWE-276";
            } else if (kLower === "ro_adb_secure" || kLower === "ro.adb.secure") {
                severity = "high";
                title = "Unauthenticated ADB Daemon (ro.adb.secure=0)";
                category = "m3-authn-authz";
                cwe = "CWE-306";
            } else if (kLower.includes("build_tags") || kLower.includes("build.tags")) {
                severity = "high";
                title = "Firmware Signed with Public AOSP Test-Keys (test-keys)";
                category = "m2-supply-chain";
                cwe = "CWE-347";
            } else if (kLower === "ro_build_type" || kLower === "ro.build.type") {
                severity = "medium";
                title = `Non-Production Build Flavor (ro.build.type=${valueStr})`;
                category = "m8-security-misconfiguration";
                cwe = "CWE-489";
            } else if (kLower.includes("oem_unlock")) {
                severity = "medium";
                title = `OEM Bootloader Unlock Permitted (${displayKey}=${valueStr})`;
                category = "m8-security-misconfiguration";
                cwe = "CWE-16";
            } else if (kLower.includes("allow_mock")) {
                severity = "low";
                title = `Mock Locations Enabled (${displayKey}=${valueStr})`;
                category = "m8-security-misconfiguration";
                cwe = "CWE-16";
            }

            const catMeta = getFindingCategoryMeta(category);
            const fileId = bpFile.pk || bpFile.id || `bp-${fileIdx}`;
            findings.push({
                id: `buildprop-${fileId}-${propIdx}`,
                reportId: "",
                scannerName: "build.prop",
                severity,
                title,
                description:
                    securityNote ||
                    `Security-sensitive Android system property configured with potentially risky value in ${location}.`,
                snippet: `${displayKey}=${valueStr}`,
                location,
                partitionName,
                category,
                cwe,
                owaspMobile: catMeta.label,
                masvs: catMeta.masvs,
                firmwareId,
            });
        }
    }

    return sortFindingsBySeverity(findings);
}
