import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CopyButton } from "@/components/ui/copy-button.tsx";
import { formatDateTime, isIsoDateTimeString } from "@/lib/date-utils.ts";
import { LayersIcon, SearchIcon } from "lucide-react";

interface AdaptiveGenericReportViewProps {
    data: Record<string, any>;
    scannerName: string;
}

export function AdaptiveGenericReportView({ data, scannerName }: AdaptiveGenericReportViewProps) {
    const [search, setSearch] = useState("");

    const entries = useMemo(() => {
        return Object.entries(data)
            .filter(([k]) => k !== "__typename" && k !== "error" && k !== "errors")
            .map(([key, value]) => {
                let parsedVal = value;
                if (typeof value === "string") {
                    try {
                        parsedVal = JSON.parse(value);
                    } catch {
                        parsedVal = value;
                    }
                }
                return { key, value: parsedVal };
            });
    }, [data]);

    const filteredEntries = useMemo(() => {
        if (!search) return entries;
        const term = search.toLowerCase();
        return entries.filter(
            (e) =>
                e.key.toLowerCase().includes(term) ||
                JSON.stringify(e.value).toLowerCase().includes(term)
        );
    }, [entries, search]);

    return (
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <LayersIcon className="size-4 text-primary" />
                                {scannerName} Dynamic Analysis Payload
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {entries.length} sections
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Structured attributes and findings extracted dynamically from this scanner's payload.
                            </CardDescription>
                        </div>

                        {entries.length > 0 && (
                            <div className="relative w-48 sm:w-64">
                                <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter properties..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 text-xs"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    {entries.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No analysis data returned by this scanner.
                        </div>
                    ) : filteredEntries.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No properties match your search term.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEntries.map(({ key, value }, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-lg border border-border/70 bg-card space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-sm text-foreground capitalize">
                                            {key.replace(/_/g, " ")}
                                        </span>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {Array.isArray(value)
                                                ? `Array (${value.length})`
                                                : typeof value === "object" && value !== null
                                                ? "Object"
                                                : typeof value}
                                        </Badge>
                                    </div>

                                    {/* Render Primitive */}
                                    {typeof value !== "object" || value === null ? (
                                        <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50 text-xs">
                                            <span className="font-mono text-foreground break-all flex-1">
                                                {typeof value === "string" && isIsoDateTimeString(value)
                                                    ? formatDateTime(value)
                                                    : String(value ?? "\u2014")}
                                            </span>
                                            {value && <CopyButton value={String(value)} label={`Copy ${key}`} />}
                                        </div>
                                    ) : Array.isArray(value) ? (
                                        /* Render Array */
                                        value.length === 0 ? (
                                            <span className="text-xs text-muted-foreground italic">
                                                Empty list
                                            </span>
                                        ) : typeof value[0] !== "object" ? (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {value.map((item, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="font-mono text-xs bg-muted text-foreground"
                                                    >
                                                        {String(item)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-md bg-muted/40 border border-border/50 text-xs font-mono max-h-60 overflow-y-auto">
                                                <pre className="whitespace-pre-wrap break-all">
                                                    {JSON.stringify(value, null, 2)}
                                                </pre>
                                            </div>
                                        )
                                    ) : (
                                        /* Render Object */
                                        <div className="p-3 rounded-md bg-muted/40 border border-border/50 text-xs font-mono max-h-60 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap break-all">
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
