import { useMemo, useState } from "react";
import { extractExodusFindings } from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    CheckCircle2Icon,
    ExternalLinkIcon,
    EyeOffIcon,
    KeyIcon,
    LayersIcon,
    SearchIcon,
    ShieldAlertIcon,
} from "lucide-react";

interface ExodusReportViewProps {
    data: Record<string, any>;
}

export function ExodusReportView({ data }: ExodusReportViewProps) {
    const { trackers, permissions } = useMemo(() => extractExodusFindings(data), [data]);
    const [search, setSearch] = useState("");

    const uniqueCategories = useMemo(() => {
        const set = new Set<string>();
        for (const t of trackers) {
            for (const c of t.categories) set.add(c);
        }
        return Array.from(set);
    }, [trackers]);

    const filteredTrackers = useMemo(() => {
        if (!search) return trackers;
        const term = search.toLowerCase();
        return trackers.filter(
            (t) =>
                t.name.toLowerCase().includes(term) ||
                t.categories.some((c) => c.toLowerCase().includes(term))
        );
    }, [trackers, search]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Trackers Detected
                            </span>
                            <EyeOffIcon
                                className={`size-4 ${
                                    trackers.length > 0 ? "text-amber-500" : "text-emerald-500"
                                }`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-bold mt-1 ${
                                trackers.length > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                            }`}
                        >
                            {trackers.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Analytics, ad networks, telemetry
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Categories
                            </span>
                            <LayersIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {uniqueCategories.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Profiling, crashes, ads, locations
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Permissions
                            </span>
                            <KeyIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {permissions.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Permissions scanned by Exodus
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Trackers List */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <ShieldAlertIcon className="size-4 text-primary" />
                                Embedded Privacy Trackers
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {trackers.length}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Third-party tracking libraries and profiling components identified in the application.
                            </CardDescription>
                        </div>

                        {trackers.length > 0 && (
                            <div className="relative w-48 sm:w-64">
                                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter trackers or categories..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 text-xs"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {trackers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2Icon className="size-8" />
                            </div>
                            <h3 className="font-semibold text-base text-foreground">
                                No Trackers Detected
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Exodus Privacy did not detect any known advertising or telemetry trackers in this application.
                            </p>
                        </div>
                    ) : filteredTrackers.length === 0 ? (
                        <div className="text-center p-8 text-sm text-muted-foreground">
                            No trackers match your search query.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredTrackers.map((tracker, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-lg border border-border/70 bg-card space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-sm text-foreground">
                                            {tracker.name}
                                        </h4>
                                        {tracker.website && (
                                            <a
                                                href={tracker.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
                                            >
                                                Learn more
                                                <ExternalLinkIcon className="size-3" />
                                            </a>
                                        )}
                                    </div>

                                    {tracker.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {tracker.categories.map((c, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="text-[11px] bg-muted text-muted-foreground"
                                                >
                                                    {c}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {tracker.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {tracker.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Scanned Permissions */}
            {permissions.length > 0 && (
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <KeyIcon className="size-4 text-muted-foreground" />
                            Scanned Permissions ({permissions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                            {permissions.map((p, idx) => (
                                <Badge key={idx} variant="outline" className="font-mono text-xs">
                                    {p}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
