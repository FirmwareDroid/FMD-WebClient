import { useMemo, useState } from "react";
import { getSeverityBadgeProps, normalizeSeverity, NormalizedSeverity } from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    AlertTriangleIcon,
    CheckCircle2Icon,
    FileCodeIcon,
    SearchIcon,
    ShieldAlertIcon,
} from "lucide-react";

export interface UnifiedFinding {
    id: string;
    title: string;
    severity: NormalizedSeverity;
    description?: string;
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
                        description: `Confidence: ${item.confidence || "Unknown"}, Score: ${item.score ?? "\u2014"}`,
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
                    list.push({
                        id: `vuln-${i}`,
                        title: item.title || item.name || item.id || `Finding #${i + 1}`,
                        severity: normalizeSeverity(item.severity || item.level),
                        description: item.description || item.details,
                        filePath: item.file || item.path,
                        lines: item.line ? [item.line] : undefined,
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
                (f.cwe && f.cwe.toLowerCase().includes(term))
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
                                        placeholder="Search title, file, CWE..."
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
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant={badgeProps.variant}
                                                        className={`text-xs ${badgeProps.className}`}
                                                    >
                                                        {badgeProps.label}
                                                    </Badge>
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
                                            <p className="text-xs text-muted-foreground">
                                                {finding.description}
                                            </p>
                                        )}

                                        {finding.filePath && (
                                            <div className="font-mono text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                                                <FileCodeIcon className="size-3.5" />
                                                <span className="text-foreground">{finding.filePath}</span>
                                                {finding.lines && finding.lines.length > 0 && (
                                                    <span>(lines: {finding.lines.join(", ")})</span>
                                                )}
                                            </div>
                                        )}

                                        {finding.snippet && (
                                            <pre className="p-2 rounded-md bg-muted/60 border border-border/60 font-mono text-xs text-foreground overflow-x-auto">
                                                {finding.snippet}
                                            </pre>
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
