import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    DownloadIcon,
    FileArchiveIcon,
    FileCodeIcon,
    Loader2Icon,
    ShieldCheckIcon,
    AlertCircleIcon,
} from "lucide-react";
import { useToastStore } from "@/stores/toast.ts";
import { convertIdToObjectId } from "@/lib/graphql/graphql-utils.ts";

export interface ExportFirmwareDataDialogProps {
    firmwareId: string;
    firmwareName?: string | null;
    trigger?: React.ReactNode;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    buttonText?: string;
}

interface CollectionOption {
    id: string;
    label: string;
    description: string;
    defaultChecked: boolean;
    warning?: string;
}

const EXPORT_COLLECTIONS: CollectionOption[] = [
    {
        id: "android_firmware",
        label: "Firmware Metadata",
        description: "Core properties, hashes (SHA-256, MD5), and extraction timestamps",
        defaultChecked: true,
    },
    {
        id: "android_app",
        label: "Extracted Android Apps",
        description: "Package names, versions, extracted permissions, and security metadata",
        defaultChecked: true,
    },
    {
        id: "apk_scanner_report",
        label: "Security Scanner Reports",
        description: "Findings and telemetry from AndroGuard, Quark, TruffleHog, etc.",
        defaultChecked: true,
    },
    {
        id: "app_certificate",
        label: "App Signing Certificates",
        description: "X.509 certificate fingerprints, algorithms, and validity periods",
        defaultChecked: true,
    },
    {
        id: "build_prop_file",
        label: "System Build Properties",
        description: "Parsed system build properties (build.prop, default.prop)",
        defaultChecked: true,
    },
    {
        id: "firmware_file",
        label: "Filesystem File Index",
        description: "Comprehensive catalogue of all files indexed from this firmware",
        defaultChecked: false,
        warning: "May contain 100,000+ files and increase download time",
    },
];

export function ExportFirmwareDataDialog({
    firmwareId,
    firmwareName,
    trigger,
    variant = "outline",
    size = "sm",
    buttonText = "Export Scan Data",
}: ExportFirmwareDataDialogProps) {
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState<"zip" | "merged_jsonl">("zip");
    const [selectedCollections, setSelectedCollections] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        for (const item of EXPORT_COLLECTIONS) {
            initial[item.id] = item.defaultChecked;
        }
        return initial;
    });
    const [isExporting, setIsExporting] = useState(false);
    const toast = useToastStore();

    const handleCollectionToggle = (id: string, checked: boolean) => {
        setSelectedCollections((prev) => ({
            ...prev,
            [id]: checked,
        }));
    };

    const hasAnyCollectionSelected = Object.values(selectedCollections).some(Boolean);

    const handleExport = async () => {
        if (!firmwareId || isExporting || !hasAnyCollectionSelected) return;

        const resolvedId = convertIdToObjectId(firmwareId) || firmwareId;
        const activeCollections = Object.entries(selectedCollections)
            .filter(([, checked]) => checked)
            .map(([id]) => id)
            .join(",");

        setIsExporting(true);

        try {
            const queryParams = new URLSearchParams({
                format,
                collections: activeCollections,
            });

            const response = await fetch(
                `/download/firmware/${encodeURIComponent(resolvedId)}/export/?${queryParams.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                let errorMsg = `Export failed (HTTP ${response.status.toString()})`;
                try {
                    const errData = await response.json();
                    if (errData?.error) {
                        errorMsg = errData.error;
                    }
                } catch {
                    // Ignore non-JSON response body
                }
                toast.error(errorMsg);
                return;
            }

            const blob = await response.blob();
            const extension = format === "zip" ? "zip" : "jsonl";
            let filename = `${firmwareName || `firmware_${resolvedId}`}_scan_data.${extension}`;

            const disposition = response.headers.get("content-disposition");
            if (disposition && disposition.includes("filename=")) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "").trim();
                }
            }

            // Secure programmatic download and cleanup
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`Export downloaded: ${filename}`);
            setOpen(false);
        } catch (err) {
            console.error("Export download failed:", err);
            toast.error("Network error while generating export download.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={variant}
                        size={size}
                        title="Export all firmware scan data and security findings"
                    >
                        <DownloadIcon className="size-4 mr-1.5" aria-hidden="true" />
                        {buttonText}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <FileArchiveIcon className="size-5 text-primary" aria-hidden="true" />
                        Export Firmware Scan Data
                    </DialogTitle>
                    <DialogDescription>
                        Export structured analysis data, extracted APK metadata, and security scanner
                        reports for data science and offline research.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Export Format</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormat("zip")}
                                className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                                    format === "zip"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <FileArchiveIcon className="size-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium flex items-center gap-1.5">
                                        ZIP Archive
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                            Recommended
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Separate JSONL files per collection + cryptographic SHA-256 manifest.json.
                                        Optimal for Pandas, DuckDB, and Polars.
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormat("merged_jsonl")}
                                className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                                    format === "merged_jsonl"
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <FileCodeIcon className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium">Single Merged JSONL</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        All collections combined into one streaming JSONL file with a
                                        <code className="text-[11px] px-1 bg-muted rounded ml-1">_collection</code> attribute.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Collection Selection */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Select Datasets to Include</Label>
                            <div className="flex gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const all: Record<string, boolean> = {};
                                        for (const item of EXPORT_COLLECTIONS) all[item.id] = true;
                                        setSelectedCollections(all);
                                    }}
                                    className="text-primary hover:underline"
                                >
                                    Select All
                                </button>
                                <span>•</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const reset: Record<string, boolean> = {};
                                        for (const item of EXPORT_COLLECTIONS) reset[item.id] = item.defaultChecked;
                                        setSelectedCollections(reset);
                                    }}
                                    className="text-muted-foreground hover:underline"
                                >
                                    Reset Default
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border p-3 bg-card">
                            {EXPORT_COLLECTIONS.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50 transition-colors"
                                >
                                    <Checkbox
                                        id={`export-${item.id}`}
                                        checked={!!selectedCollections[item.id]}
                                        onCheckedChange={(checked) =>
                                            handleCollectionToggle(item.id, checked === true)
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-0.5 text-xs leading-none">
                                        <label
                                            htmlFor={`export-${item.id}`}
                                            className="font-medium cursor-pointer"
                                        >
                                            {item.label}
                                        </label>
                                        <p className="text-muted-foreground">{item.description}</p>
                                        {item.warning && (
                                            <p className="text-[11px] text-amber-500 flex items-center gap-1 mt-0.5">
                                                <AlertCircleIcon className="size-3" />
                                                {item.warning}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
                        <ShieldCheckIcon className="size-4 text-emerald-500 shrink-0" />
                        <span>
                            Exports are securely streamed with server host paths sanitized and
                            include SHA-256 hash manifests for data verification.
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleExport()}
                        disabled={isExporting || !hasAnyCollectionSelected}
                        className="gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" />
                                Generating Export...
                            </>
                        ) : (
                            <>
                                <DownloadIcon className="size-4" />
                                Download Export
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
