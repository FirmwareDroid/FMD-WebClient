import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Exact, GetRqJobListQuery,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import {useState} from "react";
import {Scanner, ScannersTable} from "@/components/scanners-table.tsx";
import {CREATE_VIRUSTOTAL_SCAN_JOB} from "@/components/graphql/app.graphql.ts";
import {useScannerConfigStore} from "@/stores/scanner-config-store.ts";
import {ScannerConfigDialog} from "@/components/scanners/scanner-config-dialog.tsx";
import {AlertCircleIcon, Settings2Icon} from "lucide-react";

import { useLazyQuery, useMutation } from "@/lib/apollo-hooks";
import {useLocation, useNavigate} from "react-router";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {AlertTriangleIcon, DownloadIcon, RotateCwIcon, ScanSearchIcon, TrashIcon} from "lucide-react";
import {Spinner} from "@/components/ui/spinner.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils.ts";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {WithTypenameMutation} from "@/components/data-table-action-columns/entity-action-columns.tsx";
import {SCAN_JOBS_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {RqJobQueuesDropdownMenu} from "@/components/rq-jobs/rq-job-queues-dropdown-menu.tsx";
import {useToastStore} from "@/stores/toast.ts";

import {CREATE_FIRMWARE_REIMPORT_JOB} from "@/components/graphql/firmware.graphql.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

const DELETION_JOB_FUNC_NAME = "api.v2.types.GenericDeletion.delete_queryset_background";
const REIMPORT_JOB_FUNC_NAME = "firmware_handler.firmware_reimporter.start_firmware_re_import";


function ActionButton(
    {
        className,
        variant,
        asChild = false,
        ...props
    }: React.ComponentProps<"button"> &
        VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    return (
        <Button
            className={cn(className, "p-0 has-[>svg]:p-0 w-9")}
            variant={variant}
            asChild={asChild}
            {...props}
        ></Button>
    );
}

function isDeletionOngoing(objectIds: string[], rqJobListData: GetRqJobListQuery | undefined) {
    const ongoingDeletionJobs = rqJobListData?.rq_job_list
        ?.filter(job =>
            job?.funcName === DELETION_JOB_FUNC_NAME &&
            !job.isFinished &&
            !job.isFailed
        ).filter(job => {
            if (!job?.description) return false;

            /*
            The job description contains the affected elements in the following format:
            "api.v2.types.GenericDeletion.delete_queryset_background(['68d2c1f78773bc31564c1dab', '68d2c2008773bc31564c1dac'], <class 'model.AndroidFirmware.AndroidFirmware'>)",
             */
            const match = job.description.match(/\[(?:'[a-f\d]{24}'(?:,\s*)?)*\]/i);
            if (!match) return false;
            const deletedObjectIds: string[] = match[0].match(/[a-f\d]{24}/gi) ?? [];
            return objectIds.some((id) => deletedObjectIds.includes(id));
        });

    return (ongoingDeletionJobs?.length ?? 0) > 0;
}

function isReimportOngoing(objectIds: string[], rqJobListData: GetRqJobListQuery | undefined) {
    const ongoingJobs = rqJobListData?.rq_job_list
        ?.filter(job =>
            (job?.funcName === REIMPORT_JOB_FUNC_NAME || job?.funcName === DELETION_JOB_FUNC_NAME) &&
            !job.isFinished &&
            !job.isFailed
        ).filter(job => {
            if (!job?.description) return false;
            return objectIds.some((id) => job.description?.includes(id));
        });

    return (ongoingJobs?.length ?? 0) > 0;
}

function DeleteEntityButton<T extends WithTypenameMutation>(
    {
        ids,
        tooltip,
        deleteMutation,
    }: Readonly<{
        ids: string[];
        tooltip: string;
        deleteMutation: TypedDocumentNode<T, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        }>>;
    }>,
) {
    const objectIds = ids.map(id => convertIdToObjectId(id));
    const toast = useToastStore();
    const [deleteEntities] = useMutation(deleteMutation, {
        variables: {objectIds: objectIds},
    });

    const [getRqJobList, {data: rqJobListData}] = useLazyQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
    });

    if (isDeletionOngoing(objectIds, rqJobListData)) {
        return (
            <div className="flex items-center justify-center size-9">
                <Spinner size="default" />
            </div>
        );
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <ActionButton
                    variant="destructive"
                    disabled={objectIds.length <= 0}
                    aria-label={tooltip}
                    onClick={() => {
                        if (!window.confirm(`Delete ${objectIds.length.toString()} selected item(s)? This action cannot be undone.`)) return;
                        void deleteEntities()
                            .then(() => {
                                toast.success("Deletion job started.");
                                return getRqJobList();
                            })
                            .catch(() => toast.error("Unable to start deletion. Please try again."));
                    }}
                >
                    <TrashIcon/>
                </ActionButton>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    )
}

