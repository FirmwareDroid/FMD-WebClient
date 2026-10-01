import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Exact, GetRqJobListQuery,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import {useState} from "react";
import {Scanner, ScannersTable} from "@/components/scanners-table.tsx";
import { useLazyQuery, useMutation } from "@/lib/apollo-hooks";
import {useNavigate} from "react-router";
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
import {AlertTriangleIcon, RotateCwIcon, ScanSearchIcon, TrashIcon} from "lucide-react";
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
    const [selectedScanners, setSelectedScanners] = useState<Scanner[]>([]);
    const [selectedQueue, setSelectedQueue] = useState<string>("");
    const [scanApk] = useMutation(mutation);
    const navigate = useNavigate();

    return (
        <Dialog modal={true}>
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
                    <DialogTitle>Select Scanner(s)</DialogTitle>
                </DialogHeader>
                <ScannersTable setSelectedScanners={setSelectedScanners}/>
                <DialogFooter>
                    <>
                        <RqJobQueuesDropdownMenu
                            filterQueue={"scanner"}
                            onSelect={setSelectedQueue}
                        />
                        <Button
                            disabled={selectedScanners.length <= 0 || !selectedQueue}
                            onClick={() => {
                                selectedScanners.forEach((scanner) => void scanApk({
                                    variables: {
                                        objectIds: ids.map(id => convertIdToObjectId(id)),
                                        scannerName: scanner.id,
                                        queueName: selectedQueue,
                                    }
                                }));
                                void navigate(SCAN_JOBS_URL);
                            }}>Start Scan</Button>
                    </>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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

export {
    ActionButton,
    ScanAppActionButton,
    DeleteEntityButton,
    ReimportFirmwareButton,
}
