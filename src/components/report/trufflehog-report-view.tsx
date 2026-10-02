import { useMemo, useState } from "react";
import { extractTruffleHogFindings } from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CopyButton } from "@/components/ui/copy-button.tsx";
import { formatBytes } from "@/lib/format-utils.ts";
import {
    CheckCircle2Icon,
    ClockIcon,
    FileCodeIcon,
    KeyRoundIcon,
    LayersIcon,
    SearchIcon,
    ShieldAlertIcon,
    TerminalIcon,
} from "lucide-react";

interface TruffleHogReportViewProps {
    data: Record<string, any>;
}

export function TruffleHogReportView({ data }: TruffleHogReportViewProps) {
    const { summary, scanMode, findings, stderrLogs } = useMemo(
        () => extractTruffleHogFindings(data),
        [data]
    );

    const [search, setSearch] = useState("");
    const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const filteredFindings = useMemo(() => {
        return findings.filter((f) => {
            if (filterVerifiedOnly && !f.verified) return false;
            if (!search) return true;
            const term = search.toLowerCase();
            return (
                f.detectorType.toLowerCase().includes(term) ||
                (f.filePath && f.filePath.toLowerCase().includes(term)) ||
                (f.raw && f.raw.toLowerCase().includes(term)) ||
                (f.redacted && f.redacted.toLowerCase().includes(term))
            );
        });
    }, [findings, filterVerifiedOnly, search]);

    return (
        <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Verified Secrets
                            </span>
                            <ShieldAlertIcon
                                className={`size-4 ${
                                    summary.verifiedSecrets > 0
                                        ? "text-red-500"
                                        : "text-emerald-500"
                                }`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-bold mt-1 ${
                                summary.verifiedSecrets > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-foreground"
                            }`}
                        >
                            {summary.verifiedSecrets}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Active live credentials confirmed
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Unverified
                            </span>
                            <KeyRoundIcon className="size-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {summary.unverifiedSecrets}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Potential secret matches found
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Data Scanned
                            </span>
                            <LayersIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {formatBytes(summary.bytes)}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {summary.chunks.toLocaleString()} chunks inspected
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Duration
                            </span>
                            <ClockIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground truncate">
                            {summary.duration}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">
                            Mode: {scanMode}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Findings Section */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <KeyRoundIcon className="size-4 text-primary" />
                                Detected Secrets & Tokens
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {findings.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Secrets identified by TruffleHog detectors.
                            </CardDescription>
                        </div>

                        {/* Search and Filters */}
                        {findings.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="relative w-48 sm:w-64">
                                    <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search detector, file, secret..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 h-9 text-xs"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={filterVerifiedOnly ? "default" : "outline"}
                                    onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                                    className="h-9 text-xs"
                                >
                                    Verified Only
                                </Button>
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
                                No Secrets Detected
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                TruffleHog completed its scan without finding any verified or unverified credentials or tokens in this application.
                            </p>
                        </div>
                    ) : filteredFindings.length === 0 ? (
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            No findings matching your search filter.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFindings.map((finding, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-lg border border-border/70 bg-card hover:bg-muted/30 transition-colors space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-0.5">
                                                {finding.detectorType}
                                            </Badge>
                                            {finding.verified ? (
                                                <Badge variant="destructive" className="text-xs">
                                                    Verified Live Secret
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs">
                                                    Unverified Pattern Match
                                                </Badge>
                                            )}
                                        </div>

                                        {finding.filePath && (
                                            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                                                <FileCodeIcon className="size-3.5" />
                                                {finding.filePath}
                                                {finding.line ? `:${finding.line}` : ""}
                                            </span>
                                        )}
                                    </div>

                                    {(finding.redacted || finding.raw) && (
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/60 border border-border/60">
                                            <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                                {finding.redacted || finding.raw}
                                            </code>
                                            <CopyButton
                                                value={finding.raw || finding.redacted || ""}
                                                label="Copy secret"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Diagnostic Logs (Collapsible) */}
            {stderrLogs.length > 0 && (
                <Card className="border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <TerminalIcon className="size-4 text-muted-foreground" />
                                Scanner Diagnostic Log
                                <Badge variant="outline" className="text-[11px] font-mono">
                                    {stderrLogs.length} events
                                </Badge>
                            </CardTitle>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowLogs(!showLogs)}
                                className="h-7 text-xs"
                            >
                                {showLogs ? "Hide Logs" : "Show Logs"}
                            </Button>
                        </div>
                    </CardHeader>
                    {showLogs && (
                        <CardContent className="pt-0">
                            <div className="p-3 rounded-lg bg-zinc-950 text-zinc-200 dark:bg-zinc-900 font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
                                {stderrLogs.map((log, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <span className="text-zinc-500 shrink-0">
                                            {log.ts ? new Date(log.ts).toLocaleTimeString() : "--:--:--"}
                                        </span>
                                        <span className="text-zinc-400">[{log.level || "info"}]</span>
                                        <span className="text-zinc-100 break-all">{log.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}
        </div>
    );
}
