import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
    ShieldAlertIcon,
    ShieldCheckIcon,
    ExternalLinkIcon,
    SearchIcon,
    SmartphoneIcon,
    MapPinIcon,
    CodeIcon,
} from "lucide-react";
import { getSeverityBadgeProps, InterestingFinding, NormalizedSeverity } from "@/lib/report-utils.ts";
import { APPS_URL, FIRMWARE_URL, REPORTS_URL } from "@/components/ui/sidebar/app-sidebar.tsx";

interface SecurityFindingsCardProps {
    findings: InterestingFinding[];
    loading?: boolean;
    currentAppId?: string;
    defaultFirmwareId?: string;
    title?: string;
    description?: string;
}

export function SecurityFindingsCard({
    findings,
    loading = false,
    currentAppId,
    defaultFirmwareId,
    title = "Interesting Security Findings",
    description = "Critical vulnerabilities, verified secrets, and high-risk indicators detected across scanner reports.",
}: SecurityFindingsCardProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [severityFilter, setSeverityFilter] = useState<"all" | "critical_high">("all");
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate counts
    const criticalCount = findings.filter((f) => f.severity === "critical").length;
    const highCount = findings.filter((f) => f.severity === "high").length;
    const mediumCount = findings.filter((f) => f.severity === "medium").length;
    const lowCount = findings.filter((f) => f.severity === "low" || f.severity === "info").length;

    // Filter findings
    const filteredFindings = useMemo(() => {
        let list = findings;
        if (severityFilter === "critical_high") {
            list = list.filter((f) => f.severity === "critical" || f.severity === "high");
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(
                (f) =>
                    f.title.toLowerCase().includes(q) ||
                    f.scannerName.toLowerCase().includes(q) ||
                    (f.description && f.description.toLowerCase().includes(q)) ||
                    (f.location && f.location.toLowerCase().includes(q)) ||
                    (f.appFilename && f.appFilename.toLowerCase().includes(q))
            );
        }
        return list;
    }, [findings, severityFilter, searchQuery]);

    const displayedFindings = isExpanded ? filteredFindings : filteredFindings.slice(0, 6);

    const highestSeverity: NormalizedSeverity =
        criticalCount > 0 ? "critical" : highCount > 0 ? "high" : mediumCount > 0 ? "medium" : "low";

    const getSeverityBorderColor = (sev: NormalizedSeverity) => {
        switch (sev) {
            case "critical":
                return "border-l-red-600 dark:border-l-red-500";
            case "high":
                return "border-l-rose-500 dark:border-l-rose-400";
            case "medium":
                return "border-l-amber-500 dark:border-l-amber-400";
            case "low":
                return "border-l-blue-500 dark:border-l-blue-400";
            default:
                return "border-l-border";
        }
    };

    if (loading) {
        return (
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-72 mt-1" />
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                    <Skeleton className="h-20 w-full rounded-md" />
                    <Skeleton className="h-20 w-full rounded-md" />
                </CardContent>
            </Card>
        );
    }

    if (findings.length === 0) {
        return (
            <Card className="border-border/60 shadow-sm bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <ShieldCheckIcon className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                            <ShieldCheckIcon className="size-8" />
                        </div>
                        <h4 className="font-semibold text-foreground text-sm">
                            No Critical or High-Risk Security Findings Detected
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-md">
                            All completed security scans have reported zero verified secrets, known malicious signatures,
                            or critical vulnerabilities.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`p-2 rounded-lg ${
                                highestSeverity === "critical"
                                    ? "bg-red-500/15 text-red-500"
                                    : highestSeverity === "high"
                                    ? "bg-rose-500/15 text-rose-500"
                                    : "bg-amber-500/15 text-amber-500"
                            }`}
                        >
                            <ShieldAlertIcon className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {findings.length}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
                        </div>
                    </div>

                    {/* Severity Counters */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {criticalCount > 0 && (
                            <Badge variant="destructive" className="bg-red-600 text-white font-mono text-[11px] px-2">
                                {criticalCount} Critical
                            </Badge>
                        )}
                        {highCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-mono text-[11px] px-2"
                            >
                                {highCount} High
                            </Badge>
                        )}
                        {mediumCount > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono text-[11px] px-2"
                            >
                                {mediumCount} Medium
                            </Badge>
                        )}
                        {lowCount > 0 && (
                            <Badge variant="outline" className="font-mono text-[11px] px-2 text-muted-foreground">
                                {lowCount} Low
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3">
                    <div className="flex items-center gap-1.5">
                        <Button
                            type="button"
                            size="sm"
                            variant={severityFilter === "all" ? "secondary" : "ghost"}
                            className="h-7 text-xs px-2.5"
                            onClick={() => setSeverityFilter("all")}
                        >
                            All ({findings.length})
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={severityFilter === "critical_high" ? "secondary" : "ghost"}
                            className="h-7 text-xs px-2.5 text-rose-500 dark:text-rose-400 hover:text-rose-600"
                            onClick={() => setSeverityFilter("critical_high")}
                        >
                            Critical & High ({criticalCount + highCount})
                        </Button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Filter findings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-muted/30 border-border/70"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
                {displayedFindings.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                        No findings match your filter criteria.
                    </div>
                ) : (
                    displayedFindings.map((finding) => {
                        const sevBadge = getSeverityBadgeProps(finding.severity);
                        const targetFwId = finding.firmwareId || defaultFirmwareId;
                        const targetAppId = finding.appId || currentAppId;

                        const reportUrl =
                            targetFwId && targetAppId && finding.reportId
                                ? `${FIRMWARE_URL}/${encodeURIComponent(targetFwId)}${APPS_URL}/${encodeURIComponent(
                                      targetAppId
                                  )}${REPORTS_URL}/${encodeURIComponent(finding.scannerName)}-${encodeURIComponent(
                                      finding.reportId
                                  )}`
                                : null;

                        return (
                            <div
                                key={finding.id}
                                className={`group flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/60 bg-card hover:bg-muted/30 transition-all border-l-4 ${getSeverityBorderColor(
                                    finding.severity
                                )}`}
                            >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            variant={sevBadge.variant}
                                            className={`text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider ${sevBadge.className}`}
                                        >
                                            {sevBadge.label}
                                        </Badge>

                                        <Badge
                                            variant="outline"
                                            className="text-[11px] font-medium border-border/80 bg-muted/40"
                                        >
                                            {finding.scannerName}
                                        </Badge>

                                        {finding.appFilename && (
                                            <Badge
                                                variant="secondary"
                                                className="text-[11px] gap-1 font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                                                onClick={() => {
                                                    if (targetFwId && targetAppId) {
                                                        void navigate(
                                                            `${FIRMWARE_URL}/${encodeURIComponent(
                                                                targetFwId
                                                            )}${APPS_URL}/${encodeURIComponent(targetAppId)}`
                                                        );
                                                    }
                                                }}
                                                title="View app details"
                                            >
                                                <SmartphoneIcon className="size-3" />
                                                <span className="truncate max-w-[180px]">{finding.appFilename}</span>
                                            </Badge>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-semibold text-foreground break-words">
                                        {finding.title}
                                    </h4>

                                    {finding.description && (
                                        <p className="text-xs text-muted-foreground break-words">
                                            {finding.description}
                                        </p>
                                    )}

                                    {finding.location && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                                            <MapPinIcon className="size-3 text-primary shrink-0" />
                                            <code className="font-mono text-[11px] text-foreground/80 break-all select-all">
                                                {finding.location}
                                            </code>
                                        </div>
                                    )}

                                    {finding.snippet && (
                                        <div className="flex items-start gap-1.5 text-xs pt-1">
                                            <CodeIcon className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                                            <code className="font-mono text-[11px] p-1 rounded bg-muted/60 text-foreground break-all select-all max-h-16 overflow-y-auto block">
                                                {finding.snippet}
                                            </code>
                                        </div>
                                    )}
                                </div>

                                {reportUrl && (
                                    <div className="shrink-0 flex items-center md:self-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs font-medium border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors"
                                            onClick={() => void navigate(reportUrl)}
                                        >
                                            View Full Report
                                            <ExternalLinkIcon className="size-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {filteredFindings.length > 6 && (
                    <div className="pt-2 text-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setIsExpanded((prev) => !prev)}
                        >
                            {isExpanded
                                ? "Show Fewer Findings"
                                : `Show All ${filteredFindings.length} Findings (${filteredFindings.length - 6} more)`}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
