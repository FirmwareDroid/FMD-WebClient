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
                const severity: NormalizedSeverity = isVerified ? "critical" : "medium";
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
                    severity: "critical",
                    title: `Antivirus Detections: ${positives} engines flagged malicious`,
                    description: "VirusTotal security scanners detected malicious or suspicious signatures",
                    appId,
                    appFilename,
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

                        findings.push({
                            id: `${reportId}-trueseeing-${i}`,
                            reportId,
                            reportPk,
                            scannerName: report.scannerName || "Trueseeing",
                            severity: normSev,
                            title,
                            description: desc,
                            location,
                            appId,
                            appFilename,
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
                        const rawSev =
                            (item as any).metadata?.severity ||
                            (item as any).severity ||
                            (item as any).level ||
                            (item as any).type;
                        const normSev = normalizeSeverity(rawSev);
                        if (["critical", "high", "medium", "low"].includes(normSev)) {
                            const desc =
                                (item as any).metadata?.description ||
                                (item as any).description ||
                                (item as any).title ||
                                key;
                            const cwe = (item as any).metadata?.cwe || (item as any).cwe;
                            const filesArr = (item as any).files;
                            const location =
                                Array.isArray(filesArr) && filesArr[0]?.file_path ? filesArr[0].file_path : undefined;
                            findings.push({
                                id: `${reportId}-vuln-${key}-${count}`,
                                reportId,
                                reportPk,
                                scannerName: report.scannerName || scanner,
                                severity: normSev,
                                title: desc,
                                description: cwe ? `CWE: ${cwe}` : undefined,
                                location,
                                appId,
                                appFilename,
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

    // Sort findings: Critical first, then High, Medium, Low, Info
    const severityWeight: Record<NormalizedSeverity, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
        warning: 2,
        info: 0,
        unknown: 0,
    };

    return findings.sort((a, b) => (severityWeight[b.severity] ?? 0) - (severityWeight[a.severity] ?? 0));
}
