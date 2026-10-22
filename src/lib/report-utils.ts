/**
 * Security and report normalization utilities for scanner outputs.
 */

export interface SafeParsedResults {
    data: Record<string, any>;
    rawJson: any;
    isError: boolean;
    errorMessage?: string;
    isEmpty: boolean;
}

/**
 * Safely parses raw results from any scanner into a JavaScript object.
 * Protects against invalid JSON, prototype pollution, and varied serialization formats.
 */
export function parseReportResults(rawResults: unknown): SafeParsedResults {
    if (rawResults === null || rawResults === undefined) {
        return { data: {}, rawJson: {}, isError: false, isEmpty: true };
    }

    let parsed: any = rawResults;

    if (typeof rawResults === "string") {
        const trimmed = rawResults.trim();
        if (!trimmed || trimmed === "null" || trimmed === "undefined" || trimmed === "{}") {
            return { data: {}, rawJson: {}, isError: false, isEmpty: true };
        }
        try {
            parsed = JSON.parse(trimmed);
        } catch {
            // Raw text that is not JSON
            return {
                data: { rawOutput: trimmed },
                rawJson: { rawOutput: trimmed },
                isError: false,
                isEmpty: false,
            };
        }
    }

    if (typeof parsed !== "object" || parsed === null) {
        return {
            data: { value: parsed },
            rawJson: parsed,
            isError: false,
            isEmpty: false,
        };
    }

    // Defensive clone to strip prototype pollution attempts
    const sanitizedData = Array.isArray(parsed)
        ? { items: parsed }
        : { ...parsed };

    delete sanitizedData.__proto__;
    delete sanitizedData.constructor;
    delete sanitizedData.prototype;

    const hasError = Boolean(sanitizedData.error || sanitizedData.errors);
    const errorMessage = typeof sanitizedData.error === "string"
        ? sanitizedData.error
        : Array.isArray(sanitizedData.errors)
        ? sanitizedData.errors.join("; ")
        : undefined;

    const keys = Object.keys(sanitizedData);
    const isEmpty = keys.length === 0;

    return {
        data: sanitizedData,
        rawJson: parsed,
        isError: hasError,
        errorMessage,
        isEmpty,
    };
}

/**
 * Validates and sanitizes external URLs to prevent javascript: and data: XSS attacks.
 */