function ScanAppActionButton(
    {
        ids,
        tooltip,
        mutation,
        text,
        size = "sm",
        className,
        variant = "outline",
    }: Readonly<{
        ids: string[];
        tooltip: string;
        mutation: TypedDocumentNode<ScanApksByObjectIdsMutation | ScanApksByFirmwareObjectIdsMutation, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
            scannerName: Scalars["String"]["input"]
            queueName: Scalars["String"]["input"]
        }>>;
        text?: string;
        size?: "default" | "sm" | "lg" | "icon";
        className?: string;
        variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    }>
) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedScanners, setSelectedScanners] = useState<Scanner[]>([]);
    const [selectedQueue, setSelectedQueue] = useState<string>("");
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [configTargetScanner, setConfigTargetScanner] = useState<"VIRUSTOTAL" | "TRUFFLEHOG">("VIRUSTOTAL");
    const [scanApk] = useMutation(mutation);
    const [scanVirusTotal] = useMutation(CREATE_VIRUSTOTAL_SCAN_JOB);
    const [navigateToJobs, setNavigateToJobs] = useState(true);
    const {configs, getUnconfiguredScanners} = useScannerConfigStore();
    const toast = useToastStore();
    const navigate = useNavigate();
    const location = useLocation();

    const selectedScannerIds = selectedScanners.map((s) => s.id);
    const unconfiguredSelected = getUnconfiguredScanners(selectedScannerIds);
    const hasUnconfiguredSelected = unconfiguredSelected.length > 0;

    const handleStartScan = async () => {
        if (selectedScanners.length <= 0 || !selectedQueue || isScanning) return;

        if (hasUnconfiguredSelected) {
            toast.error(
                `Configuration required for ${unconfiguredSelected.map((s) => s.label).join(", ")} before starting scan.`
            );
            return;
        }

        const objectIds = ids.map((id) => convertIdToObjectId(id));
        setIsScanning(true);

        const successes: string[] = [];
        const failures: { id: string; error: string }[] = [];

        try {
            for (const scanner of selectedScanners) {
                try {
                    if (scanner.id === "VIRUSTOTAL") {
                        const apiKey = configs.VIRUSTOTAL.apiKey || "";
                        await scanVirusTotal({
                            variables: {
                                objectIds,
                                queueName: selectedQueue,
                                vtApiKey: apiKey,
                            },
                        });
                    } else {
                        await scanApk({
                            variables: {
                                objectIds,
                                scannerName: scanner.id,
                                queueName: selectedQueue,
                            },
                        });
                    }
                    successes.push(scanner.id);
                } catch (e: any) {
                    const errorMsg = e.graphQLErrors?.[0]?.message || e.networkError?.message || e.message || "Execution error";
                    console.error(`Failed to enqueue scan for ${scanner.id}:`, e);
                    failures.push({ id: scanner.id, error: errorMsg });
                }
            }

            if (failures.length === 0) {
                setDialogOpen(false);
                toast.success(`Queued ${successes.length} scan job(s) for execution.`);
                if (navigateToJobs) {
                    void navigate(SCAN_JOBS_URL, {
                        state: {
                            returnUrl: location.pathname,
                            returnTitle: location.pathname.includes("/apps/") ? "App Details" : "Previous Page",
                            scannedCount: successes.length,
                        },
                    });
                }
            } else if (successes.length > 0) {
                // Partial success
                setDialogOpen(false);
                toast.warning(
                    `Queued ${successes.length} scan job(s). Failed to queue: ${failures.map((f) => f.id).join(", ")}`
                );
                if (navigateToJobs) {
                    void navigate(SCAN_JOBS_URL, {
                        state: {
                            returnUrl: location.pathname,
                            returnTitle: location.pathname.includes("/apps/") ? "App Details" : "Previous Page",
                            scannedCount: successes.length,
                        },
                    });
                }
            } else {
                // All failed
                const firstErr = failures[0]?.error;
                toast.error(
                    `Failed to enqueue scans: ${firstErr || "Unknown error occurred"}`
                );
            }
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={true}>
                {text ? (
                    <DialogTrigger asChild>
                        <Button
                            variant={variant}
                            size={size}
                            disabled={ids.length <= 0}
                            className={className}
                        >
                            <ScanSearchIcon className="size-4 mr-1.5" />
                            {text}
                        </Button>
                    </DialogTrigger>
                ) : (
                    <DialogTrigger>
                        <Tooltip delayDuration={500}>
                            <TooltipTrigger asChild>
                                <ActionButton variant={variant} disabled={ids.length <= 0} className={className}>
                                    <ScanSearchIcon className="size-5"/>
                                </ActionButton>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </DialogTrigger>
                )}
                <DialogContent className="sm:max-w-5xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <div>
                                <DialogTitle>Select Scanner(s)</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Choose static and external analysis modules to run against the target application(s).
                                </DialogDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setConfigTargetScanner("VIRUSTOTAL");
                                    setConfigDialogOpen(true);
                                }}
                                className="h-8 text-xs gap-1.5 shrink-0"
                            >
                                <Settings2Icon className="size-3.5 text-muted-foreground" />
                                <span>Configure Scanners</span>
                            </Button>
                        </div>
                    </DialogHeader>

                    <ScannersTable
                        setSelectedScanners={setSelectedScanners}
                        onConfigureClick={(scannerId) => {
                            setConfigTargetScanner(scannerId);
                            setConfigDialogOpen(true);
                        }}
                    />

                    {hasUnconfiguredSelected && (
                        <div className="flex items-center justify-between rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-500 dark:text-amber-400">
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="size-4 shrink-0" />
                                <span>
                                    <strong>{unconfiguredSelected.map((s) => s.label).join(", ")}</strong> requires configuration before scanning can proceed.
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    const first = unconfiguredSelected[0]?.id === "TRUFFLEHOG" ? "TRUFFLEHOG" : "VIRUSTOTAL";
                                    setConfigTargetScanner(first);
                                    setConfigDialogOpen(true);
                                }}
                                className="h-7 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                            >
                                Configure Now
                            </Button>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="navigate-scan-jobs-toggle"
                                checked={navigateToJobs}
                                onCheckedChange={(checked) => setNavigateToJobs(Boolean(checked))}
                            />
                            <label
                                htmlFor="navigate-scan-jobs-toggle"
                                className="text-xs text-muted-foreground cursor-pointer select-none"
                            >
                                Go to Scan Jobs page to monitor progress
                            </label>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <RqJobQueuesDropdownMenu
                                filterQueue={"scanner"}
                                onSelect={setSelectedQueue}
                            />
                            <Button
                                disabled={selectedScanners.length <= 0 || !selectedQueue || hasUnconfiguredSelected || isScanning}
                                onClick={() => void handleStartScan()}
                            >
                                {isScanning ? "Starting Scans..." : "Start Scan"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ScannerConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                initialScanner={configTargetScanner}
            />
        </>
    );
}

