import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {CircleAlertIcon, CircleCheckBigIcon, LoaderCircleIcon} from "lucide-react";
import {useQuery} from "@apollo/client";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {cn} from "@/lib/utils.ts";

function JobStatus({status, isFinished, isFailed}: Readonly<{
    status: string;
    isFinished?: boolean | null;
    isFailed?: boolean | null;
}>) {
    if (isFinished) {
        return (
            <CircleCheckBigIcon color="green"/>
        );
    }

    if (isFailed) {
        return (
            <CircleAlertIcon color="red"/>
        );
    }

    return (
        <>
            <LoaderCircleIcon className="animate-spin mr-2"/>
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
    const {data: rqJobListData} = useQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 10000,
    });

    const importJobs = rqJobListData?.rq_job_list
        ?.filter(job => funcNames.some(funcName => funcName === job?.funcName))
        .sort((a, b) => new Date(b?.startedAt).getTime() - new Date(a?.startedAt).getTime());

    return (
        <Table className={cn(className)}>
            <TableHeader>
                <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {importJobs?.map((job) => {
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
                                    <div className="flex items-center justify-center">
                                        {job.status ? (
                                            <JobStatus status={job.status} isFinished={job.isFinished}
                                                       isFailed={job.isFailed}/>
                                        ) : (
                                            <>
                                                <CircleAlertIcon color="red"/>
                                                <span>Unknown status</span>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    }
                })}
                {!importJobs || importJobs.length <= 0 && (
                    <TableRow>
                        <TableCell className="text-center" colSpan={3}>
                            No recent jobs found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}