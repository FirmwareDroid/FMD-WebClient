import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { CircleAlertIcon, CircleCheckBigIcon, ClockIcon, LayersIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useQuery } from "@/lib/apollo-hooks";
import { GET_RQ_JOB_LIST } from "@/components/graphql/rq-job.graphql.ts";
import { cn } from "@/lib/utils.ts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { formatDateTime } from "@/lib/date-utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Progress } from "@/components/ui/progress.tsx";

function JobStatus({ status, isFinished, isFailed, meta }: Readonly<{
    status: string;
    isFinished?: boolean | null;
    isFailed?: boolean | null;
    meta?: any;
}>) {
    let parsedMeta: any = {};
    if (meta) {
        try {
            parsedMeta = typeof meta === "string" ? JSON.parse(meta) : meta;
        } catch {
            parsedMeta = {};
        }
    }

    if (isFinished) {
        return (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs gap-1 font-medium">
                <CircleCheckBigIcon className="size-3 shrink-0" aria-hidden="true" />
                <span>Finished</span>
            </Badge>
        );
    }

    if (isFailed || parsedMeta?.stage === "failed") {
        return (
            <Badge variant="destructive" className="text-xs gap-1 font-medium" title={parsedMeta?.error || undefined}>
                <CircleAlertIcon className="size-3 shrink-0" aria-hidden="true" />
                <span>Failed</span>
            </Badge>
        );
    }

    const isRunning = status.toLowerCase() === "started" || status.toLowerCase() === "running";
    const progressPercent = typeof parsedMeta?.progress_percent === "number" ? parsedMeta.progress_percent : null;
    const stageMessage = parsedMeta?.message || parsedMeta?.stage;

    return (
        <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={cn(
                "text-xs gap-1.5 font-medium",
                isRunning ? "border-primary/40 text-primary bg-primary/5" : "text-muted-foreground"
            )}>
                <Spinner size="sm" className="size-3" />
                <span className="capitalize">{status}</span>
                {progressPercent !== null && isRunning && (
                    <span className="font-mono text-[10px] ml-1">({progressPercent.toFixed(0)}%)</span>
                )}
            </Badge>
            {isRunning && progressPercent !== null && (
                <div className="w-24 mt-0.5">
                    <Progress value={progressPercent} className="h-1 bg-primary/10" />
                </div>
            )}
            {stageMessage && isRunning && (
                <span className="text-[10px] text-muted-foreground max-w-[200px] truncate" title={stageMessage}>
                    {stageMessage}
                </span>
            )}
        </div>
    );
}

export function RqJobsTable(
    {
        className,
        funcNames,
        queueName,
        pollInterval = 5000,
    }: Readonly<{
        className?: string;
        funcNames?: string[];
        queueName?: string;
        pollInterval?: number;
    }>
) {
    const { data: rqJobListData, loading, error } = useQuery(GET_RQ_JOB_LIST, {
        variables: queueName ? { queueName } : undefined,
        fetchPolicy: "cache-and-network",
        pollInterval,
    });

    const jobs = (rqJobListData?.rq_job_list ?? [])
        .filter((job: any) => {
            if (!job) return false;
            if (funcNames && funcNames.length > 0) {
                return funcNames.some((fn: string) => fn === job.funcName);
            }
            return true;
        })
        .sort((a: any, b: any) => new Date(b?.startedAt).getTime() - new Date(a?.startedAt).getTime());

    if (loading && !rqJobListData) {
        return (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2" role="status">
                <Spinner size="sm" />
                <span className="text-xs">Loading recent jobs…</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" role="alert">
                <CircleAlertIcon className="size-4" />
                <AlertTitle>Unable to load recent jobs</AlertTitle>
                <AlertDescription className="text-xs">Please check server connectivity or try again shortly.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="rounded-md border border-border/50 overflow-hidden bg-card">
            <Table className={cn("text-xs", className)}>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-semibold text-xs w-[280px]">Job Identifier</TableHead>
                        <TableHead className="font-semibold text-xs">Function</TableHead>
                        <TableHead className="font-semibold text-xs">
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="size-3.5 text-muted-foreground" />
                                <span>Started At</span>
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-xs">
                            <div className="flex items-center gap-1.5">
                                <LayersIcon className="size-3.5 text-muted-foreground" />
                                <span>Queue</span>
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-xs pr-6">Status & Progress</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {jobs?.map((job: any) => {
                        if (!job) return null;
                        return (
                            <TableRow key={job.id} className="hover:bg-muted/30 transition-colors border-b border-border/30">
                                <TableCell className="font-mono text-[11px] text-foreground/90 select-all">
                                    {job.id}
                                </TableCell>
                                <TableCell className="font-mono text-[11px] text-muted-foreground">
                                    {job.funcName || "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    <span title={job.startedAt ?? undefined}>{formatDateTime(job.startedAt)}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-[11px] font-mono font-normal">
                                        {job.queueName}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="inline-flex justify-end">
                                        {job.status ? (
                                            <JobStatus
                                                status={job.status}
                                                isFinished={job.isFinished}
                                                isFailed={job.isFailed}
                                                meta={job.meta}
                                            />
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                                Unknown
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {(!jobs || jobs.length <= 0) && (
                        <TableRow>
                            <TableCell className="text-center py-8 text-muted-foreground text-xs" colSpan={5}>
                                No recent jobs found for the selected module filter.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
