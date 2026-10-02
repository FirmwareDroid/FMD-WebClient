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
    other: Record<string, string[]>;
}

export function extractApkidFindings(data: Record<string, any>): ApkidFileDetection[] {
    const filesRaw = data.files ?? (typeof data === "object" ? data : {});
    const detections: ApkidFileDetection[] = [];

    for (const [filename, fileObj] of Object.entries(filesRaw)) {
        if (filename === "error" || filename === "errors" || typeof fileObj !== "object" || fileObj === null) {
            continue;
        }

        const toStrArray = (val: unknown): string[] => {
            if (Array.isArray(val)) return val.map(String);
            if (typeof val === "string" && val) return [val];
            return [];
        };

        const compilers = toStrArray((fileObj as any).compiler);
        const packers = toStrArray((fileObj as any).packer);
        const obfuscators = toStrArray((fileObj as any).obfuscator);
        const antiDebug = toStrArray((fileObj as any).anti_debug);
        const antiVm = toStrArray((fileObj as any).anti_vm);

        const other: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(fileObj as Record<string, any>)) {
            if (!["compiler", "packer", "obfuscator", "anti_debug", "anti_vm"].includes(k)) {
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
            other,
        });
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
        } else {
            // General static/dynamic scanners: MobSFScan, Super, Trueseeing, QuarkEngine, FlowDroid, Qark, Androwarn
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