export function sanitizeExternalUrl(url: unknown): string | null {
    if (typeof url !== "string") return null;
    const trimmed = url.trim();
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.toString();
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Normalizes severity levels across different scanners (MobSF, Super, Quark, Trueseeing).
 */
export type NormalizedSeverity = "critical" | "high" | "medium" | "low" | "info" | "warning" | "unknown";

export function normalizeSeverity(severity: unknown): NormalizedSeverity {
    if (typeof severity !== "string") return "unknown";
    const s = severity.toLowerCase().trim();
    if (s.includes("crit")) return "critical";
    if (s.includes("high") || s.includes("error")) return "high";
    if (s.includes("med") || s.includes("warn")) return "medium";
    if (s.includes("low")) return "low";
    if (s.includes("info") || s.includes("notice") || s.includes("debug")) return "info";
    return "unknown";
}

/**
 * Returns severity badge styling parameters.
 */
export function getSeverityBadgeProps(severity: NormalizedSeverity): {
    label: string;
    variant: "destructive" | "secondary" | "outline";
    className: string;
} {
    switch (severity) {
        case "critical":
            return {
                label: "Critical",
                variant: "destructive",
                className: "bg-red-600 text-white dark:bg-red-700 font-semibold",
            };
        case "high":
            return {
                label: "High",
                variant: "destructive",
                className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-medium",
            };
        case "medium":
            return {
                label: "Medium",
                variant: "secondary",
                className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-medium",
            };
        case "low":
            return {
                label: "Low",
                variant: "secondary",
                className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 font-medium",
            };
        case "info":
        default:
            return {
                label: "Info",
                variant: "outline",
                className: "text-muted-foreground border-border/80",
            };
    }
}
/**
 * Known signature contextual descriptions for static analysis scanners such as TrueSeeing.
 * Used as high-quality fallbacks when scanners return null for description and synopsis.
 */
export const KNOWN_SIGNATURE_DESCRIPTIONS: Record<string, string> = {
    "privacy-device-id":
        "Potential privacy concern: application accesses sensitive device or hardware identifiers (e.g., Bluetooth MAC, IMEI, serial numbers, or Wi-Fi state) that can identify or track the device.",
    "detect-obfuscator":
        "Lack of code obfuscation: application binaries appear unobfuscated, leaving application logic, classes, and sensitive methods susceptible to decompilation and reverse-engineering.",
    "security-log":
        "Diagnostic and debug logging detected: logging statements (Log, PrintWriter, PrintStream) may expose sensitive runtime data, internal application state, or credentials in system logs.",
    "detect-library":
        "Third-party library detected: external dependencies, SDKs, or bundled utility libraries identified within the application package.",
    "detect-url":
        "Hardcoded URL, IP address, hostname, or URI path component detected in application bytecode or resources.",
    "detect-reflection":
        "Use of Java reflection: dynamic class loading, method invocation, or field access via reflection APIs detected, which can circumvent static checks or invoke restricted internal APIs.",
    "manifest-open-permission":
        "Application requests Android permissions in AndroidManifest.xml that control access to sensitive device resources or privacy-impacting features.",
    "manifest-manip-activity":
        "Exported activity detected in AndroidManifest.xml: activity can be invoked by external applications or system intents, expanding the application attack surface.",
    "manifest-manip-backup":
        "Application data backup allowed via Auto Backup (allowBackup is true or unset), which could expose application state to local backup extraction attacks.",
    "security-file-write":
        "Application opens files for writing on local storage (internal or external), which may be susceptible to directory traversal or unauthorized data overwrites if unconstrained.",
};

export interface FindingDescriptionFallbackOptions {
    description?: string | null;
    synopsis?: string | null;
    sig?: string | null;
    summary?: string | null;
    solution?: string | null;
    instances?: Array<{ info?: string | null; source?: string | null }> | null;
}

/**
 * Resolves a human-readable description for a finding using an intelligent fallback cascade.
 * Ensures findings never appear blank when scanners (e.g. TrueSeeing) omit explicit descriptions.
 */
export function resolveFindingDescription(options: FindingDescriptionFallbackOptions): string {
    // 1. Direct description if present and non-empty
    if (typeof options.description === "string" && options.description.trim().length > 0) {
        return options.description.trim();
    }

    // 2. Synopsis if present and non-empty
    if (typeof options.synopsis === "string" && options.synopsis.trim().length > 0) {
        return options.synopsis.trim();
    }

    // 3. Known signature mapping
    if (typeof options.sig === "string" && KNOWN_SIGNATURE_DESCRIPTIONS[options.sig]) {
        return KNOWN_SIGNATURE_DESCRIPTIONS[options.sig];
    }

    // 4. Instances summary
    if (Array.isArray(options.instances) && options.instances.length > 0) {
        const samples = options.instances
            .map((inst) => (inst.info && inst.info.trim()) || (inst.source && inst.source.trim()))
            .filter((val): val is string => Boolean(val && val.length > 0))
            .slice(0, 2);

        if (samples.length > 0) {
            const prefix = options.summary ? `${options.summary}: ` : "";
            return `${prefix}${options.instances.length} instance(s) detected (${samples.join("; ")})`;
        }
    }

    // 5. Solution fallback
    if (typeof options.solution === "string" && options.solution.trim().length > 0) {
        const firstLine = options.solution.trim().split("\n")[0];
        return `Recommended remediation: ${firstLine}`;
    }

    // 6. Summary fallback
    if (typeof options.summary === "string" && options.summary.trim().length > 0) {
        return `${options.summary.trim()} detected during static analysis.`;
    }

    // 7. Signature generic fallback
    if (typeof options.sig === "string" && options.sig.trim().length > 0) {
        return `Issue identified by rule signature: ${options.sig.trim()}`;
    }

    return "No description provided by scanner.";
}


/**
 * TruffleHog finding representation
 */
export interface TruffleHogFinding {
    detectorType: string;
    verified: boolean;
    raw?: string;
    redacted?: string;
    filePath?: string;
    line?: number;
    extraData?: Record<string, any>;
}

export function extractTruffleHogFindings(data: Record<string, any>): {
    summary: {
        verifiedSecrets: number;
        unverifiedSecrets: number;
        chunks: number;
        bytes: number;
        duration: string;
    };
    scanMode: string;
    findings: TruffleHogFinding[];
    stderrLogs: Array<{ level?: string; ts?: string; msg?: string }>;
} {
    const summaryRaw = data.summary ?? {};
    const summary = {
        verifiedSecrets: Number(summaryRaw.verified_secrets ?? 0),
        unverifiedSecrets: Number(summaryRaw.unverified_secrets ?? 0),
        chunks: Number(summaryRaw.chunks ?? 0),
        bytes: Number(summaryRaw.bytes ?? 0),
        duration: String(summaryRaw.scan_duration ?? "—"),
    };

    const scanMode = String(data.scan_mode ?? "standard");

    const findings: TruffleHogFinding[] = [];
    const findingsRaw = data.findings;

    if (Array.isArray(findingsRaw)) {
        for (const item of findingsRaw) {
            if (typeof item === "object" && item !== null) {
                findings.push({
                    detectorType: item.detector_type || item.DetectorType || item.name || "Secret",
                    verified: Boolean(item.verified || item.Verified),
                    raw: item.raw || item.RawValue,
                    redacted: item.redacted || item.Redacted,
                    filePath: item.file || item.path || item.SourceMetadata?.Data?.Git?.file,
                    line: item.line || item.SourceMetadata?.Data?.Git?.line,
                    extraData: item,
                });
            }
        }
    } else if (typeof findingsRaw === "object" && findingsRaw !== null) {
        for (const [key, val] of Object.entries(findingsRaw)) {
            if (Array.isArray(val)) {
                for (const item of val) {
                    if (typeof item === "object" && item !== null) {
                        findings.push({
                            detectorType: key,
                            verified: Boolean(item.verified || item.Verified),
                            raw: item.raw || item.RawValue,
                            redacted: item.redacted || item.Redacted,
                            filePath: item.file || item.path,
                            line: item.line,
                            extraData: item,
                        });
                    } else if (typeof item === "string") {
                        findings.push({
                            detectorType: key,
                            verified: false,
                            raw: item,
                        });
                    }
                }
            }
        }
    }

    const stderrLogs: Array<{ level?: string; ts?: string; msg?: string }> = [];
    if (Array.isArray(data.stderr)) {
        for (const log of data.stderr) {
            if (typeof log === "object" && log !== null) {
                stderrLogs.push({
                    level: log.level,
                    ts: log.ts,
                    msg: log.msg || log.message,
                });
            }
        }
    }

    return {
        summary,
        scanMode,
        findings,
        stderrLogs,
    };
}

/**
 * APKLeaks findings representation
 */
export interface ApkleaksPatternFinding {
    patternName: string;
    matches: string[];
}

export function extractApkleaksFindings(data: Record<string, any>): ApkleaksPatternFinding[] {
    const list: ApkleaksPatternFinding[] = [];
    for (const [patternName, val] of Object.entries(data)) {
        if (patternName === "error" || patternName === "errors" || patternName === "rawOutput") continue;
        if (Array.isArray(val)) {
            const matches = val.filter((m): m is string => typeof m === "string" && m.trim().length > 0);
            if (matches.length > 0) {
                list.push({ patternName, matches });
            }
        } else if (typeof val === "string" && val.trim().length > 0) {
            list.push({ patternName, matches: [val.trim()] });
        }
    }
    return list;
}

/**
 * Exodus tracker finding representation
 */
export interface ExodusTracker {
    id?: number | string;
    name: string;
    categories: string[];
    website?: string;
    description?: string;
}

export function extractExodusFindings(data: Record<string, any>): {
    trackers: ExodusTracker[];
    permissions: string[];
} {
    const trackers: ExodusTracker[] = [];
    const trackersRaw = data.trackers ?? data.trackers_list ?? [];

    if (Array.isArray(trackersRaw)) {
        for (const t of trackersRaw) {
            if (typeof t === "object" && t !== null) {
                trackers.push({
                    id: t.id,
                    name: String(t.name || "Unknown Tracker"),
                    categories: Array.isArray(t.categories) ? t.categories.map(String) : [],
                    website: sanitizeExternalUrl(t.website) ?? undefined,
                    description: t.description ? String(t.description) : undefined,
                });
            } else if (typeof t === "string") {
                trackers.push({
                    name: t,
                    categories: [],
                });
            }
        }
    }

    const permissions: string[] = [];
    const permsRaw = data.permissions ?? [];
    if (Array.isArray(permsRaw)) {
        for (const p of permsRaw) {
            if (typeof p === "string" && p.trim()) {
                permissions.push(p.trim());
            }
        }
    }

    return { trackers, permissions };
}

/**
 * APKiD detection findings representation
 */
export interface ApkidFileDetection {
    filename: string;
    compilers: string[];
    packers: string[];
    obfuscators: string[];
    antiDebug: string[];
    antiVm: string[];
    antiDisassembly: string[];
    manipulators: string[];
    droppers: string[];
    other: Record<string, string[]>;
}

export function extractApkidFindings(data: Record<string, any>): ApkidFileDetection[] {
    if (!data || typeof data !== "object") {
        return [];
    }

    const detections: ApkidFileDetection[] = [];
    const toStrArray = (val: unknown): string[] => {
        if (Array.isArray(val)) return val.map(String).map((s) => s.trim()).filter(Boolean);
        if (typeof val === "string" && val.trim()) return [val.trim()];
        return [];
    };

    const parseEntry = (rawFilename: string, item: any) => {
        if (!item || typeof item !== "object") return;

        const matchesObj = (item.matches && typeof item.matches === "object") ? item.matches : item;
        const filename = String(item.filename || rawFilename || item.name || item.path || "Unknown file");

        const compilers = toStrArray(matchesObj.compiler ?? item.compiler);
        const packers = toStrArray(matchesObj.packer ?? item.packer);
        const obfuscators = toStrArray(matchesObj.obfuscator ?? item.obfuscator);
        const antiDebug = toStrArray(matchesObj.anti_debug ?? item.anti_debug);
        const antiVm = toStrArray(matchesObj.anti_vm ?? item.anti_vm);
        const antiDisassembly = toStrArray(matchesObj.anti_disassembly ?? item.anti_disassembly);
        const manipulators = toStrArray(matchesObj.manipulator ?? item.manipulator);
        const droppers = toStrArray(matchesObj.dropper ?? item.dropper);

        const other: Record<string, string[]> = {};
        const knownKeys = new Set([
            "compiler",
            "packer",
            "obfuscator",
            "anti_debug",
            "anti_vm",
            "anti_disassembly",
            "manipulator",
            "dropper",
            "filename",
            "name",
            "path",
            "matches",
        ]);

        for (const [k, v] of Object.entries(matchesObj)) {
            if (!knownKeys.has(k)) {
                const arr = toStrArray(v);
                if (arr.length > 0) {
                    other[k] = arr;
                }
            }
        }

        detections.push({
            filename,
            compilers,
            packers,
            obfuscators,
            antiDebug,
            antiVm,
            antiDisassembly,
            manipulators,
            droppers,
            other,
        });
    };

    const filesRaw = Array.isArray(data)
        ? data
        : Array.isArray(data.files)
          ? data.files
          : (data.files && typeof data.files === "object")
            ? data.files
            : data;

    if (Array.isArray(filesRaw)) {
        for (const item of filesRaw) {
            parseEntry("", item);
        }
    } else if (typeof filesRaw === "object" && filesRaw !== null) {
        for (const [key, fileObj] of Object.entries(filesRaw)) {
            if (
                key === "error" ||
                key === "errors" ||
                key === "apkid_version" ||
                key === "rules_sha256"
            ) {
                continue;
            }
            parseEntry(key, fileObj);
        }
    }

    return detections;
}

/**
 * Official OWASP Mobile Top 10 (2024) category keys (M1–M10).
 */
export type FindingCategory =
    | "m1-credential-usage"
    | "m2-supply-chain"
    | "m3-authn-authz"
    | "m4-input-output-validation"
    | "m5-insecure-communication"
    | "m6-privacy-controls"
    | "m7-binary-protections"
    | "m8-security-misconfiguration"
    | "m9-insecure-data-storage"
    | "m10-insufficient-cryptography";

export const FINDING_CATEGORY_ORDER: readonly FindingCategory[] = [
    "m1-credential-usage",
    "m2-supply-chain",
    "m3-authn-authz",
    "m4-input-output-validation",
    "m5-insecure-communication",
    "m6-privacy-controls",
    "m7-binary-protections",
    "m8-security-misconfiguration",
    "m9-insecure-data-storage",
    "m10-insufficient-cryptography",
];

export interface FindingCategoryMeta {
    category: FindingCategory;
    owaspId: string;
    label: string;
    shortLabel: string;
    masvs: string;
    cwe: string;
    cweName: string;
    description: string;
    className: string;
}

const FINDING_CATEGORY_METADATA: Record<FindingCategory, FindingCategoryMeta> = {
    "m1-credential-usage": {
        category: "m1-credential-usage",
        owaspId: "M1",
        label: "M1: Improper Credential Usage",
        shortLabel: "M1: Credential Usage",
        masvs: "MASVS-STORAGE / MASVS-CRYPTO",
        cwe: "CWE-798",
        cweName: "Use of Hard-coded Credentials",
        description:
            "OWASP Mobile Top 10 (2024) M1 — Hardcoded credentials, API keys, private keys, or bearer tokens embedded in application binaries or resources (MITRE CWE-798 / CWE-259, OWASP MASVS-STORAGE).",
        className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    "m2-supply-chain": {
        category: "m2-supply-chain",
        owaspId: "M2",
        label: "M2: Inadequate Supply Chain Security",
        shortLabel: "M2: Supply Chain",
        masvs: "MASVS-CODE",
        cwe: "CWE-1357",
        cweName: "Reliance on Insufficiently Trustworthy Component",
        description:
            "OWASP Mobile Top 10 (2024) M2 — Untrusted third-party SDKs/libraries, public AOSP test-key signing, or malicious/tampered packages in the build pipeline (MITRE CWE-1357 / CWE-506, OWASP MASVS-CODE).",
        className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    },
    "m3-authn-authz": {
        category: "m3-authn-authz",
        owaspId: "M3",
        label: "M3: Insecure Authentication/Authorization",
        shortLabel: "M3: AuthN / AuthZ",
        masvs: "MASVS-AUTH / MASVS-PLATFORM",
        cwe: "CWE-926",
        cweName: "Improper Export of Android Application Components",
        description:
            "OWASP Mobile Top 10 (2024) M3 — Missing authentication or permission enforcement on exported Android components (Activities, Services, Receivers, Providers) or unauthenticated system daemons (MITRE CWE-926 / CWE-287 / CWE-306, OWASP MASVS-AUTH).",
        className: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
    },
    "m4-input-output-validation": {
        category: "m4-input-output-validation",
        owaspId: "M4",
        label: "M4: Insufficient Input/Output Validation",
        shortLabel: "M4: Input/Output Validation",
        masvs: "MASVS-CODE / MASVS-PLATFORM",
        cwe: "CWE-20",
        cweName: "Improper Input Validation",
        description:
            "OWASP Mobile Top 10 (2024) M4 — Insufficient validation or sanitization of untrusted inputs leading to SQL injection, XSS, WebView JavaScript execution, path traversal, or command/intent injection (MITRE CWE-20 / CWE-89 / CWE-79 / CWE-22, OWASP MASVS-CODE).",
        className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
    "m5-insecure-communication": {
        category: "m5-insecure-communication",
        owaspId: "M5",
        label: "M5: Insecure Communication",
        shortLabel: "M5: Insecure Communication",
        masvs: "MASVS-NETWORK",
        cwe: "CWE-319",
        cweName: "Cleartext Transmission of Sensitive Information",
        description:
            "OWASP Mobile Top 10 (2024) M5 — Cleartext HTTP network traffic, permissive network_security_config, bypassed TLS certificate/hostname verification, or missing certificate pinning (MITRE CWE-319 / CWE-295, OWASP MASVS-NETWORK).",
        className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    },
    "m6-privacy-controls": {
        category: "m6-privacy-controls",
        owaspId: "M6",
        label: "M6: Inadequate Privacy Controls",
        shortLabel: "M6: Privacy Controls",
        masvs: "MASVS-PRIVACY",
        cwe: "CWE-359",
        cweName: "Exposure of Private Personal Information",
        description:
            "OWASP Mobile Top 10 (2024) M6 — Embedded third-party analytics/profiling trackers, persistent hardware identifier access (IMEI, IMSI, MAC), or exposure of sensitive PII in system logs (MITRE CWE-359 / CWE-532, OWASP MASVS-PRIVACY).",
        className: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    },
    "m7-binary-protections": {
        category: "m7-binary-protections",
        owaspId: "M7",
        label: "M7: Insufficient Binary Protections",
        shortLabel: "M7: Binary Protections",
        masvs: "MASVS-RESILIENCE",
        cwe: "CWE-693",
        cweName: "Protection Mechanism Failure",
        description:
            "OWASP Mobile Top 10 (2024) M7 — Lack of code obfuscation, dynamic reflection usage, packers, anti-debugging, anti-VM, or binary tamper-resistance mechanisms (MITRE CWE-693 / CWE-656, OWASP MASVS-RESILIENCE).",
        className: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    },
    "m8-security-misconfiguration": {
        category: "m8-security-misconfiguration",
        owaspId: "M8",
        label: "M8: Security Misconfiguration",
        shortLabel: "M8: Misconfiguration",
        masvs: "MASVS-PLATFORM",
        cwe: "CWE-16",
        cweName: "Configuration / Incorrect Default Permissions",
        description:
            "OWASP Mobile Top 10 (2024) M8 — Insecure Android firmware build.prop settings (ro.debuggable=1, ro.secure=0), enabled application debugging, allowBackup=true, or over-privileged manifest permissions (MITRE CWE-16 / CWE-276 / CWE-489, OWASP MASVS-PLATFORM).",
        className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
    },
    "m9-insecure-data-storage": {
        category: "m9-insecure-data-storage",
        owaspId: "M9",
        label: "M9: Insecure Data Storage",
        shortLabel: "M9: Insecure Data Storage",
        masvs: "MASVS-STORAGE",
        cwe: "CWE-922",
        cweName: "Insecure Storage of Sensitive Information",
        description:
            "OWASP Mobile Top 10 (2024) M9 — Unencrypted local storage, world-readable/writable files or SharedPreferences, insecure SQLite databases, or unconstrained external storage writes (MITRE CWE-922 / CWE-312 / CWE-732, OWASP MASVS-STORAGE).",
        className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    "m10-insufficient-cryptography": {
        category: "m10-insufficient-cryptography",
        owaspId: "M10",
        label: "M10: Insufficient Cryptography",
        shortLabel: "M10: Cryptography",
        masvs: "MASVS-CRYPTO",
        cwe: "CWE-327",
        cweName: "Use of a Broken or Risky Cryptographic Algorithm",
        description:
            "OWASP Mobile Top 10 (2024) M10 — Weak or broken cryptographic algorithms (MD5, SHA-1, DES, RC4, AES-ECB), insecure random number generators (java.util.Random), or static initialization vectors (MITRE CWE-327 / CWE-330 / CWE-326, OWASP MASVS-CRYPTO).",
        className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
    },
};

/**
 * Returns display metadata (OWASP ID, label, MASVS domain, primary MITRE CWE, description, badge classes)
 * for a security finding category.
 */
export function getFindingCategoryMeta(category: FindingCategory | undefined): FindingCategoryMeta {
    if (category && Object.prototype.hasOwnProperty.call(FINDING_CATEGORY_METADATA, category)) {
        return FINDING_CATEGORY_METADATA[category];
    }
    return FINDING_CATEGORY_METADATA["m4-input-output-validation"];
}

/**
 * Maps explicit MITRE CWE identifiers to the corresponding OWASP Mobile Top 10 (2024) category.
 */
const CWE_TO_OWASP_CATEGORY: Readonly<Record<string, FindingCategory>> = {
    "CWE-798": "m1-credential-usage",
    "CWE-259": "m1-credential-usage",
    "CWE-321": "m1-credential-usage",
    "CWE-522": "m1-credential-usage",
    "CWE-1357": "m2-supply-chain",
    "CWE-1104": "m2-supply-chain",
    "CWE-506": "m2-supply-chain",
    "CWE-494": "m2-supply-chain",
    "CWE-287": "m3-authn-authz",
    "CWE-285": "m3-authn-authz",
    "CWE-306": "m3-authn-authz",
    "CWE-926": "m3-authn-authz",
    "CWE-862": "m3-authn-authz",
    "CWE-20": "m4-input-output-validation",
    "CWE-22": "m4-input-output-validation",
    "CWE-74": "m4-input-output-validation",
    "CWE-77": "m4-input-output-validation",
    "CWE-78": "m4-input-output-validation",
    "CWE-79": "m4-input-output-validation",
    "CWE-89": "m4-input-output-validation",
    "CWE-94": "m4-input-output-validation",
    "CWE-502": "m4-input-output-validation",
    "CWE-611": "m4-input-output-validation",
    "CWE-749": "m4-input-output-validation",
    "CWE-295": "m5-insecure-communication",
    "CWE-297": "m5-insecure-communication",
    "CWE-319": "m5-insecure-communication",
    "CWE-200": "m6-privacy-controls",
    "CWE-212": "m6-privacy-controls",
    "CWE-359": "m6-privacy-controls",
    "CWE-532": "m6-privacy-controls",
    "CWE-656": "m7-binary-protections",
    "CWE-693": "m7-binary-protections",
    "CWE-16": "m8-security-misconfiguration",
    "CWE-250": "m8-security-misconfiguration",
    "CWE-276": "m8-security-misconfiguration",
    "CWE-489": "m8-security-misconfiguration",
    "CWE-312": "m9-insecure-data-storage",
    "CWE-313": "m9-insecure-data-storage",
    "CWE-377": "m9-insecure-data-storage",
    "CWE-732": "m9-insecure-data-storage",
    "CWE-922": "m9-insecure-data-storage",
    "CWE-310": "m10-insufficient-cryptography",
    "CWE-326": "m10-insufficient-cryptography",
    "CWE-327": "m10-insufficient-cryptography",
    "CWE-328": "m10-insufficient-cryptography",
    "CWE-329": "m10-insufficient-cryptography",
    "CWE-330": "m10-insufficient-cryptography",
    "CWE-338": "m10-insufficient-cryptography",
    "CWE-347": "m10-insufficient-cryptography",
};

/**
 * Extracts a normalized `CWE-<number>` token from a raw CWE string or description if present.
 */
export function extractNormalizedCweId(raw: unknown): string | undefined {
    if (typeof raw !== "string") return undefined;
    const match = /\bCWE-(\d{1,5})\b/i.exec(raw);
    return match ? `CWE-${match[1]}` : undefined;
}

/**
 * Deterministically classifies a static/dynamic analysis finding into one of the 10
 * OWASP Mobile Top 10 (2024) categories (`M1`–`M10`), prioritizing explicit OWASP / MASVS / MITRE CWE
 * metadata before evaluating scanner and rule signatures.
 */
export function classifyFindingCategory(options: {
    scannerName?: string | null;
    ruleId?: string | null;
    title?: string | null;
    description?: string | null;
    location?: string | null;
    cwe?: string | null;
    owaspMobile?: string | null;
    masvs?: string | null;
}): FindingCategory {
    // 1. Check explicit OWASP Mobile Top 10 metadata if provided by scanner (e.g. MobSFScan)
    const owaspRaw = (options.owaspMobile || "").trim();
    if (owaspRaw) {
        const mMatch = /\bM(10|[1-9])\b/i.exec(owaspRaw);
        if (mMatch) {
            const mNum = mMatch[1];
            const owaspLower = owaspRaw.toLowerCase();
            // Note: MobSFScan sometimes uses 2016 M-numbers (e.g. "M5: Insufficient Cryptography" in 2016 vs M10 in 2024)
            // Check descriptive text first so 2016 labels map accurately to 2024 M1-M10!
            if (owaspLower.includes("credential")) return "m1-credential-usage";
            if (owaspLower.includes("supply chain")) return "m2-supply-chain";
            if (owaspLower.includes("authentication") || owaspLower.includes("authorization")) return "m3-authn-authz";
            if (owaspLower.includes("input") || owaspLower.includes("code quality")) return "m4-input-output-validation";
            if (owaspLower.includes("communication")) return "m5-insecure-communication";
            if (owaspLower.includes("privacy")) return "m6-privacy-controls";
            if (owaspLower.includes("binary") || owaspLower.includes("reverse engineering") || owaspLower.includes("tampering")) {
                return "m7-binary-protections";
            }
            if (owaspLower.includes("misconfiguration") || owaspLower.includes("platform usage")) {
                return "m8-security-misconfiguration";
            }
            if (owaspLower.includes("data storage") || owaspLower.includes("storage")) return "m9-insecure-data-storage";
            if (owaspLower.includes("cryptography") || owaspLower.includes("crypto")) return "m10-insufficient-cryptography";

            const directMap: Record<string, FindingCategory> = {
                "1": "m1-credential-usage",
                "2": "m2-supply-chain",
                "3": "m3-authn-authz",
                "4": "m4-input-output-validation",
                "5": "m5-insecure-communication",
                "6": "m6-privacy-controls",
                "7": "m7-binary-protections",
                "8": "m8-security-misconfiguration",
                "9": "m9-insecure-data-storage",
                "10": "m10-insufficient-cryptography",
            };
            if (directMap[mNum]) return directMap[mNum];
        }
    }

    // 2. Check explicit MITRE CWE identifier if provided
    const cweId =
        extractNormalizedCweId(options.cwe) ||
        extractNormalizedCweId(options.description) ||
        extractNormalizedCweId(options.title);
    if (cweId && Object.prototype.hasOwnProperty.call(CWE_TO_OWASP_CATEGORY, cweId)) {
        return CWE_TO_OWASP_CATEGORY[cweId];
    }

    // 3. Check explicit OWASP MASVS domain if provided
    const masvsUpper = (options.masvs || "").trim().toUpperCase();
    if (masvsUpper) {
        if (masvsUpper.includes("CRYPTO") || masvsUpper.includes("MSTG-CRYPTO")) return "m10-insufficient-cryptography";
        if (masvsUpper.includes("NETWORK") || masvsUpper.includes("MSTG-NETWORK")) return "m5-insecure-communication";
        if (masvsUpper.includes("PRIVACY")) return "m6-privacy-controls";
        if (masvsUpper.includes("RESILIENCE") || masvsUpper.includes("MSTG-RESILIENCE")) return "m7-binary-protections";
        if (masvsUpper.includes("AUTH") || masvsUpper.includes("MSTG-AUTH")) return "m3-authn-authz";
        if (masvsUpper.includes("STORAGE") || masvsUpper.includes("MSTG-STORAGE")) return "m9-insecure-data-storage";
        if (masvsUpper.includes("PLATFORM") || masvsUpper.includes("MSTG-PLATFORM")) return "m8-security-misconfiguration";
        if (masvsUpper.includes("CODE") || masvsUpper.includes("MSTG-CODE")) return "m4-input-output-validation";
    }

    const scannerUpper = (options.scannerName || "").trim().toUpperCase();
    const ruleLower = (options.ruleId || "").trim().toLowerCase();
    const titleLower = (options.title || "").trim().toLowerCase();
    const descLower = (options.description || "").trim().toLowerCase();
    const locLower = (options.location || "").trim().toLowerCase();
    const combined = `${ruleLower} ${titleLower} ${descLower}`;

    // 4. Dedicated Scanner Mappings
    if (scannerUpper === "BUILD.PROP") {
        if (combined.includes("ro.adb.secure") || combined.includes("unauthenticated adb")) {
            return "m3-authn-authz";
        }
        if (combined.includes("test-keys")) {
            return "m2-supply-chain";
        }
        return "m8-security-misconfiguration";
    }
    if (scannerUpper === "TRUFFLEHOG" || scannerUpper === "APKLEAKS") {
        return "m1-credential-usage";
    }
    if (scannerUpper === "APKID") {
        return "m7-binary-protections";
    }
    if (scannerUpper === "EXODUS") {
        return "m6-privacy-controls";
    }
    if (scannerUpper.includes("VIRUSTOTAL") || scannerUpper.includes("QUARK")) {
        return "m2-supply-chain";
    }

    // 5. Rule Signature & Keyword Heuristics mapped to OWASP Mobile Top 10 (2024)
    if (
        ruleLower === "privacy-device-id" ||
        ruleLower === "security-log" ||
        ruleLower.startsWith("privacy-") ||
        /\b(tracker|telemetry|imei|imsi|mac[\s_-]?address|advertising[\s_-]?id|android[\s_-]?id|device[\s_-]?identifier|sensitive[\s_-]?log|diagnostic[\s_-]?and[\s_-]?debug[\s_-]?logging)\b/.test(
            combined
        )
    ) {
        return "m6-privacy-controls";
    }

    if (
        ruleLower === "detect-library" ||
        /\b(third[\s_-]?party[\s_-]?library|vulnerable[\s_-]?dependency|outdated[\s_-]?sdk|supply[\s_-]?chain)\b/.test(
            combined
        )
    ) {
        return "m2-supply-chain";
    }

    if (
        ruleLower === "detect-obfuscator" ||
        ruleLower === "detect-reflection" ||
        /\b(obfuscat|reflection|anti[\s_-]?debug|anti[\s_-]?vm|anti[\s_-]?disassembl|packer|root[\s_-]?detection|tamper[\s_-]?detection)\b/.test(
            combined
        )
    ) {
        return "m7-binary-protections";
    }

    if (
        /\b(hardcoded[\s_-]?(secret|key|password|token|credential)|api[\s_-]?key|private[\s_-]?key|aws[\s_-]?secret|secret[\s_-]?key|client[\s_-]?secret|bearer[\s_-]?token)\b/.test(
            combined
        )
    ) {
        return "m1-credential-usage";
    }

    if (
        /\b(md5|sha-?1|weak[\s_-]?(crypto|cipher|hash|encryption|key|prng|random)|aes[\s/_-]?ecb|des|3des|rc4|java\.util\.random|static[\s_-]?iv|cbc[\s_-]?with[\s_-]?static)\b/.test(
            combined
        )
    ) {
        return "m10-insufficient-cryptography";
    }

    if (
        ruleLower === "detect-url" ||
        /\b(cleartext[\s_-]?traffic|usescleartexttraffic|http:\/\/|ssl[\s_-]?pinning|certificate[\s_-]?pinning|trustmanager|hostnameverifier|allowallhostnameverifier|insecure[\s_-]?(ssl|tls|socket|communication))\b/.test(
            combined
        )
    ) {
        return "m5-insecure-communication";
    }

    if (
        ruleLower === "security-file-write" ||
        /\b(world[\s_-]?(readable|writable)|mode_world_(readable|writable)|sharedpreferences|sqlite[\s_-]?database[\s_-]?encryption|external[\s_-]?storage|insecure[\s_-]?(data[\s_-]?)?storage|temp[\s_-]?file)\b/.test(
            combined
        )
    ) {
        return "m9-insecure-data-storage";
    }

    if (
        ruleLower === "manifest-manip-activity" ||
        /\b(exported[\s_-]?(activity|service|receiver|provider|component)|improper[\s_-]?export|unprotected[\s_-]?broadcast|missing[\s_-]?(authentication|authorization|permission[\s_-]?guard))\b/.test(
            combined
        )
    ) {
        return "m3-authn-authz";
    }

    if (
        ruleLower.startsWith("manifest-") ||
        locLower.endsWith("androidmanifest.xml") ||
        locLower.endsWith("network_security_config.xml") ||
        /\b(allowbackup|allow[\s_-]?backup|manipulatable[\s_-]?backup|debuggable|network[\s_-]?security[\s_-]?config|testonly|test[\s_-]?only|taskaffinity|launchmode|open[\s_-]?permission)\b/.test(
            combined
        )
    ) {
        return "m8-security-misconfiguration";
    }

    return "m4-input-output-validation";
}

/**
 * Validates that a route identifier (Relay ID, hex ObjectId, or slug) is safe to embed in internal route paths.
 */
export function isSafeRouteId(id: unknown): id is string {
    if (typeof id !== "string") return false;
    const trimmed = id.trim();
    return trimmed.length > 0 && trimmed.length <= 256 && /^[a-zA-Z0-9_.:=-]+$/.test(trimmed);
}

/**
 * Validates that a scanner name matches the expected safe identifier pattern.
 */
export function isSafeScannerName(scannerName: unknown): scannerName is string {
    if (typeof scannerName !== "string") return false;
    const trimmed = scannerName.trim();
    return /^[a-zA-Z0-9_.-]{1,100}$/.test(trimmed);
}

/**
 * Validates that an internal return path (e.g. from location.state.returnTo) is a safe
 * relative SPA route and cannot trigger open redirects or path traversal.
 */
export function isSafeInternalReturnPath(path: unknown): path is string {
    if (typeof path !== "string") return false;
    const trimmed = path.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
        return false;
    }
    if (trimmed.includes("..")) {
        return false;
    }
    return /^\/[a-zA-Z0-9/_.:=?&-]{1,512}$/.test(trimmed);
}

/**
 * Normalized Interesting Security Finding across all scanners
 */
export interface InterestingFinding {
    id: string;
    reportId: string;
    reportPk?: string;
    scannerName: string;
    severity: NormalizedSeverity;
    title: string;
    description?: string;
    snippet?: string;
    location?: string;
    appId?: string;
    appFilename?: string;
    appPackagename?: string;
    partitionName?: string;
    category?: FindingCategory;
    cwe?: string;
    owaspMobile?: string;
    masvs?: string;
    firmwareId?: string;
    reportDate?: string;
}

export interface ReportItemForFindingExtraction {
    id?: string | null;
    pk?: string | null;
    scannerName?: string | null;
    reportDate?: string | null;
    scanStatus?: string | null;
    results?: unknown;
    virusTotalAnalysis?: unknown;
    androidAppIdReference?: {
        id?: string | null;
        pk?: string | null;
        filename?: string | null;
        packagename?: string | null;
        firmwareIdReference?: {
            id?: string | null;
            pk?: string | null;
        } | null;
    } | null;
}

const SEVERITY_WEIGHT: Record<NormalizedSeverity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    warning: 2,
    info: 0,
    unknown: 0,
};

/**
 * Deterministically sorts security findings by severity (Critical -> High -> Medium -> Low -> Info).
 */
export function sortFindingsBySeverity(findings: readonly InterestingFinding[]): InterestingFinding[] {
    return [...findings].sort(
        (a, b) => (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0)
    );
}

/**
 * Extracts and prioritizes interesting security findings from scanner reports.
 */
export function extractInterestingFindings(
    reports: ReportItemForFindingExtraction | ReportItemForFindingExtraction[] | null | undefined
): InterestingFinding[] {
    if (!reports) return [];
    const reportList = Array.isArray(reports) ? reports : [reports];
    const findings: InterestingFinding[] = [];

    for (const report of reportList) {
        if (!report) continue;
        const reportId = report.pk || report.id || "";
        const reportPk = report.pk || report.id || undefined;
        const scanner = (report.scannerName || "").trim();
        const scannerUpper = scanner.toUpperCase();
        const appId = report.androidAppIdReference?.id || report.androidAppIdReference?.pk || undefined;
        const appFilename = report.androidAppIdReference?.filename || undefined;
        const appPackagename = report.androidAppIdReference?.packagename || undefined;
        const firmwareId =
            report.androidAppIdReference?.firmwareIdReference?.id ||
            report.androidAppIdReference?.firmwareIdReference?.pk ||
            undefined;
        const reportDate = report.reportDate || undefined;

        // Parse results
        const { data } = parseReportResults(report.results);

        if (scannerUpper === "TRUFFLEHOG") {
            const th = extractTruffleHogFindings(data);
            th.findings.forEach((f, idx) => {
                const isVerified = f.verified;
                const severity: NormalizedSeverity = isVerified ? "high" : "medium";
                const location = f.filePath ? `${f.filePath}${f.line ? `:${f.line}` : ""}` : undefined;
                const snippet = f.redacted || f.raw;
                findings.push({
                    id: `${reportId}-th-${idx}`,
                    reportId,
                    reportPk,
                    scannerName: report.scannerName || "TruffleHog",
                    severity,
                    title: isVerified ? `Verified Secret: ${f.detectorType}` : `Unverified Secret Match: ${f.detectorType}`,
                    description: isVerified
                        ? "Active credential verified against live provider APIs"
                        : "Candidate secret detected by entropy and pattern matching",
                    snippet,
                    location,
                    appId,
                    appFilename,
                    appPackagename,
                    category: "m1-credential-usage",
                    cwe: "CWE-798",
                    owaspMobile: "M1: Improper Credential Usage",
                    masvs: "MASVS-STORAGE",
                    firmwareId,
                    reportDate,
                });
            });
        } else if (scannerUpper === "APKLEAKS") {
            const patterns = extractApkleaksFindings(data);
            patterns.forEach((p, idx) => {
                const sampleMatches = p.matches.slice(0, 3).join(", ");
                findings.push({
                    id: `${reportId}-apkleaks-${idx}`,
                    reportId,
                    reportPk,
                    scannerName: report.scannerName || "APKLeaks",
                    severity: "high",
                    title: `Exposed Pattern / Secret: ${p.patternName}`,
                    description: `${p.matches.length} matching string(s) uncovered in decompiled APK`,
                    snippet: sampleMatches,
                    appId,
                    appFilename,
                    appPackagename,
                    category: "m1-credential-usage",
                    cwe: "CWE-798",
                    owaspMobile: "M1: Improper Credential Usage",
                    masvs: "MASVS-STORAGE",
                    firmwareId,
                    reportDate,
                });
            });
        } else if (scannerUpper === "APKID") {
            const fileDetections = extractApkidFindings(data);
            fileDetections.forEach((fd, idx) => {
                if (fd.packers.length > 0) {
                    findings.push({
                        id: `${reportId}-apkid-packer-${idx}`,
                        reportId,
                        reportPk,
                        scannerName: report.scannerName || "APKiD",
                        severity: "high",
                        title: `Packer Detected: ${fd.packers.join(", ")}`,
                        description: "Anti-reverse engineering packer or protector identified in APK",
                        location: fd.filename,
                        appId,
                        appFilename,
                        appPackagename,
                        category: "m7-binary-protections",
                        cwe: "CWE-693",
                        owaspMobile: "M7: Insufficient Binary Protections",
                        masvs: "MASVS-RESILIENCE",
                        firmwareId,
                        reportDate,
                    });
                }
                if (fd.antiDebug.length > 0) {
                    findings.push({
                        id: `${reportId}-apkid-antidebug-${idx}`,
                        reportId,
                        reportPk,
                        scannerName: report.scannerName || "APKiD",
                        severity: "medium",
                        title: `Anti-Debug Protection: ${fd.antiDebug.join(", ")}`,
                        description: "App contains anti-debugging detection routines",
                        location: fd.filename,
                        appId,
                        appFilename,
                        appPackagename,
                        category: "m7-binary-protections",
                        cwe: "CWE-693",
                        owaspMobile: "M7: Insufficient Binary Protections",
                        masvs: "MASVS-RESILIENCE",
                        firmwareId,
                        reportDate,
                    });
                }
                if (fd.antiVm.length > 0) {
                    findings.push({
                        id: `${reportId}-apkid-antivm-${idx}`,
                        reportId,
                        reportPk,
                        scannerName: report.scannerName || "APKiD",
                        severity: "medium",
                        title: `Anti-VM Protection: ${fd.antiVm.join(", ")}`,
                        description: "App contains emulator / virtual machine detection routines",
                        location: fd.filename,
                        appId,
                        appFilename,
                        appPackagename,
                        category: "m7-binary-protections",
                        cwe: "CWE-693",
                        owaspMobile: "M7: Insufficient Binary Protections",
                        masvs: "MASVS-RESILIENCE",
                        firmwareId,
                        reportDate,
                    });
                }
                if (fd.antiDisassembly.length > 0) {
                    findings.push({
                        id: `${reportId}-apkid-antidisasm-${idx}`,
                        reportId,
                        reportPk,
                        scannerName: report.scannerName || "APKiD",
                        severity: "medium",
                        title: `Anti-Disassembly Protection: ${fd.antiDisassembly.join(", ")}`,
                        description: "App contains anti-disassembly detection routines",
                        location: fd.filename,
                        appId,
                        appFilename,
                        appPackagename,
                        category: "m7-binary-protections",
                        cwe: "CWE-693",
                        owaspMobile: "M7: Insufficient Binary Protections",
                        masvs: "MASVS-RESILIENCE",
                        firmwareId,
                        reportDate,
                    });
                }
            });
        } else if (scannerUpper.includes("VIRUSTOTAL")) {
            let vtAnalysis: any = report.virusTotalAnalysis;
            if (typeof vtAnalysis === "string") {
                try {
                    vtAnalysis = JSON.parse(vtAnalysis);
                } catch {
                    vtAnalysis = null;
                }
            }
            const positives = Number(
                data.positives ?? vtAnalysis?.positives ?? data.malicious ?? vtAnalysis?.stats?.malicious ?? 0
            );
            if (positives > 0) {
                findings.push({
                    id: `${reportId}-vt`,
                    reportId,
                    reportPk,
                    scannerName: report.scannerName || "VirusTotal",
                    severity: "high",
                    title: `Antivirus Detections: ${positives} engines flagged malicious`,
                    description: "VirusTotal security scanners detected malicious or suspicious signatures",
                    appId,
                    appFilename,
                    appPackagename,
                    category: "m2-supply-chain",
                    cwe: "CWE-506",
                    owaspMobile: "M2: Inadequate Supply Chain Security",
                    masvs: "MASVS-CODE",
                    firmwareId,
                    reportDate,
                });
            }
        } else if (scannerUpper === "EXODUS") {
            const ex = extractExodusFindings(data);
            if (ex.trackers.length > 0) {
                const names = ex.trackers.map((t) => t.name).join(", ");
                findings.push({
                    id: `${reportId}-exodus`,
                    reportId,
                    reportPk,
                    scannerName: report.scannerName || "Exodus",
                    severity: ex.trackers.length >= 3 ? "medium" : "low",
                    title: `Embedded Privacy Trackers (${ex.trackers.length} detected)`,
                    description: names,
                    appId,
                    appFilename,
                    appPackagename,
                    category: "m6-privacy-controls",
                    cwe: "CWE-359",
                    owaspMobile: "M6: Inadequate Privacy Controls",
                    masvs: "MASVS-PRIVACY",
                    firmwareId,
                    reportDate,
                });
            }
        } else if (scannerUpper === "TRUESEEING" || Array.isArray(data.issues)) {
            const issues = Array.isArray(data.issues) ? data.issues : [];
            let count = 0;
            for (let i = 0; i < issues.length; i++) {
                if (count > 50) break;
                const issue = issues[i];
                if (typeof issue === "object" && issue !== null) {
                    const rawSev = issue.severity || issue.level;
                    const normSev = normalizeSeverity(rawSev);
                    if (["critical", "high", "medium", "low"].includes(normSev)) {
                        const effectiveSev: NormalizedSeverity = normSev === "critical" ? "high" : normSev;
                        const title = issue.summary || issue.title || issue.sig || `Finding #${i + 1}`;
                        const desc = resolveFindingDescription({
                            description: issue.description,
                            synopsis: issue.synopsis,
                            sig: issue.sig,
                            summary: issue.summary,
                            solution: issue.solution,
                            instances: issue.instances,
                        });
                        const primaryInst = Array.isArray(issue.instances) && issue.instances[0];
                        const location = primaryInst?.source || undefined;
                        const rawCwe = typeof issue.cwe === "string" ? issue.cwe : undefined;
                        const category = classifyFindingCategory({
                            scannerName: report.scannerName || "Trueseeing",
                            ruleId: issue.sig,
                            title,
                            description: desc,
                            location,
                            cwe: rawCwe,
                        });
                        const catMeta = getFindingCategoryMeta(category);

                        findings.push({
                            id: `${reportId}-trueseeing-${i}`,
                            reportId,
                            reportPk,
                            scannerName: report.scannerName || "Trueseeing",
                            severity: effectiveSev,
                            title,
                            description: desc,
                            location,
                            appId,
                            appFilename,
                            appPackagename,
                            category,
                            cwe: extractNormalizedCweId(rawCwe) || catMeta.cwe,
                            owaspMobile: catMeta.label,
                            masvs: catMeta.masvs,
                            firmwareId,
                            reportDate,
                        });
                        count++;
                    }
                }
            }
        } else {
            // General static/dynamic scanners: MobSFScan, Super, QuarkEngine, FlowDroid, Qark, Androwarn
            const resultsObj = data.results || data.findings || data.vulnerabilities || (Array.isArray(data) ? null : data);
            if (resultsObj && typeof resultsObj === "object") {
                let count = 0;
                for (const [key, item] of Object.entries(resultsObj)) {
                    if (count > 50) break;
                    if (["error", "errors", "rawOutput", "summary", "stats", "files"].includes(key)) continue;
                    if (typeof item === "object" && item !== null) {
                        const metadata = (item as any).metadata || {};
                        const rawSev =
                            metadata.severity ||
                            (item as any).severity ||
                            (item as any).level ||
                            (item as any).type;
                        const normSev = normalizeSeverity(rawSev);
                        if (["critical", "high", "medium", "low"].includes(normSev)) {
                            const effectiveSev: NormalizedSeverity = normSev === "critical" ? "high" : normSev;
                            const desc =
                                metadata.description ||
                                (item as any).description ||
                                (item as any).title ||
                                key;
                            const rawCwe = metadata.cwe || (item as any).cwe;
                            const rawOwasp =
                                metadata["owasp-mobile"] ||
                                metadata.owasp_mobile ||
                                (item as any)["owasp-mobile"] ||
                                (item as any).owasp_mobile;
                            const rawMasvs = metadata.masvs || (item as any).masvs;
                            const filesArr = (item as any).files;
                            const location =
                                Array.isArray(filesArr) && filesArr[0]?.file_path ? filesArr[0].file_path : undefined;
                            const category = classifyFindingCategory({
                                scannerName: report.scannerName || scanner,
                                ruleId: key,
                                title: desc,
                                description: rawCwe ? `CWE: ${rawCwe}` : undefined,
                                location,
                                cwe: typeof rawCwe === "string" ? rawCwe : undefined,
                                owaspMobile: typeof rawOwasp === "string" ? rawOwasp : undefined,
                                masvs: typeof rawMasvs === "string" ? rawMasvs : undefined,
                            });
                            const catMeta = getFindingCategoryMeta(category);
                            findings.push({
                                id: `${reportId}-vuln-${key}-${count}`,
                                reportId,
                                reportPk,
                                scannerName: report.scannerName || scanner,
                                severity: effectiveSev,
                                title: desc,
                                description: rawCwe ? `CWE: ${rawCwe}` : undefined,
                                location,
                                appId,
                                appFilename,
                                appPackagename,
                                category,
                                cwe: extractNormalizedCweId(rawCwe) || catMeta.cwe,
                                owaspMobile: catMeta.label,
                                masvs: typeof rawMasvs === "string" && rawMasvs.trim() ? rawMasvs.trim() : catMeta.masvs,
                                firmwareId,
                                reportDate,
                            });
                            count++;
                        }
                    }
                }
            }
        }
    }

    return sortFindingsBySeverity(findings);
}

/**
 * Per-application security risk summary across a firmware image.
 */
export interface AppRiskSummary {
    appId: string;
    appPk?: string;
    appFilename: string;
    packagename?: string;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    totalFindings: number;
    scanners: string[];
    reportCount: number;
    riskScore: number;
}

/**
 * Aggregates scanner reports and extracted findings into a per-application risk ranking.
 * Uses `Map` and `Set` to prevent prototype pollution from untrusted firmware metadata.
 */
export function aggregateFirmwareAppRisks(
    reports: readonly ReportItemForFindingExtraction[] | null | undefined,
    findings: readonly InterestingFinding[] | null | undefined
): AppRiskSummary[] {
    const appMap = new Map<
        string,
        {
            appId: string;
            appPk?: string;
            appFilename: string;
            packagename?: string;
            highCount: number;
            mediumCount: number;
            lowCount: number;
            totalFindings: number;
            scannerSet: Set<string>;
            reportCount: number;
        }
    >();

    const getOrCreateApp = (
        appId: string,
        appPk?: string,
        appFilename?: string,
        packagename?: string
    ) => {
        let entry = appMap.get(appId);
        if (!entry) {
            entry = {
                appId,
                appPk,
                appFilename: appFilename || "Unknown App",
                packagename: packagename || undefined,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0,
                totalFindings: 0,
                scannerSet: new Set<string>(),
                reportCount: 0,
            };
            appMap.set(appId, entry);
        } else {
            if (!entry.appPk && appPk) entry.appPk = appPk;
            if (entry.appFilename === "Unknown App" && appFilename) entry.appFilename = appFilename;
            if (!entry.packagename && packagename) entry.packagename = packagename;
        }
        return entry;
    };

    if (Array.isArray(reports)) {
        for (const report of reports) {
            if (!report) continue;
            const ref = report.androidAppIdReference;
            const appId = (ref?.id || ref?.pk || "").trim();
            if (!appId) continue;

            const entry = getOrCreateApp(
                appId,
                ref?.pk || undefined,
                ref?.filename || undefined,
                ref?.packagename || undefined
            );
            entry.reportCount += 1;
            const scannerName = (report.scannerName || "").trim();
            if (scannerName) {
                entry.scannerSet.add(scannerName);
            }
        }
    }

    if (Array.isArray(findings)) {
        for (const finding of findings) {
            if (!finding || !finding.appId) continue;
            const appId = finding.appId.trim();
            if (!appId) continue;

            const entry = getOrCreateApp(
                appId,
                undefined,
                finding.appFilename,
                finding.appPackagename
            );
            const scannerName = (finding.scannerName || "").trim();
            if (scannerName) {
                entry.scannerSet.add(scannerName);
            }

            if (finding.severity === "critical" || finding.severity === "high") {
                entry.highCount += 1;
            } else if (finding.severity === "medium" || finding.severity === "warning") {
                entry.mediumCount += 1;
            } else {
                entry.lowCount += 1;
            }
            entry.totalFindings += 1;
        }
    }

    const result: AppRiskSummary[] = [];
    for (const entry of appMap.values()) {
        const riskScore =
            entry.highCount * 25 +
            entry.mediumCount * 5 +
            entry.lowCount * 1;
        result.push({
            appId: entry.appId,
            appPk: entry.appPk,
            appFilename: entry.appFilename,
            packagename: entry.packagename,
            highCount: entry.highCount,
            mediumCount: entry.mediumCount,
            lowCount: entry.lowCount,
            totalFindings: entry.totalFindings,
            scanners: Array.from(entry.scannerSet).sort((a, b) => a.localeCompare(b)),
            reportCount: entry.reportCount,
            riskScore,
        });
    }

    return result.sort((a, b) => {
        if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
        if (b.totalFindings !== a.totalFindings) return b.totalFindings - a.totalFindings;
        if (b.reportCount !== a.reportCount) return b.reportCount - a.reportCount;
        return a.appFilename.localeCompare(b.appFilename);
    });
}
