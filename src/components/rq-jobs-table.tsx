import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {CircleAlertIcon, CircleCheckBigIcon, LoaderCircleIcon} from "lucide-react";
import { useQuery } from "@/lib/apollo-hooks";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {cn} from "@/lib/utils.ts";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";

function JobStatus({status, isFinished, isFailed}: Readonly<{
    status: string;
    isFinished?: boolean | null;
    isFailed?: boolean | null;
}>) {
    if (isFinished) {
        return (
            <><CircleCheckBigIcon className="text-green-600" aria-hidden="true"/><span className="sr-only">Finished</span></>
        );
    }

    if (isFailed) {
        return (
            <><CircleAlertIcon className="text-destructive" aria-hidden="true"/><span className="sr-only">Failed</span></>
        );
    }

    return (
        <>
            <LoaderCircleIcon className="mr-2 animate-spin" aria-hidden="true"/>
            <span>{status}</span>
        </>
    );
}

export function RqJobsTable(
    {
        className,
        funcNames,
    }: Readonly<{
        className?: string;
        funcNames: string[];
    }>
) {
    const {data: rqJobListData, loading, error} = useQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 10000,
    });

    const importJobs = rqJobListData?.rq_job_list
        ?.filter((job: any) => funcNames.some((funcName: string) => funcName === job?.funcName))
        .sort((a: any, b: any) => new Date(b?.startedAt).getTime() - new Date(a?.startedAt).getTime());

    if (loading && !rqJobListData) {
        return <div className="p-6 text-center text-muted-foreground" role="status">Loading recent jobs…</div>;
    }

    if (error) {
        return (
            <Alert variant="destructive" role="alert">
                <CircleAlertIcon/>
                <AlertTitle>Unable to load recent jobs</AlertTitle>
                <AlertDescription>Please try again shortly.</AlertDescription>
            </Alert>
        );
    }

    return (
        <Table className={cn(className)}>
            <TableHeader>
                <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead>RQ Queue</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {importJobs?.map((job: any) => {
                    if (job) {
                        return (
                            <TableRow key={job.id}>
                                <TableCell>
                                    <span>{job.id}</span>
                                </TableCell>
                                <TableCell>
                                    <span>{job.startedAt}</span>
                                </TableCell>
                                <TableCell>
                                    <span>{job.queueName}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center">
                                        {job.status ? (
                                            <JobStatus status={job.status} isFinished={job.isFinished}
                                                       isFailed={job.isFailed}/>
                                        ) : (
                                            <>
                                                <CircleAlertIcon className="text-destructive" aria-hidden="true"/>
                                                <span>Unknown status</span>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    }
                })}
                {(!importJobs || importJobs.length <= 0) && (
                    <TableRow>
                        <TableCell className="text-center" colSpan={4}>
                            No recent jobs found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
