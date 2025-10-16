import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Exact, GetRqJobListQuery,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import {useState} from "react";
import {Scanner, ScannersTable} from "@/components/ui/scanners-table.tsx";
import {useLazyQuery, useMutation} from "@apollo/client";
import {useNavigate} from "react-router";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {LoaderCircleIcon, ScanSearchIcon, TrashIcon} from "lucide-react";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils.ts";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {WithTypenameMutation} from "@/components/ui/table/action-columns/entity-action-columns.tsx";
import {SCAN_JOBS_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {RqJobQueuesDropdownMenu} from "@/components/rq-jobs/rq-job-queues-dropdown-menu.tsx";

const DELETION_JOB_FUNC_NAME = "api.v2.types.GenericDeletion.delete_queryset_background";

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
            const start = job.description.indexOf("['");
            const end = job.description.indexOf("']");
            const deletedObjectIdsSubstring = job.description.substring(start, end + 2);
            // We parse the substring to a string array. But first, we need to replace both ' with ".
            const deletedObjectIds = JSON.parse(deletedObjectIdsSubstring.replace(/'/g, '"')) as string[];
            return objectIds.some((id) => deletedObjectIds.includes(id));
        });

    return (ongoingDeletionJobs?.length ?? 0) > 0;
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
    const [deleteEntities] = useMutation(deleteMutation, {
        variables: {objectIds: objectIds},
    });

    const [getRqJobList, {data: rqJobListData}] = useLazyQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
    });

    if (isDeletionOngoing(objectIds, rqJobListData)) {
        return (
            <div className="flex items-center justify-center">
                <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
            </div>
        );
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <ActionButton
                    variant="destructive"
                    disabled={objectIds.length <= 0}
                    onClick={() => {
                        void deleteEntities();
                        void getRqJobList();
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
    }: Readonly<{
        ids: string[];
        tooltip: string;
        mutation: TypedDocumentNode<ScanApksByObjectIdsMutation | ScanApksByFirmwareObjectIdsMutation, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
            scannerName: Scalars["String"]["input"]
            queueName: Scalars["String"]["input"]
        }>>;
    }>
) {
    const [selectedScanners, setSelectedScanners] = useState<Scanner[]>([]);
    const [selectedQueue, setSelectedQueue] = useState<string>("");
    const [scanApk] = useMutation(mutation);
    const navigate = useNavigate();

    return (
        <Dialog modal={true}>
            <DialogTrigger>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <ActionButton variant="outline" disabled={ids.length <= 0}>
                            <ScanSearchIcon className="size-5"/>
                        </ActionButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Select Scanner(s)</DialogTitle>
                </DialogHeader>
                <ScannersTable setSelectedScanners={setSelectedScanners}/>
                <DialogFooter>
                    <>
                        <RqJobQueuesDropdownMenu onSelect={setSelectedQueue}/>
                        <Button
                            disabled={selectedScanners.length <= 0}
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

    export
{
    ActionButton,
        ScanAppActionButton,
        DeleteEntityButton,
}
