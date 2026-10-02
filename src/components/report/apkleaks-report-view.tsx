import { useMemo, useState } from "react";
import { extractApkleaksFindings } from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CopyButton } from "@/components/ui/copy-button.tsx";
import {
    CheckCircle2Icon,
    KeyRoundIcon,
    LayersIcon,
    SearchIcon,
    ShieldAlertIcon,
} from "lucide-react";

interface ApkleaksReportViewProps {
    data: Record<string, any>;
}

export function ApkleaksReportView({ data }: ApkleaksReportViewProps) {
    const findings = useMemo(() => extractApkleaksFindings(data), [data]);
    const [search, setSearch] = useState("");

    const totalMatches = useMemo(() => {
        return findings.reduce((acc, f) => acc + f.matches.length, 0);
    }, [findings]);

    const filteredFindings = useMemo(() => {
        if (!search) return findings;
        const term = search.toLowerCase();
        return findings
            .map((f) => {
                const patternMatches = f.patternName.toLowerCase().includes(term);
                if (patternMatches) return f;
                const matches = f.matches.filter((m) => m.toLowerCase().includes(term));
                return matches.length > 0 ? { ...f, matches } : null;
            })
            .filter((f): f is NonNullable<typeof f> => f !== null);
    }, [findings, search]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Patterns Matched
                            </span>
                            <LayersIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {findings.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Distinct regex secret rules triggered
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Total Leaks / Tokens
                            </span>
                            <ShieldAlertIcon
                                className={`size-4 ${
                                    totalMatches > 0 ? "text-amber-500" : "text-emerald-500"
                                }`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-bold mt-1 ${
                                totalMatches > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                            }`}
                        >
                            {totalMatches}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Strings, endpoints, and credentials found
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Patterns Accordion / List */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <KeyRoundIcon className="size-4 text-primary" />
                                Discovered Secrets & Endpoints
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {totalMatches}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                High-entropy strings, API tokens, and URLs extracted by APKLeaks.
                            </CardDescription>
                        </div>

                        {findings.length > 0 && (
                            <div className="relative w-48 sm:w-64">
                                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search patterns or values..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 text-xs"
                                />
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
                                No Sensitive Leaks Found
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                APKLeaks scanned the decompiled assets and source code without finding any known API tokens or hardcoded secrets.
                            </p>
                        </div>
                    ) : filteredFindings.length === 0 ? (
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            No leaks match your search filter.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFindings.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-lg border border-border/70 bg-card space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                                            {item.patternName}
                                        </h4>
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            {item.matches.length} {item.matches.length === 1 ? "match" : "matches"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1.5">
                                        {item.matches.map((matchVal, mIdx) => (
                                            <div
                                                key={mIdx}
                                                className="flex items-center gap-2 p-2 rounded-md bg-muted/60 border border-border/60 text-xs"
                                            >
                                                <code className="font-mono text-foreground break-all flex-1 select-all">
                                                    {matchVal}
                                                </code>
                                                <CopyButton value={matchVal} label="Copy match" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
