import { useState } from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    AlertCircleIcon,
    AlertTriangleIcon,
    ArrowRightIcon,
    FileCodeIcon,
    HardDriveIcon,
    HashIcon,
    LayersIcon,
    Settings2Icon,
    ShieldAlertIcon,
    SparklesIcon,
} from "lucide-react";
import { useScannerConfigStore } from "@/stores/scanner-config-store.ts";
import { ScannerConfigDialog } from "@/components/scanners/scanner-config-dialog.tsx";

export type ScanProfileId =
    | "lightweight"
    | "deep"
    | "secrets"
    | "vulns"
    | "malware"
    | "custom"
    | "none";

export interface ScanProfile {
    id: ScanProfileId;
    name: string;
    description: string;
    badge: string;
    modules: string[];
}

export const SCAN_PROFILES: ScanProfile[] = [
    {
        id: "lightweight",
        name: "Lightweight Fast Scan (Recommended)",
        description: "Fast metadata extraction, compiler & packer fingerprinting, and tracker signatures.",
        badge: "Fast (~seconds)",
        modules: ["MANIFEST", "APKID", "EXODUS"],
    },
    {
        id: "deep",
        name: "In-Depth Full Analysis",
        description: "Deep decompilation, static vulnerability detection, data flow, and live secret scanning.",
        badge: "Comprehensive",
        modules: [
            "MANIFEST",
            "APKID",
            "EXODUS",
            "ANDROGUARD",
            "MOBSF",
            "APKSCAN",
            "TRUESEEING",
            "TRUFFLEHOG",
        ],
    },
    {
        id: "secrets",
        name: "Secrets & Credentials",
        description: "Targeted detection of leaked API keys, tokens, high-entropy secrets, and sensitive endpoints.",
        badge: "Secrets focus",
        modules: ["MANIFEST", "TRUFFLEHOG", "APKLEAKS"],
    },
    {
        id: "vulns",
        name: "Vulnerabilities & SAST",
        description: "Static application security testing, CWE flaw identification, and security rule analysis.",
        badge: "SAST focus",
        modules: ["MANIFEST", "MOBSF", "QUARKENGINE", "SUPER", "TRUESEEING"],
    },
    {
        id: "malware",
        name: "Malware & Threats",
        description: "Antivirus multi-engine signature scanning, anti-reversing detections, and behavioral scoring.",
        badge: "Threat intel",
        modules: ["MANIFEST", "APKID", "VIRUSTOTAL", "QUARKENGINE"],
    },
    {
        id: "custom",
        name: "Custom Selection",
        description: "Choose any arbitrary combination of scanner modules.",
        badge: "Custom",
        modules: [],
    },
    {
        id: "none",
        name: "None (Skip Automated Scans)",
        description: "Only import and index firmware applications without initiating automated scans.",
        badge: "No scans",
        modules: [],
    },
];

export interface AvailableScanner {
    name: string;
    label: string;
    description: string;
}

export const ALL_AVAILABLE_SCANNERS: AvailableScanner[] = [
    {name: "MANIFEST", label: "Manifest Parser", description: "Permissions, components, & intents"},
    {name: "APKID", label: "APKiD", description: "Packers, compilers, anti-debug"},
    {name: "EXODUS", label: "Exodus", description: "Privacy trackers & adware"},
    {name: "TRUFFLEHOG", label: "TruffleHog", description: "High-entropy secrets & API keys"},
    {name: "APKLEAKS", label: "APKLeaks", description: "URIs, tokens, & secret regexes"},
    {name: "MOBSF", label: "MobSFScan", description: "Static security rules & CWEs"},
    {name: "QUARKENGINE", label: "Quark-Engine", description: "Malware scoring & behavioral trees"},
    {name: "SUPER", label: "Super Analyzer", description: "Vulnerability & config checks"},
    {name: "TRUESEEING", label: "Trueseeing", description: "Fast vulnerability scanning"},
    {name: "ANDROGUARD", label: "AndroGuard", description: "Bytecode & DEX structure"},
    {name: "APKSCAN", label: "APKScan", description: "Static code decompiler"},
    {name: "VIRUSTOTAL", label: "VirusTotal", description: "Multi-engine AV detection (API key required)"},
    {name: "FLOWDROID", label: "FlowDroid", description: "Taint data flow analysis"},
    {name: "ANDROWARN", label: "Androwarn", description: "Structural flaw analysis"},
    {name: "QARK", label: "QARK", description: "Quick Android review kit"},
];

