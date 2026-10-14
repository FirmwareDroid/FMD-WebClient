import { useMemo, useState } from "react";
import {
    getSeverityBadgeProps,
    normalizeSeverity,
    NormalizedSeverity,
    resolveFindingDescription,
} from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    AlertTriangleIcon,
    CheckCircle2Icon,
    ChevronDownIcon,
    ChevronRightIcon,
    FileCodeIcon,
    SearchIcon,
    ShieldAlertIcon,
} from "lucide-react";

export interface UnifiedFindingInstance {
    info?: string;
    source?: string | null;
    row?: number | null;
    col?: number | null;
}

export interface UnifiedFinding {
    id: string;
    title: string;
    severity: NormalizedSeverity;
    description?: string;
    sig?: string;
    cvss3_score?: number;
    cvss3_vector?: string;
    solution?: string;
    instances?: UnifiedFindingInstance[];
    cwe?: string;
    owasp?: string;
    filePath?: string;
    lines?: number[];
    snippet?: string;
    extra?: Record<string, any>;
}

interface VulnerabilitiesReportViewProps {
    data: Record<string, any>;
    scannerName: string;
}

function FindingInstances({ instances }: { instances: UnifiedFindingInstance[] }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="pt-1 space-y-1.5">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 focus:outline-none"
            >
                {expanded ? (
                    <>
                        <ChevronDownIcon className="size-3.5" />
                        Hide instances ({instances.length})
                    </>
                ) : (
                    <>
                        <ChevronRightIcon className="size-3.5" />
                        Show all {instances.length} instances
                    </>
                )}
            </button>
            {expanded && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto p-2.5 rounded-md bg-muted/40 border border-border/40 font-mono text-xs">
                    {instances.map((inst, idx) => (
                        <div key={idx} className="pb-1.5 border-b border-border/30 last:border-0 last:pb-0 space-y-0.5">
                            {inst.source && (
                                <div className="text-foreground flex items-center gap-1.5 truncate">
                                    <FileCodeIcon className="size-3 shrink-0 text-muted-foreground" />
                                    <span className="truncate">{inst.source}</span>
                                    {inst.row ? <span className="text-muted-foreground shrink-0">:{inst.row}</span> : null}
                                </div>
                            )}
                            {inst.info && (
                                <div className="text-muted-foreground pl-4 truncate">
                                    {inst.info}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function VulnerabilitiesReportView({ data, scannerName }: VulnerabilitiesReportViewProps) {
    const findings: UnifiedFinding[] = useMemo(() => {
        const list: UnifiedFinding[] = [];

        // 1. Check MobSFScan format: data.results
        const mobsfResults = data.results || data;
        if (typeof mobsfResults === "object" && mobsfResults !== null) {
            for (const [ruleId, ruleObj] of Object.entries(mobsfResults)) {
                if (typeof ruleObj === "object" && ruleObj !== null) {
                    const metadata = (ruleObj as any).metadata || {};
                    const files = (ruleObj as any).files || [];
                    const severity = normalizeSeverity(metadata.severity || (ruleObj as any).severity);

                    if (files.length > 0) {
                        for (let i = 0; i < files.length; i++) {
                            const f = files[i];
                            list.push({
                                id: `${ruleId}-${i}`,
                                title: metadata.description || ruleId,
                                severity,
                                description: metadata.description,
                                cwe: metadata.cwe,
                                owasp: metadata.owasp_mobile,
                                filePath: f.file_path,
                                lines: f.match_lines,
                                snippet: f.match_string,
                            });
                        }
                    } else if (metadata.description || (ruleObj as any).description) {
                        list.push({
                            id: ruleId,
                            title: metadata.description || ruleId,
                            severity,
                            description: metadata.description || (ruleObj as any).description,
                            cwe: metadata.cwe,
                            owasp: metadata.owasp_mobile,
                        });
                    }
                }
            }
        }

        // 2. Check Super / severity key format (critical, high, medium, low)
        const severities: NormalizedSeverity[] = ["critical", "high", "medium", "low", "warning", "info"];
        for (const sev of severities) {
            const arr = data[sev] || data[sev.toUpperCase()];
            if (Array.isArray(arr)) {
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    if (typeof item === "object" && item !== null) {
                        list.push({
                            id: `${sev}-${i}`,
                            title: item.title || item.name || item.vulnerability || `${sev.toUpperCase()} Issue`,
                            severity: normalizeSeverity(sev),
                            description: item.description || item.detail,
                            filePath: item.file || item.path,
                            lines: item.line ? [item.line] : undefined,
                            cwe: item.cwe,
                        });
                    } else if (typeof item === "string") {
                        list.push({
                            id: `${sev}-${i}`,
                            title: item,
                            severity: normalizeSeverity(sev),
                        });
                    }
                }
            }
        }

        // 3. Check QuarkEngine malware / crimes format
        if (Array.isArray(data.malware)) {
            for (let i = 0; i < data.malware.length; i++) {
                const item = data.malware[i];
                if (typeof item === "object" && item !== null) {
                    list.push({
                        id: `malware-${i}`,
                        title: item.crime || item.rule || "Suspicious Behavior",
                        severity: "high",
                        description: `Confidence: ${item.confidence || "Unknown"}, Score: ${item.score ?? "—"}`,
                        extra: item,
                    });
                }
            }
        }

        // 4. Check Trueseeing / vulnerabilities array format
        const vulnsArray = data.vulnerabilities || data.issues || data.findings;
        if (Array.isArray(vulnsArray)) {
            for (let i = 0; i < vulnsArray.length; i++) {
                const item = vulnsArray[i];
                if (typeof item === "object" && item !== null) {
                    const primaryInstance = Array.isArray(item.instances) && item.instances[0];
                    const filePath =
                        item.file ||
                        item.path ||
                        (primaryInstance && typeof primaryInstance.source === "string" ? primaryInstance.source : undefined);
                    const lines = item.line
                        ? [item.line]
                        : primaryInstance && typeof primaryInstance.row === "number" && primaryInstance.row > 0
                        ? [primaryInstance.row]
                        : undefined;
                    const snippet =
                        item.snippet ||
                        (primaryInstance && typeof primaryInstance.info === "string" && primaryInstance.info.trim().length > 0
                            ? primaryInstance.info
                            : undefined);

                    const title =
                        item.summary ||
                        item.title ||
                        item.name ||
                        item.sig ||
                        item.id ||
                        `Finding #${i + 1}`;

                    const description = resolveFindingDescription({
                        description: item.description,
                        synopsis: item.synopsis,
                        sig: item.sig,
                        summary: item.summary,
                        solution: item.solution,
                        instances: item.instances,
                    });

                    list.push({
                        id: `vuln-${i}`,
                        title,
                        severity: normalizeSeverity(item.severity || item.level),
                        description,
                        sig: typeof item.sig === "string" ? item.sig : undefined,
                        cvss3_score: typeof item.cvss3_score === "number" ? item.cvss3_score : undefined,
                        cvss3_vector: typeof item.cvss3_vector === "string" ? item.cvss3_vector : undefined,
                        solution: typeof item.solution === "string" ? item.solution : undefined,
                        instances: Array.isArray(item.instances) ? item.instances : undefined,
                        filePath,
                        lines,
                        snippet,
                        cwe: item.cwe,
                    });
                }
            }
        }

        return list;
    }, [data]);

    const [search, setSearch] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState<NormalizedSeverity | "all">("all");

    const severityCounts = useMemo(() => {
        const counts: Record<string, number> = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            info: 0,
        };
        for (const f of findings) {
            const s = f.severity in counts ? f.severity : "info";
            counts[s] = (counts[s] || 0) + 1;
        }
        return counts;
    }, [findings]);

    const filteredFindings = useMemo(() => {
        return findings.filter((f) => {
            if (selectedSeverity !== "all" && f.severity !== selectedSeverity) {
                return false;
            }
            if (!search) return true;
            const term = search.toLowerCase();
            return (
                f.title.toLowerCase().includes(term) ||
                (f.description && f.description.toLowerCase().includes(term)) ||
                (f.filePath && f.filePath.toLowerCase().includes(term)) ||
                (f.sig && f.sig.toLowerCase().includes(term)) ||
                (f.cwe && f.cwe.toLowerCase().includes(term)) ||
                (f.solution && f.solution.toLowerCase().includes(term))
            );
        });
    }, [findings, selectedSeverity, search]);

    return (
        <div className="space-y-6">
            {/* Severity Counters Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Card
                    className={`border-border/60 cursor-pointer transition-colors ${
                        selectedSeverity === "critical" ? "ring-2 ring-red-500" : ""
                    }`}
                    onClick={() =>
                        setSelectedSeverity(selectedSeverity === "critical" ? "all" : "critical")
                    }
                >
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400 uppercase">
                            <span>Critical</span>
                            <ShieldAlertIcon className="size-3.5" />
                        </div>
                        <div className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                            {severityCounts.critical}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-border/60 cursor-pointer transition-colors ${
                        selectedSeverity === "high" ? "ring-2 ring-rose-500" : ""
                    }`}
                    onClick={() =>
                        setSelectedSeverity(selectedSeverity === "high" ? "all" : "high")
                    }
                >
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-rose-500 uppercase">
                            <span>High</span>
                            <AlertTriangleIcon className="size-3.5" />
                        </div>
                        <div className="text-xl font-bold mt-1 text-rose-500">
                            {severityCounts.high}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-border/60 cursor-pointer transition-colors ${
                        selectedSeverity === "medium" ? "ring-2 ring-amber-500" : ""
                    }`}
                    onClick={() =>
                        setSelectedSeverity(selectedSeverity === "medium" ? "all" : "medium")
                    }
                >
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-500 uppercase">
                            <span>Medium</span>
                            <AlertTriangleIcon className="size-3.5" />
                        </div>
                        <div className="text-xl font-bold mt-1 text-amber-500">
                            {severityCounts.medium}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-border/60 cursor-pointer transition-colors ${
                        selectedSeverity === "low" ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() =>
                        setSelectedSeverity(selectedSeverity === "low" ? "all" : "low")
                    }
                >
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-blue-500 uppercase">
                            <span>Low</span>
                            <AlertTriangleIcon className="size-3.5" />
                        </div>
                        <div className="text-xl font-bold mt-1 text-blue-500">
                            {severityCounts.low}
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-border/60 cursor-pointer transition-colors ${
                        selectedSeverity === "info" ? "ring-2 ring-muted-foreground" : ""
                    }`}
                    onClick={() =>
                        setSelectedSeverity(selectedSeverity === "info" ? "all" : "info")
                    }
                >
                    <CardContent className="pt-3 pb-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                            <span>Info</span>
                            <FileCodeIcon className="size-3.5" />
                        </div>
                        <div className="text-xl font-bold mt-1 text-foreground">
                            {severityCounts.info}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Findings List */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <ShieldAlertIcon className="size-4 text-primary" />
                                {scannerName} Vulnerabilities & Warnings
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {findings.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Security weaknesses, dangerous configurations, and vulnerabilities identified in static analysis.
                            </CardDescription>
                        </div>

                        {findings.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative w-48 sm:w-64">
                                    <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search title, file, CWE, rule..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9 text-xs"
                                    />
                                </div>
                                {selectedSeverity !== "all" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedSeverity("all")}
                                        className="h-9 text-xs"
                                    >
                                        Clear Filter
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {findings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2Icon className="size-8" />
                            </div>
                            <h3 className="font-semibold text-base text-foreground">
                                No Vulnerabilities Detected
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {scannerName} completed its analysis without finding any matching vulnerability rules.
                            </p>
                        </div>
                    ) : filteredFindings.length === 0 ? (
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            No findings match your filter criteria.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFindings.map((finding) => {
                                const badgeProps = getSeverityBadgeProps(finding.severity);
                                return (
                                    <div
                                        key={finding.id}
                                        className="p-4 rounded-lg border border-border/70 bg-card hover:bg-muted/30 transition-colors space-y-2.5"
                                    >
                                        <div className="flex items-start justify-between gap-3 flex-wrap">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant={badgeProps.variant}
                                                        className={`text-xs ${badgeProps.className}`}
                                                    >
                                                        {badgeProps.label}
                                                    </Badge>
                                                    {finding.sig && (
                                                        <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground border-border/80">
                                                            {finding.sig}
                                                        </Badge>
                                                    )}
                                                    {finding.cvss3_score !== undefined && (
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-[11px] font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400"
                                                            title={finding.cvss3_vector || undefined}
                                                        >
                                                            CVSS {finding.cvss3_score.toFixed(1)}
                                                        </Badge>
                                                    )}
                                                    <h4 className="font-medium text-sm text-foreground">
                                                        {finding.title}
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                                {finding.cwe && (
                                                    <Badge variant="outline" className="font-mono text-[11px]">
                                                        {finding.cwe}
                                                    </Badge>
                                                )}
                                                {finding.owasp && (
                                                    <Badge variant="outline" className="font-mono text-[11px]">
                                                        {finding.owasp}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {finding.description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {finding.description}
                                            </p>
                                        )}

                                        {finding.solution && (
                                            <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground space-y-1">
                                                <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                    <ShieldAlertIcon className="size-3.5 shrink-0" />
                                                    Remediation / Solution
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                                                    {finding.solution}
                                                </p>
                                            </div>
                                        )}

                                        {finding.filePath && (
                                            <div className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 pt-1 truncate">
                                                <FileCodeIcon className="size-3.5 shrink-0" />
                                                <span className="text-foreground truncate">{finding.filePath}</span>
                                                {finding.lines && finding.lines.length > 0 && (
                                                    <span className="shrink-0">(lines: {finding.lines.join(", ")})</span>
                                                )}
                                            </div>
                                        )}

                                        {finding.snippet && (
                                            <pre className="p-2 rounded-md bg-muted/60 border border-border/60 font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
                                                {finding.snippet}
                                            </pre>
                                        )}

                                        {finding.instances && finding.instances.length > 1 && (
                                            <FindingInstances instances={finding.instances} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
