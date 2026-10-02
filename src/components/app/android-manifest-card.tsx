import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Input } from "@/components/ui/input.tsx";
import { CopyButton } from "@/components/ui/copy-button.tsx";
import {
    ActivityIcon,
    AlertTriangleIcon,
    CpuIcon,
    DownloadIcon,
    FileCodeIcon,
    RadioIcon,
    SearchIcon,
    ServerIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
    SlidersHorizontalIcon,
} from "lucide-react";
import {
    getAndroidCodename,
    ManifestComponent,
    ParsedAndroidManifest,
} from "@/lib/manifest-utils.ts";
import { downloadJsonFile } from "@/lib/format-utils.ts";

interface AndroidManifestCardProps {
    manifest: ParsedAndroidManifest;
    appName?: string;
}

export function AndroidManifestCard({ manifest, appName }: AndroidManifestCardProps) {
    const [permSearch, setPermSearch] = useState("");
    const [permFilter, setPermFilter] = useState<"all" | "dangerous">("all");
    const [compSearch, setCompSearch] = useState("");
    const [compType, setCompType] = useState<"activities" | "services" | "receivers" | "providers">("activities");

    const targetSdkCodename = getAndroidCodename(manifest.targetSdkVersion);
    const minSdkCodename = getAndroidCodename(manifest.minSdkVersion);

    const dangerousCount = useMemo(
        () => manifest.permissions.filter((p) => p.isDangerous).length,
        [manifest.permissions]
    );

    const filteredPermissions = useMemo(() => {
        let list = manifest.permissions;
        if (permFilter === "dangerous") {
            list = list.filter((p) => p.isDangerous);
        }
        if (permSearch.trim()) {
            const query = permSearch.toLowerCase().trim();
            list = list.filter((p) => p.name.toLowerCase().includes(query));
        }
        return list;
    }, [manifest.permissions, permFilter, permSearch]);

    const activeComponents: ManifestComponent[] = useMemo(() => {
        switch (compType) {
            case "activities":
                return manifest.activities;
            case "services":
                return manifest.services;
            case "receivers":
                return manifest.receivers;
            case "providers":
                return manifest.providers;
            default:
                return [];
        }
    }, [manifest, compType]);

    const filteredComponents = useMemo(() => {
        if (!compSearch.trim()) return activeComponents;
        const query = compSearch.toLowerCase().trim();
        return activeComponents.filter(
            (c) =>
                c.name.toLowerCase().includes(query) ||
                (c.permission && c.permission.toLowerCase().includes(query)) ||
                (c.authorities && c.authorities.toLowerCase().includes(query)) ||
                c.actions.some((a) => a.toLowerCase().includes(query))
        );
    }, [activeComponents, compSearch]);

    const handleDownloadJson = () => {
        const filename = `${appName || manifest.packageName || "app"}-manifest.json`;
        downloadJsonFile(filename, manifest.rawJson);
    };

    const countExported = (comps: ManifestComponent[]) =>
        comps.filter((c) => c.exported === true).length;

    return (
        <Card className="border-border/60 shadow-sm" data-slot="android-manifest-card">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FileCodeIcon className="size-4 text-primary" aria-hidden="true" />
                                Android Manifest
                            </CardTitle>
                            {manifest.targetSdkVersion && (
                                <Badge variant="secondary" className="font-mono text-xs">
                                    Target SDK {manifest.targetSdkVersion}
                                    {targetSdkCodename ? ` (${targetSdkCodename})` : ""}
                                </Badge>
                            )}
                            {manifest.minSdkVersion && (
                                <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
                                    Min SDK {manifest.minSdkVersion}
                                    {minSdkCodename ? ` (${minSdkCodename.split(" ")[0]})` : ""}
                                </Badge>
                            )}
                            {manifest.versionName && (
                                <Badge variant="outline" className="font-mono text-xs">
                                    v{manifest.versionName}
                                    {manifest.versionCode ? ` (${manifest.versionCode})` : ""}
                                </Badge>
                            )}
                        </div>
                        <CardDescription>
                            Parsed package structure, security configuration, components, and requested permissions.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={handleDownloadJson}
                            title="Download parsed manifest as JSON"
                        >
                            <DownloadIcon className="size-3.5" aria-hidden="true" />
                            Export JSON
                        </Button>
                    </div>
                </div>

                {/* Security Flags & Posture Bar */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                    {manifest.debuggable === true && (
                        <Badge variant="destructive" className="text-xs gap-1">
                            <ShieldAlertIcon className="size-3" aria-hidden="true" />
                            Debuggable (Security Risk)
                        </Badge>
                    )}
                    {manifest.debuggable === false && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                            <ShieldCheckIcon className="size-3" aria-hidden="true" />
                            Not Debuggable
                        </Badge>
                    )}
                    {manifest.usesCleartextTraffic === true && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 text-xs gap-1">
                            <AlertTriangleIcon className="size-3" aria-hidden="true" />
                            Cleartext Traffic Allowed
                        </Badge>
                    )}
                    {manifest.allowBackup !== undefined && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                            Backup: {manifest.allowBackup ? "Allowed" : "Disabled"}
                        </Badge>
                    )}
                    {manifest.sharedUserId && (
                        <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                            Shared UID: {manifest.sharedUserId}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-4">
                <Tabs defaultValue="permissions" className="w-full space-y-4">
                    <TabsList className="grid grid-cols-4 sm:inline-flex w-full sm:w-auto h-auto p-1 bg-muted/60">
                        <TabsTrigger value="permissions" className="text-xs py-1.5 gap-1.5">
                            <ShieldCheckIcon className="size-3.5" aria-hidden="true" />
                            <span>Permissions</span>
                            <Badge variant="secondary" className="ml-0.5 px-1 py-0 text-[10px] font-mono">
                                {manifest.permissions.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="components" className="text-xs py-1.5 gap-1.5">
                            <ActivityIcon className="size-3.5" aria-hidden="true" />
                            <span>Components</span>
                            <Badge variant="secondary" className="ml-0.5 px-1 py-0 text-[10px] font-mono">
                                {manifest.activities.length + manifest.services.length + manifest.receivers.length + manifest.providers.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="config" className="text-xs py-1.5 gap-1.5">
                            <SlidersHorizontalIcon className="size-3.5" aria-hidden="true" />
                            <span>Config & Features</span>
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="text-xs py-1.5 gap-1.5">
                            <FileCodeIcon className="size-3.5" aria-hidden="true" />
                            <span>Raw JSON</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Permissions */}
                    <TabsContent value="permissions" className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={permFilter === "all" ? "default" : "outline"}
                                    className="h-7 text-xs px-2.5"
                                    onClick={() => setPermFilter("all")}
                                >
                                    All ({manifest.permissions.length})
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={permFilter === "dangerous" ? "default" : "outline"}
                                    className={`h-7 text-xs px-2.5 ${
                                        dangerousCount > 0 && permFilter !== "dangerous"
                                            ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                                            : ""
                                    }`}
                                    onClick={() => setPermFilter("dangerous")}
                                >
                                    <ShieldAlertIcon className="size-3 mr-1" aria-hidden="true" />
                                    Sensitive / Dangerous ({dangerousCount})
                                </Button>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    type="search"
                                    placeholder="Filter permissions..."
                                    value={permSearch}
                                    onChange={(e) => setPermSearch(e.target.value)}
                                    className="h-8 text-xs pl-8"
                                />
                            </div>
                        </div>

                        {filteredPermissions.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                                {manifest.permissions.length === 0
                                    ? "No permissions requested in this manifest."
                                    : "No permissions match the current filter or search criteria."}
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                                {filteredPermissions.map((perm) => {
                                    const shortName = perm.name.replace(/^android\.permission\./, "");
                                    return (
                                        <div
                                            key={perm.name}
                                            className={`flex items-center justify-between p-2 rounded-md text-xs border ${
                                                perm.isDangerous
                                                    ? "bg-destructive/5 border-destructive/20 text-foreground"
                                                    : "bg-muted/30 border-border/40 text-foreground"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0 mr-2">
                                                {perm.isDangerous ? (
                                                    <ShieldAlertIcon className="size-3.5 text-destructive shrink-0" aria-hidden="true" />
                                                ) : (
                                                    <ShieldCheckIcon className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                                                )}
                                                <div className="truncate">
                                                    <span className="font-semibold font-mono">{shortName}</span>
                                                    {shortName !== perm.name && (
                                                        <span className="text-[11px] text-muted-foreground ml-1.5 font-mono truncate hidden md:inline">
                                                            ({perm.name})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {perm.isDangerous && (
                                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                        Dangerous
                                                    </Badge>
                                                )}
                                                {perm.maxSdkVersion && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                                        Max SDK {perm.maxSdkVersion}
                                                    </Badge>
                                                )}
                                                <CopyButton value={perm.name} label="Copy permission name" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {manifest.declaredPermissions.length > 0 && (
                            <div className="pt-2 border-t border-border/40 space-y-1.5">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Declared Custom Permissions ({manifest.declaredPermissions.length})
                                </span>
                                <div className="space-y-1">
                                    {manifest.declaredPermissions.map((p) => (
                                        <div
                                            key={p.name}
                                            className="flex items-center justify-between p-1.5 px-2 rounded-md bg-muted/20 border border-border/40 text-xs font-mono"
                                        >
                                            <span className="truncate">{p.name}</span>
                                            <div className="flex items-center gap-2">
                                                {p.protectionLevel && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {p.protectionLevel}
                                                    </Badge>
                                                )}
                                                <CopyButton value={p.name} label="Copy declared permission" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: Components */}
                    <TabsContent value="components" className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={compType === "activities" ? "default" : "outline"}
                                    className="h-7 text-xs px-2.5"
                                    onClick={() => setCompType("activities")}
                                >
                                    Activities ({manifest.activities.length})
                                    {countExported(manifest.activities) > 0 && (
                                        <span className="ml-1 text-[10px] opacity-80">
                                            [{countExported(manifest.activities)} exp]
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={compType === "services" ? "default" : "outline"}
                                    className="h-7 text-xs px-2.5"
                                    onClick={() => setCompType("services")}
                                >
                                    <ServerIcon className="size-3 mr-1" aria-hidden="true" />
                                    Services ({manifest.services.length})
                                    {countExported(manifest.services) > 0 && (
                                        <span className="ml-1 text-[10px] opacity-80">
                                            [{countExported(manifest.services)} exp]
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={compType === "receivers" ? "default" : "outline"}
                                    className="h-7 text-xs px-2.5"
                                    onClick={() => setCompType("receivers")}
                                >
                                    <RadioIcon className="size-3 mr-1" aria-hidden="true" />
                                    Receivers ({manifest.receivers.length})
                                    {countExported(manifest.receivers) > 0 && (
                                        <span className="ml-1 text-[10px] opacity-80">
                                            [{countExported(manifest.receivers)} exp]
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={compType === "providers" ? "default" : "outline"}
                                    className="h-7 text-xs px-2.5"
                                    onClick={() => setCompType("providers")}
                                >
                                    Providers ({manifest.providers.length})
                                </Button>
                            </div>

                            <div className="relative w-full sm:w-60">
                                <SearchIcon className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" aria-hidden="true" />
                                <Input
                                    type="search"
                                    placeholder="Filter components..."
                                    value={compSearch}
                                    onChange={(e) => setCompSearch(e.target.value)}
                                    className="h-8 text-xs pl-8"
                                />
                            </div>
                        </div>

                        {filteredComponents.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
                                No {compType} declared in this manifest or matching search.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {filteredComponents.map((comp) => (
                                    <div
                                        key={comp.name}
                                        className="p-2.5 rounded-md border border-border/50 bg-muted/20 space-y-1.5 text-xs"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <code className="font-mono text-xs font-semibold text-foreground truncate select-all">
                                                    {comp.name}
                                                </code>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {comp.exported === true ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 font-medium"
                                                    >
                                                        Exported
                                                    </Badge>
                                                ) : comp.exported === false ? (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                                                        Internal
                                                    </Badge>
                                                ) : null}
                                                <CopyButton value={comp.name} label="Copy component name" />
                                            </div>
                                        </div>

                                        {(comp.permission || comp.authorities || comp.actions.length > 0) && (
                                            <div className="flex items-center gap-2 flex-wrap pt-0.5 text-[11px] text-muted-foreground">
                                                {comp.permission && (
                                                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                                                        Permission: <span className="text-foreground">{comp.permission}</span>
                                                    </span>
                                                )}
                                                {comp.authorities && (
                                                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                                                        Authorities: <span className="text-foreground">{comp.authorities}</span>
                                                    </span>
                                                )}
                                                {comp.actions.length > 0 && (
                                                    <span className="font-mono text-[10px] text-muted-foreground truncate">
                                                        Actions: {comp.actions.slice(0, 3).join(", ")}
                                                        {comp.actions.length > 3 && ` (+${comp.actions.length - 3} more)`}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 3: Config & Features */}
                    <TabsContent value="config" className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                                <span className="font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Application Label
                                </span>
                                <div className="font-medium text-foreground">{manifest.appLabel || "—"}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                                <span className="font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Shared User ID
                                </span>
                                <div className="font-mono text-foreground">{manifest.sharedUserId || "None"}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                                <span className="font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Compile SDK Version
                                </span>
                                <div className="font-mono text-foreground">{manifest.compileSdkVersion || "—"}</div>
                            </div>
                            <div className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1">
                                <span className="font-medium text-muted-foreground uppercase tracking-wider text-[11px]">
                                    Component Factory
                                </span>
                                <div className="font-mono text-foreground break-all">{manifest.appComponentFactory || "Default"}</div>
                            </div>
                        </div>

                        {manifest.features.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <CpuIcon className="size-3.5 text-primary" aria-hidden="true" />
                                    Required Features & Hardware ({manifest.features.length})
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {manifest.features.map((feat) => (
                                        <div
                                            key={feat.name}
                                            className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-muted/10 text-xs"
                                        >
                                            <span className="font-mono truncate">{feat.name}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ml-2 ${
                                                    feat.required
                                                        ? "border-primary/40 text-primary"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {feat.required ? "Required" : "Optional"}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 4: Raw JSON */}
                    <TabsContent value="raw" className="space-y-2">
                        <div className="flex items-center justify-between pb-1">
                            <span className="text-xs text-muted-foreground">
                                Complete parsed AndroidManifest.xml dictionary as JSON
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1.5"
                                    onClick={handleDownloadJson}
                                >
                                    <DownloadIcon className="size-3" aria-hidden="true" />
                                    Download JSON
                                </Button>
                                <CopyButton
                                    value={JSON.stringify(manifest.rawJson, null, 2)}
                                    label="Copy complete JSON"
                                />
                            </div>
                        </div>
                        <pre className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs font-mono max-h-96 overflow-auto text-foreground">
                            {JSON.stringify(manifest.rawJson, null, 2)}
                        </pre>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