function ReimportFirmwareButton(
    {
        ids,
        tooltip = "Warning: Reimport firmware (permanently deletes all apps and reports)",
        onSuccessRedirect,
        text,
        size = "sm",
        className,
        variant = "destructive",
    }: Readonly<{
        ids: string[];
        tooltip?: string;
        onSuccessRedirect?: string;
        text?: string;
        size?: "default" | "sm" | "lg" | "icon";
        className?: string;
        variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    }>,
) {
    const [open, setOpen] = useState(false);
    const [createFuzzyHashes, setCreateFuzzyHashes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToastStore();
    const navigate = useNavigate();

    const objectIds = ids.map(id => convertIdToObjectId(id));
    const [reimportFirmware] = useMutation(CREATE_FIRMWARE_REIMPORT_JOB);

    const [getRqJobList, {data: rqJobListData}] = useLazyQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
    });

    if (isReimportOngoing(objectIds, rqJobListData)) {
        if (text) {
            return (
                <Button size={size} variant={variant} disabled className={className}>
                    <Spinner size="default" />
                    <span>Reimporting…</span>
                </Button>
            );
        }
        return (
            <div className="flex items-center justify-center size-9">
                <Spinner size="default" />
            </div>
        );
    }

    const handleReimport = async () => {
        setIsSubmitting(true);
        try {
            await reimportFirmware({
                variables: {
                    firmwareIdList: objectIds,
                    queueName: "extractor",
                    createFuzzyHashes: createFuzzyHashes,
                },
            });
            toast.success("Firmware reimport job queued.");
            setOpen(false);
            if (onSuccessRedirect) {
                void navigate(onSuccessRedirect);
            } else {
                void getRqJobList();
            }
        } catch (e) {
            console.error("Failed to trigger firmware reimport:", e);
            toast.error("Failed to trigger firmware reimport. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerButton = text ? (
        <Button
            variant={variant}
            size={size}
            className={cn("gap-1.5", className)}
            disabled={objectIds.length <= 0}
            aria-label={tooltip}
        >
            <AlertTriangleIcon className="size-4 shrink-0" />
            <span>{text}</span>
        </Button>
    ) : (
        <ActionButton
            variant={variant}
            disabled={objectIds.length <= 0}
            aria-label={tooltip}
            className={className}
        >
            <RotateCwIcon className="size-4" />
        </ActionButton>
    );

    return (
        <Dialog modal={true} open={open} onOpenChange={setOpen}>
            <Tooltip delayDuration={500}>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        {triggerButton}
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangleIcon className="size-5" />
                        Reimport Firmware
                    </DialogTitle>
                    <DialogDescription>
                        Reimporting will re-process the raw firmware archive from the beginning.
                    </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive">
                    <AlertTriangleIcon />
                    <AlertTitle>Warning: Permanent Data Deletion</AlertTitle>
                    <AlertDescription className="space-y-2 mt-1">
                        <p>
                            This action will completely remove the current firmware record and all associated analysis data:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>All extracted Android apps (.apk files)</li>
                            <li>All static and dynamic analysis reports (AndroGuard, Quark, TruffleHog, etc.)</li>
                            <li>All indexed files, hashes, and partition data</li>
                        </ul>
                        <p className="font-semibold text-xs pt-1">
                            This action cannot be undone. Once reimported, a fresh extraction job will run.
                        </p>
                    </AlertDescription>
                </Alert>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="reimport-fuzzy-hashes"
                        checked={createFuzzyHashes}
                        onCheckedChange={(checked) => setCreateFuzzyHashes(Boolean(checked))}
                    />
                    <label htmlFor="reimport-fuzzy-hashes" className="text-sm font-normal cursor-pointer select-none">
                        Generate fuzzy hashes (SSDEEP) during re-extraction
                    </label>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => void handleReimport()}
                        disabled={isSubmitting || objectIds.length <= 0}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner size="default" />
                                <span className="ml-2">Starting…</span>
                            </>
                        ) : (
                            <>
                                <RotateCwIcon className="mr-2 size-4" />
                                <span>Confirm Reimport</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function DownloadApkButton(
    {
        appId,
        fallbackFilename,
        tooltip = "Download APK",
        text,
        size = "sm",
        className,
        variant = "outline",
    }: Readonly<{
        appId: string;
        fallbackFilename?: string;
        tooltip?: string;
        text?: string;
        size?: "default" | "sm" | "lg" | "icon";
        className?: string;
        variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    }>,
) {
    const [isDownloading, setIsDownloading] = useState(false);
    const toast = useToastStore();

    const handleDownload = async () => {
        if (!appId || isDownloading) return;
        setIsDownloading(true);
        try {
            const resolvedId = convertIdToObjectId(appId) || appId;
            const response = await fetch(`/download/android_app/${encodeURIComponent(resolvedId)}/`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                let errorMsg = `Download failed (HTTP ${response.status.toString()})`;
                try {
                    const errData = await response.json();
                    if (errData?.error) {
                        errorMsg = errData.error;
                    }
                } catch {
                    // Ignore JSON parsing failure
                }
                toast.error(errorMsg);
                return;
            }

            const blob = await response.blob();
            let filename = fallbackFilename || `app_${appId}.apk`;

            const disposition = response.headers.get("content-disposition");
            if (disposition && disposition.includes("filename=")) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "").trim();
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Downloaded ${filename}`);
        } catch (err) {
            console.error("Failed to download APK:", err);
            toast.error("Network error while downloading APK file.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (text) {
        return (
            <Button
                variant={variant}
                size={size}
                className={cn("gap-1.5", className)}
                disabled={isDownloading || !appId}
                onClick={() => void handleDownload()}
                title={tooltip}
            >
                {isDownloading ? (
                    <Spinner size="sm" />
                ) : (
                    <DownloadIcon className="size-4 shrink-0" />
                )}
                <span>{isDownloading ? "Downloading…" : text}</span>
            </Button>
        );
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <ActionButton
                    variant={variant}
                    disabled={isDownloading || !appId}
                    aria-label={tooltip}
                    className={className}
                    onClick={() => void handleDownload()}
                >
                    {isDownloading ? (
                        <Spinner size="sm" />
                    ) : (
                        <DownloadIcon className="size-4" />
                    )}
                </ActionButton>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export {
    ActionButton,
    ScanAppActionButton,
    DeleteEntityButton,
    ReimportFirmwareButton,
    DownloadApkButton,
}