export function getResolvedScanModules(
    profileId: ScanProfileId,
    customModules: string[]
): string[] {
    if (profileId === "custom") {
        return customModules;
    }
    const profile = SCAN_PROFILES.find((p) => p.id === profileId);
    return profile ? profile.modules : [];
}

export interface ImportOptionsProps {
    keepFilesOnDisk: boolean;
    setKeepFilesOnDisk: (val: boolean) => void;
    createFuzzyHashes: boolean;
    setCreateFuzzyHashes: (val: boolean) => void;
    scanProfile: ScanProfileId;
    setScanProfile: (profile: ScanProfileId) => void;
    customScanModules: string[];
    setCustomScanModules: (modules: string[]) => void;
}

export function ImportOptionsCard({
    keepFilesOnDisk,
    setKeepFilesOnDisk,
    createFuzzyHashes,
    setCreateFuzzyHashes,
    scanProfile,
    setScanProfile,
    customScanModules,
    setCustomScanModules,
}: Readonly<ImportOptionsProps>) {
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [configTargetScanner, setConfigTargetScanner] = useState<"VIRUSTOTAL" | "TRUFFLEHOG">("VIRUSTOTAL");

    const { isScannerConfigured } = useScannerConfigStore();
    const resolvedModules = getResolvedScanModules(scanProfile, customScanModules);
    const activeProfile = SCAN_PROFILES.find((p) => p.id === scanProfile) ?? SCAN_PROFILES[0];

    const isVtInResolved = resolvedModules.includes("VIRUSTOTAL");
    const isVtConfigured = isScannerConfigured("VIRUSTOTAL");
    const isVtMissingConfig = isVtInResolved && !isVtConfigured;

    const toggleCustomModule = (modName: string) => {
        if (customScanModules.includes(modName)) {
            setCustomScanModules(customScanModules.filter((m) => m !== modName));
        } else {
            setCustomScanModules([...customScanModules, modName]);
        }
    };

    return (
        <>
            <Card className="border-border/60 bg-card/60 shadow-xs">
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                        Import & Analysis Options
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5 text-sm">
                    {/* Option 1: Keep Extracted Files on Disk */}
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="keep-files-checkbox"
                            checked={keepFilesOnDisk}
                            onCheckedChange={(checked) => setKeepFilesOnDisk(Boolean(checked))}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1">
                            <label
                                htmlFor="keep-files-checkbox"
                                className="font-medium text-foreground cursor-pointer flex items-center gap-2 select-none"
                            >
                                <HardDriveIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                Keep extracted files on disk
                                <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 text-emerald-500 border-emerald-500/30">
                                    Default
                                </Badge>
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Preserves unbundled partition files on disk in addition to database indexing, enabling direct file browsing and inspection.
                            </p>
                        </div>
                    </div>

                    {/* Option 2: Generate TLSH Fuzzy Hashes */}
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="tlsh-fuzzy-hashes-checkbox"
                            checked={createFuzzyHashes}
                            onCheckedChange={(checked) => setCreateFuzzyHashes(Boolean(checked))}
                            className="mt-0.5"
                        />
                        <div className="grid gap-1 flex-1">
                            <label
                                htmlFor="tlsh-fuzzy-hashes-checkbox"
                                className="font-medium text-foreground cursor-pointer flex items-center gap-2 select-none"
                            >
                                <HashIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                Generate TLSH fuzzy hashes
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Computes Trend Micro Locality Sensitive Hashes (TLSH) for every extracted file to enable similarity matching across firmwares.
                            </p>
                            {createFuzzyHashes && (
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                                    <AlertTriangleIcon className="size-3.5 shrink-0" aria-hidden="true" />
                                    <span>Import will take significantly longer when enabled due to extensive hash generation.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Option 3: Automated App Security Scans */}
                    <div className="space-y-2 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <ShieldAlertIcon className="size-4 text-primary" aria-hidden="true" />
                                <span className="font-medium text-foreground">Automated App Security Scans</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] py-0 h-4">
                                {activeProfile.badge}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Select which static and dynamic scanners should automatically analyze all extracted applications after import.
                        </p>

                        <div className="w-full">
                            <Select
                                value={scanProfile}
                                onValueChange={(val) => setScanProfile(val as ScanProfileId)}
                            >
                                <SelectTrigger className="w-full text-xs h-9">
                                    <SelectValue placeholder="Select scan profile" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCAN_PROFILES.map((profile) => (
                                        <SelectItem key={profile.id} value={profile.id} className="text-xs">
                                            <div className="flex items-center justify-between gap-3 w-full">
                                                <span className="font-medium">{profile.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {profile.modules.length > 0 ? `${profile.modules.length} scanners` : ""}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <p className="text-xs text-muted-foreground italic">
                            {activeProfile.description}
                        </p>

                        {/* VirusTotal missing config warning */}
                        {isVtMissingConfig && (
                            <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-500 dark:text-amber-400">
                                <div className="flex items-center gap-2">
                                    <AlertCircleIcon className="size-4 shrink-0" />
                                    <span>
                                        <strong>VirusTotal</strong> requires an API key before scanning can run.
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setConfigTargetScanner("VIRUSTOTAL");
                                        setConfigDialogOpen(true);
                                    }}
                                    className="h-7 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/20 shrink-0"
                                >
                                    <Settings2Icon className="size-3 mr-1" />
                                    Configure Key
                                </Button>
                            </div>
                        )}

                        {/* Scan execution pipeline preview */}
                        {resolvedModules.length > 0 && (
                            <div className="rounded-md bg-muted/40 p-2 border border-border/40 space-y-1.5">
                                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <SparklesIcon className="size-3 text-primary" aria-hidden="true" />
                                    Scan Execution Order ({resolvedModules.length} Scanners)
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {resolvedModules.map((moduleName, index) => {
                                        const isVt = moduleName === "VIRUSTOTAL";
                                        const needsConfig = isVt && !isVtConfigured;
                                        return (
                                            <div key={moduleName} className="flex items-center gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className={`font-mono text-[11px] bg-background ${
                                                        needsConfig ? "border-amber-500 text-amber-500" : ""
                                                    }`}
                                                >
                                                    <span className="text-primary font-bold mr-1">{index + 1}.</span>
                                                    {moduleName}
                                                    {needsConfig && (
                                                        <span className="ml-1 text-[10px] text-amber-500">(API key required)</span>
                                                    )}
                                                </Badge>
                                                {index < resolvedModules.length - 1 && (
                                                    <ArrowRightIcon className="size-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Custom Scanner Selector Chips */}
                        {scanProfile === "custom" && (
                            <div className="space-y-2 pt-2">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                                    <FileCodeIcon className="size-3.5 text-primary" aria-hidden="true" />
                                    Select Scanners to Run:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {ALL_AVAILABLE_SCANNERS.map((scanner) => {
                                        const isSelected = customScanModules.includes(scanner.name);
                                        const isVt = scanner.name === "VIRUSTOTAL";
                                        const needsConfig = isVt && !isVtConfigured;

                                        return (
                                            <label
                                                key={scanner.name}
                                                htmlFor={`scanner-custom-${scanner.name}`}
                                                className={`text-left p-2 rounded-md border text-xs transition-colors flex items-start gap-2 cursor-pointer select-none ${
                                                    isSelected
                                                        ? "border-primary bg-primary/10 text-foreground"
                                                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`scanner-custom-${scanner.name}`}
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleCustomModule(scanner.name)}
                                                    className="mt-0.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-semibold text-foreground flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5">
                                                            {scanner.name}
                                                            {needsConfig && (
                                                                <Badge variant="destructive" className="text-[9px] py-0 h-3.5 px-1">
                                                                    Config Needed
                                                                </Badge>
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-normal truncate ml-1">{scanner.label}</span>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground truncate">{scanner.description}</div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ScannerConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                initialScanner={configTargetScanner}
            />
        </>
    );
}
