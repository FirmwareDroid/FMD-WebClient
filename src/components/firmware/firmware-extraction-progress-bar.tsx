import { useEffect, useState } from "react";
import { useQuery } from "@/lib/apollo-hooks";
import { GET_RQ_JOB_LIST } from "@/components/graphql/rq-job.graphql.ts";
import { Progress } from "@/components/ui/progress.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    AlertCircleIcon,
    CheckCircle2Icon,
    ExternalLinkIcon,
    HardDriveDownloadIcon,
    Loader2Icon,
} from "lucide-react";
import { convertIdToObjectId } from "@/lib/graphql/graphql-utils.ts";
import { Link } from "react-router";
import { SCAN_JOBS_URL } from "@/components/ui/sidebar/app-sidebar.tsx";

export interface FirmwareExtractionProgressBarProps {
    firmwareId: string;
    onExtractionComplete?: () => void;
    className?: string;
}

interface JobMeta {
    stage?: string;
    message?: string;
    progress_percent?: number;
    processed_files?: number;
    total_files?: number;
    firmware_id?: string;
    firmware_id_list?: string[];
    error?: string;
}

export function FirmwareExtractionProgressBar({
    firmwareId,
    onExtractionComplete,
    className,
}: FirmwareExtractionProgressBarProps) {
    const resolvedId = convertIdToObjectId(firmwareId) || firmwareId;
    const [dismissedJobId, setDismissedJobId] = useState<string | null>(null);
    const [hasNotifiedComplete, setHasNotifiedComplete] = useState<string | null>(null);

    // Poll the extractor queue every 2.5s for real-time progress updates
    const { data } = useQuery(GET_RQ_JOB_LIST, {
        variables: { queueName: "extractor" },
        fetchPolicy: "cache-and-network",
        pollInterval: 2500,
    });

    // Find the latest extraction job associated with this firmware
    const extractionJobs = (data?.rq_job_list ?? [])
        .filter((job: any) => {
            if (!job) return false;
            if (job.funcName !== "start_file_export_by_regex") return false;

            let meta: JobMeta = {};
            if (job.meta) {
                try {
                    meta = typeof job.meta === "string" ? JSON.parse(job.meta) : job.meta;
                } catch {
                    meta = {};
                }
            }

            if (meta.firmware_id === resolvedId) return true;
            if (meta.firmware_id_list?.includes(resolvedId)) return true;
            return false;
        })
        .sort((a: any, b: any) => new Date(b?.startedAt || 0).getTime() - new Date(a?.startedAt || 0).getTime());

    const activeJob = extractionJobs[0];

    useEffect(() => {
        if (!activeJob) return;
        if (activeJob.isFinished && hasNotifiedComplete !== activeJob.id) {
            setHasNotifiedComplete(activeJob.id ?? null);
            if (onExtractionComplete) {
                onExtractionComplete();
            }
        }
    }, [activeJob, hasNotifiedComplete, onExtractionComplete]);

    if (!activeJob) return null;
    if (dismissedJobId === activeJob.id) return null;

    let meta: JobMeta = {};
    if (activeJob.meta) {
        try {
            meta = typeof activeJob.meta === "string" ? JSON.parse(activeJob.meta) : activeJob.meta;
        } catch {
            meta = {};
        }
    }

    const isRunning =
        activeJob.status?.toLowerCase() === "started" ||
        activeJob.status?.toLowerCase() === "running" ||
        activeJob.status?.toLowerCase() === "queued";
    const isFinished = Boolean(activeJob.isFinished);
    const isFailed = Boolean(activeJob.isFailed) || meta.stage === "failed";

    const percent = Math.min(100, Math.max(0, meta.progress_percent ?? (isFinished ? 100 : isRunning ? 15 : 0)));
    const stage = meta.stage || (isRunning ? "processing" : isFinished ? "completed" : "idle");
    const displayMessage = meta.message || (isRunning ? "Extracting firmware files to disk..." : isFinished ? "Extraction complete." : "Processing...");

    // Format human-readable stage badge
    const getStageBadge = () => {
        switch (stage) {
            case "unpacking_archive":
                return <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">Unpacking Partitions</Badge>;
            case "writing_files":
                return <Badge variant="outline" className="text-[11px] bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30">Writing Files to Disk</Badge>;
            case "completed":
                return <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Extracted</Badge>;
            case "failed":
                return <Badge variant="destructive" className="text-[11px]">Failed</Badge>;
            default:
                return <Badge variant="secondary" className="text-[11px]">In Progress</Badge>;
        }
    };

    return (
        <div
            className={`p-3.5 rounded-xl border transition-all duration-300 shadow-xs ${
                isFailed
                    ? "border-destructive/40 bg-destructive/5"
                    : isFinished
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-primary/30 bg-primary/5"
            } ${className || ""}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`p-2 rounded-lg shrink-0 ${
                            isFailed
                                ? "bg-destructive/10 text-destructive"
                                : isFinished
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-primary/10 text-primary"
                        }`}
                    >
                        {isFailed ? (
                            <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
                        ) : isFinished ? (
                            <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
                        ) : (
                            <Loader2Icon className="size-4 animate-spin shrink-0" aria-hidden="true" />
                        )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <HardDriveDownloadIcon className="size-3.5 text-primary" aria-hidden="true" />
                                {isFinished
                                    ? "Firmware Files Ready on Disk"
                                    : isFailed
                                    ? "Firmware File Extraction Failed"
                                    : "Extracting Firmware Files to Disk"}
                            </span>
                            {getStageBadge()}
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={displayMessage}>
                            {displayMessage}
                            {meta.processed_files !== undefined && meta.total_files !== undefined && meta.total_files > 0 && (
                                <span className="font-mono ml-1.5 text-[11px] text-foreground/80">
                                    ({meta.processed_files.toLocaleString()} / {meta.total_files.toLocaleString()} files)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
                    >
                        <Link to={SCAN_JOBS_URL}>
                            <ExternalLinkIcon className="size-3 shrink-0" aria-hidden="true" />
                            <span>Jobs</span>
                        </Link>
                    </Button>
                    {(isFinished || isFailed) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                            onClick={() => setDismissedJobId(activeJob.id ?? null)}
                            title="Dismiss status"
                        >
                            Dismiss
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Bar for Active Jobs */}
            {isRunning && (
                <div className="mt-3 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
                        <span>Progress</span>
                        <span>{percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5 bg-primary/10" />
                </div>
            )}
        </div>
    );
}
