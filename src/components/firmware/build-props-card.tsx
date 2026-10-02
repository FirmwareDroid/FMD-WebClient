import { useMemo, useState } from "react";
import {
    SlidersHorizontalIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
    TerminalIcon,
    DownloadIcon,
    CopyIcon,
    CheckIcon,
    SearchIcon,
    CheckCircle2Icon,
    AlertTriangleIcon,
    FileCodeIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToastStore } from "@/stores/toast";
import {
    extractBuildPropHighlights,
    formatRawBuildProps,
    parseBuildPropDictionary,
    downloadBuildPropFile,
    PropCategory,
} from "@/lib/build-prop-utils";

export interface BuildPropItemReference {
    id: string;
    pk?: string | null;
    name: string;
    relativePath: string;
    partitionName?: string | null;
    fileSizeBytes?: number | null;
}

export interface BuildPropFileData {
    id: string;
    pk?: string | null;
    properties: string; // JSONString
    propertyKeys?: Array<string | null> | null;
    firmwareFileIdReference?: BuildPropItemReference | null;
}

export interface BuildPropsCardProps {
    buildPropFiles: BuildPropFileData[];
    loading?: boolean;
}

export function BuildPropsCard({ buildPropFiles, loading = false }: Readonly<BuildPropsCardProps>) {
    const toast = useToastStore();
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<PropCategory>("all");
    const [viewMode, setViewMode] = useState<"table" | "raw">("table");
    const [copiedRaw, setCopiedRaw] = useState(false);

    // Pick active file safely
    const activeFile = buildPropFiles[selectedFileIndex] ?? buildPropFiles[0];
    const activeFileProperties = activeFile?.properties;
    const activeFileRelativePath = activeFile?.firmwareFileIdReference?.relativePath;

    // Safely parse properties dict from JSONString
    const rawPropertiesMap: Record<string, string> = useMemo(() => {
        if (!activeFileProperties) return {};
        try {
            const parsed = JSON.parse(activeFileProperties) as Record<string, unknown>;
            const result: Record<string, string> = {};
            for (const [key, value] of Object.entries(parsed)) {
                result[key] = typeof value === "string" ? value : JSON.stringify(value);
            }
            return result;
        } catch (e) {
            console.error("Failed to parse build.prop JSON:", e);
            return {};
        }
    }, [activeFileProperties]);

    // Parse into structured items
    const parsedItems = useMemo(() => {
        return parseBuildPropDictionary(rawPropertiesMap);
    }, [rawPropertiesMap]);

    // Extract security & device identity highlights
    const highlights = useMemo(() => {
        return extractBuildPropHighlights(rawPropertiesMap);
    }, [rawPropertiesMap]);

    // Generate raw text content
    const rawContent = useMemo(() => {
        const filePath = activeFileRelativePath || "build.prop";
        return formatRawBuildProps(rawPropertiesMap, filePath);
    }, [rawPropertiesMap, activeFileRelativePath]);

    // Filter items based on category and search query
    const filteredItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return parsedItems.filter((item) => {
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            if (!matchesCategory) return false;

            if (!query) return true;
            return (
                item.displayKey.toLowerCase().includes(query) ||
                item.rawKey.toLowerCase().includes(query) ||
                item.value.toLowerCase().includes(query) ||
                (item.securityNote && item.securityNote.toLowerCase().includes(query))
            );
        });
    }, [parsedItems, selectedCategory, searchQuery]);

    // Category counts for badges
    const categoryCounts = useMemo(() => {
        const counts: Record<PropCategory, number> = {
            all: parsedItems.length,
            security: 0,
            device: 0,
            os_build: 0,
            runtime: 0,
            system: 0,
        };
        for (const item of parsedItems) {
            counts[item.category] = (counts[item.category] || 0) + 1;
        }
        return counts;
    }, [parsedItems]);

    const handleCopyRaw = async () => {
        try {
            await navigator.clipboard.writeText(rawContent);
            setCopiedRaw(true);
            toast.success("Raw build properties copied to clipboard.");
            setTimeout(() => setCopiedRaw(false), 2000);
        } catch {
            toast.error("Failed to copy build properties.");
        }
    };

    const handleDownload = () => {
        const ref = activeFile?.firmwareFileIdReference;
        const partition = ref?.partitionName ? `${ref.partitionName}-` : "";
        const baseName = ref?.name || "build.prop";
        const downloadName = `${partition}${baseName}`.replace(/[/\\?%*:|"<>]/g, "-");
        downloadBuildPropFile(downloadName, rawContent);
        toast.success(`Downloaded ${downloadName}`);
    };

    if (loading) {
        return (
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontalIcon className="size-5 text-primary" />
                        <CardTitle className="text-lg">Build Properties</CardTitle>
                    </div>
                    <CardDescription>Loading extracted build properties...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8">
                    <Spinner size="default" />
                </CardContent>
            </Card>
        );
    }

    if (!buildPropFiles || buildPropFiles.length === 0) {
        return (
            <Card className="border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <SlidersHorizontalIcon className="size-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Build Properties</CardTitle>
                    </div>
                    <CardDescription>
                        Configuration parameters extracted from the firmware image.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg border-border/60 bg-muted/10">
                        <FileCodeIcon className="size-10 text-muted-foreground/60 mb-2" />
                        <p className="text-sm font-medium text-foreground">No Build Properties Found</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                            No build.prop or default.prop files were discovered or indexed for this firmware image.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const fileRef = activeFile?.firmwareFileIdReference;
    const activeFileName = fileRef?.name || "build.prop";
    const activeFilePath = fileRef?.relativePath || activeFileName;
    const activePartition = fileRef?.partitionName || "system";

    return (
        <Card className="border-border/60 shadow-sm" data-testid="build-props-card">
            <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontalIcon className="size-5 text-primary" />
                            <CardTitle className="text-lg sm:text-xl font-bold">Build Properties</CardTitle>
                            <Badge variant="secondary" className="font-mono text-xs">
                                {buildPropFiles.length} {buildPropFiles.length === 1 ? "file" : "files"}
                            </Badge>
                        </div>
                        <CardDescription className="mt-1 text-xs sm:text-sm">
                            System configuration, platform specs, and security parameters parsed from firmware partitions.
                        </CardDescription>
                    </div>

                    {/* Mode & Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "raw")}>
                            <TabsList className="h-8">
                                <TabsTrigger value="table" className="text-xs gap-1.5 px-2.5">
                                    <SlidersHorizontalIcon className="size-3.5" />
                                    <span>Formatted</span>
                                </TabsTrigger>
                                <TabsTrigger value="raw" className="text-xs gap-1.5 px-2.5">
                                    <TerminalIcon className="size-3.5" />
                                    <span>Raw build.prop</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyRaw}
                            className="h-8 text-xs gap-1.5"
                            title="Copy all properties in build.prop format"
                        >
                            {copiedRaw ? <CheckIcon className="size-3.5 text-emerald-500" /> : <CopyIcon className="size-3.5" />}
                            <span>{copiedRaw ? "Copied" : "Copy"}</span>
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            className="h-8 text-xs gap-1.5"
                            title="Download raw .prop file"
                        >
                            <DownloadIcon className="size-3.5" />
                            <span>Download .prop</span>
                        </Button>
                    </div>
                </div>

                {/* Multi-File Tabs (when multiple build.prop files exist) */}
                {buildPropFiles.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 border-t border-border/40 mt-3">
                        <span className="text-xs text-muted-foreground mr-1 shrink-0 font-medium">Files:</span>
                        {buildPropFiles.map((file, idx) => {
                            const isSelected = idx === selectedFileIndex;
                            const fRef = file.firmwareFileIdReference;
                            const path = fRef?.relativePath || fRef?.name || `File #${idx + 1}`;
                            const partition = fRef?.partitionName;
                            const propCount = (() => {
                                try {
                                    return Object.keys(JSON.parse(file.properties || "{}")).length;
                                } catch {
                                    return 0;
                                }
                            })();

                            return (
                                <button
                                    key={file.id || idx}
                                    type="button"
                                    onClick={() => setSelectedFileIndex(idx)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
                                    }`}
                                >
                                    {partition && (
                                        <span className={`text-[10px] uppercase px-1 py-0.2 rounded ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                            {partition}
                                        </span>
                                    )}
                                    <span className="truncate max-w-[200px]" title={path}>{path}</span>
                                    <span className="opacity-70 text-[11px]">({propCount})</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-5">
                {/* File Header Bar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 truncate">
                        <FileCodeIcon className="size-4 text-primary shrink-0" />
                        <span className="font-mono text-foreground font-medium truncate">{activeFilePath}</span>
                        {activePartition && (
                            <Badge variant="outline" className="text-[10px] uppercase font-mono px-1.5 py-0 border-border">
                                {activePartition}
                            </Badge>
                        )}
                    </div>
                    <span className="font-mono shrink-0">{parsedItems.length} properties</span>
                </div>

                {/* Security & Identity Highlights Banner */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <ShieldCheckIcon className="size-4 text-primary" />
                            Security Posture & Core Indicators
                        </h4>
                        {highlights.securityPatch && (
                            <Badge variant="outline" className="font-mono text-xs border-border/80 bg-muted/20 gap-1.5">
                                <span className="text-muted-foreground">Patch Level:</span>
                                <span className="font-semibold text-foreground">{highlights.securityPatch}</span>
                            </Badge>
                        )}
                    </div>

                    {/* Security Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        {highlights.debuggable && (
                            highlights.debuggable.isRisk ? (
                                <Badge variant="destructive" className="gap-1.5 shadow-2xs">
                                    <ShieldAlertIcon className="size-3.5" />
                                    <span>Debuggable (ro.debuggable=1)</span>
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1.5">
                                    <ShieldCheckIcon className="size-3.5" />
                                    <span>Production (ro.debuggable=0)</span>
                                </Badge>
                            )
                        )}

                        {highlights.secure && (
                            highlights.secure.isRisk ? (
                                <Badge variant="destructive" className="gap-1.5 shadow-2xs">
                                    <ShieldAlertIcon className="size-3.5" />
                                    <span>Insecure (ro.secure=0)</span>
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1.5">
                                    <ShieldCheckIcon className="size-3.5" />
                                    <span>Enforced (ro.secure=1)</span>
                                </Badge>
                            )
                        )}

                        {highlights.adbSecure && (
                            highlights.adbSecure.isRisk ? (
                                <Badge variant="destructive" className="gap-1.5 shadow-2xs">
                                    <ShieldAlertIcon className="size-3.5" />
                                    <span>Unauthenticated ADB (ro.adb.secure=0)</span>
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1.5">
                                    <ShieldCheckIcon className="size-3.5" />
                                    <span>Authenticated ADB</span>
                                </Badge>
                            )
                        )}

                        {highlights.buildTags && (
                            highlights.buildTags.isTestKeys ? (
                                <Badge variant="secondary" className="border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1.5">
                                    <AlertTriangleIcon className="size-3.5" />
                                    <span>Signed with Test-Keys</span>
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-emerald-500/40 text-emerald-500 bg-emerald-500/10 gap-1.5">
                                    <CheckCircle2Icon className="size-3.5" />
                                    <span>Release-Keys</span>
                                </Badge>
                            )
                        )}

                        {highlights.buildType && (
                            <Badge
                                variant={highlights.buildType === "user" ? "secondary" : "outline"}
                                className={`text-xs capitalize ${
                                    highlights.buildType !== "user" ? "border-amber-500/40 text-amber-500 bg-amber-500/10" : ""
                                }`}
                            >
                                Build Type: {highlights.buildType}
                            </Badge>
                        )}
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Brand & Model</span>
                            <span className="font-semibold text-foreground truncate block">
                                {highlights.brand || highlights.manufacturer ? `${highlights.brand || ""} ${highlights.model || ""}`.trim() : "Generic Android"}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[11px]">OS Version</span>
                            <span className="font-semibold text-foreground block">
                                {highlights.androidVersion ? `Android ${highlights.androidVersion}` : "Unknown"}
                                {highlights.sdkVersion ? ` (API ${highlights.sdkVersion})` : ""}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[11px]">CPU Architecture</span>
                            <span className="font-mono font-semibold text-foreground block">
                                {highlights.cpuAbi || "N/A"}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[11px]">Build Date</span>
                            <span className="font-semibold text-foreground truncate block" title={highlights.buildDate}>
                                {highlights.buildDate || "N/A"}
                            </span>
                        </div>
                    </div>

                    {highlights.fingerprint && (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs font-mono bg-muted/20 px-2.5 py-1.5 rounded-md">
                            <span className="text-muted-foreground shrink-0 text-[11px]">Fingerprint:</span>
                            <span className="truncate text-foreground/90 font-mono text-[11px]" title={highlights.fingerprint}>
                                {highlights.fingerprint}
                            </span>
                            <CopyButton value={highlights.fingerprint} label="Copy fingerprint" />
                        </div>
                    )}
                </div>

                {/* View Mode Switching: Formatted Table vs Raw */}
                {viewMode === "table" ? (
                    <div className="space-y-4">
                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            {/* Category Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                                {(
                                    [
                                        { id: "all", label: "All" },
                                        { id: "security", label: "Security" },
                                        { id: "device", label: "Hardware" },
                                        { id: "os_build", label: "Build & OS" },
                                        { id: "runtime", label: "Runtime" },
                                        { id: "system", label: "System" },
                                    ] as const
                                ).map(({ id, label }) => {
                                    const count = categoryCounts[id] || 0;
                                    const isSelected = selectedCategory === id;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setSelectedCategory(id)}
                                            className={`px-2.5 py-1 rounded-md transition-colors shrink-0 text-xs flex items-center gap-1 ${
                                                isSelected
                                                    ? "bg-primary text-primary-foreground font-medium shadow-2xs"
                                                    : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
                                            }`}
                                        >
                                            <span>{label}</span>
                                            <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Input */}
                            <div className="relative sm:w-64 shrink-0">
                                <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Filter properties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs"
                                />
                            </div>
                        </div>

                        {/* Property Items Table */}
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-8 border border-dashed rounded-lg border-border/50 text-xs text-muted-foreground">
                                No properties matching "{searchQuery}".
                            </div>
                        ) : (
                            <div className="border border-border/60 rounded-lg overflow-hidden bg-card">
                                <div className="max-h-[500px] overflow-y-auto divide-y divide-border/40">
                                    {filteredItems.map((item) => {
                                        return (
                                            <div
                                                key={item.rawKey}
                                                className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 gap-2 hover:bg-muted/30 transition-colors text-xs ${
                                                    item.isSecuritySensitive && item.securitySeverity === "critical"
                                                        ? "bg-destructive/5"
                                                        : ""
                                                }`}
                                            >
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-mono font-medium text-foreground">
                                                            {item.displayKey}
                                                        </span>
                                                        {item.isSecuritySensitive && item.securitySeverity === "critical" && (
                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 gap-1">
                                                                <ShieldAlertIcon className="size-3" />
                                                                Risk
                                                            </Badge>
                                                        )}
                                                        {item.isSecuritySensitive && item.securitySeverity === "warning" && (
                                                            <Badge variant="secondary" className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-[10px] px-1.5 py-0 gap-1">
                                                                <AlertTriangleIcon className="size-3" />
                                                                Warning
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.securityNote && (
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {item.securityNote}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 sm:max-w-[50%]">
                                                    <span
                                                        className="font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40 truncate text-xs select-all"
                                                        title={item.value}
                                                    >
                                                        {item.value || <span className="italic text-muted-foreground/60">(empty)</span>}
                                                    </span>
                                                    <CopyButton value={item.value} label={`Copy ${item.displayKey}`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Raw build.prop View */
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Standard build.prop format (sorted)</span>
                            <span className="font-mono">{rawContent.split("\n").length} lines</span>
                        </div>
                        <div className="relative rounded-lg border border-border/80 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto max-h-[500px]">
                            <pre className="leading-relaxed select-text whitespace-pre">
                                {rawContent}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
