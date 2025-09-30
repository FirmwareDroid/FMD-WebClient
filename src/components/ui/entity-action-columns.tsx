import type {ColumnDef, Table} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {LoaderCircle, LoaderCircleIcon, Trash, TrashIcon, ViewIcon} from "lucide-react";
import {useLazyQuery, useMutation} from "@apollo/client";
import {DELETE_FIRMWARE_BY_OBJECT_ID} from "@/components/graphql/firmware.graphql.ts";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import {useNavigate, useParams} from "react-router";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {Exact, GetRqJobListQuery, Scalars} from "@/__generated__/graphql.ts";
import {TypedDocumentNode} from "@graphql-typed-document-node/core";

type WithId = { id: string };
type WithTypenameMutation = { __typename?: "Mutation" };

const DELETION_JOB_FUNC_NAME = "api.v2.types.GenericDeletion.delete_queryset_background";

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

function DeleteSelectedButton<T extends WithId, U extends WithTypenameMutation>(
    {
        tooltip,
        table,
        deleteMutation,
    }: Readonly<{
        tooltip: string;
        table: Table<T>;
        deleteMutation: TypedDocumentNode<U, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        }>>;
    }>,
) {
    const selectedObjectIds = table.getSelectedRowModel().rows.map((row) => convertIdToObjectId(row.original.id));
    const [deleteEntities] = useMutation(deleteMutation, {
        variables: {objectIds: selectedObjectIds},
    });

    const [getRqJobList, {data: rqJobListData}] = useLazyQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
    });

    if (isDeletionOngoing(selectedObjectIds, rqJobListData)) {
        return (
            <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
        );
    }

    const disabled = selectedObjectIds.length === 0;

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button variant="destructive"
                        disabled={disabled}
                        onClick={() => {
                            void deleteEntities();
                            void getRqJobList();
                        }}
                >
                    <TrashIcon/>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    )
}

function DeleteRowButton<T extends WithTypenameMutation>(
    {
        tooltip,
        id,
        deleteMutation,
    }: Readonly<{
        tooltip: string;
        id: string;
        deleteMutation: TypedDocumentNode<T, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        }>>;
    }>,
) {
    const objectId = convertIdToObjectId(id);
    const [deleteEntity] = useMutation(
        deleteMutation, {
            variables: {
                objectIds: objectId,
            }
        }
    );

    const [getRqJobList, {data: rqJobListData}] = useLazyQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 5000,
    });

    if (isDeletionOngoing([objectId], rqJobListData)) {
        return (
            <div className="flex items-center justify-center">
                <LoaderCircle className="animate-spin"></LoaderCircle>
            </div>
        );
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button variant="destructive" onClick={() => {
                    void deleteEntity();
                    void getRqJobList();
                }}>
                    <Trash></Trash>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function buildSelectEntityColumn<T extends WithId>(): ColumnDef<T> {
    return (
        {
            id: "select",
            header: ({table}) => (
                <Checkbox
                    className="flex items-center"
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                    }}
                    aria-label="Select all"
                />
            ),
            cell: ({row}) => (
                <Checkbox
                    className="flex items-center"
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => {
                        row.toggleSelected(!!value);
                    }}
                    aria-label="Select row"
                />
            ),
        }
    );
}

function buildViewEntityColumn<T extends WithId>(
    tooltip: string,
    basePath: string,
): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const {firmwareId} = useParams<{ firmwareId?: string }>();
                const rowOriginalId = row.original.id;

                return (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (basePath === "/apps" && firmwareId) {
                                        void navigate(`/firmwares/${firmwareId}${basePath}/${rowOriginalId}`);
                                    } else {
                                        void navigate(`${basePath}/${rowOriginalId}`);
                                    }
                                }}
                            >
                                <ViewIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            },
        }
    );
}

function buildDeleteEntityColumn<T extends WithId, U extends WithTypenameMutation>(
    tooltipSingle: string,
    tooltipSelected: string,
    deleteMutation: TypedDocumentNode<U, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
    }>>
): ColumnDef<T> {
    return (
        {
            id: "delete",
            header: ({table}) => <DeleteSelectedButton<T, U> tooltip={tooltipSelected} table={table}
                                                             deleteMutation={deleteMutation}/>,
            cell: ({row}) => <DeleteRowButton tooltip={tooltipSingle} id={row.original.id}
                                              deleteMutation={deleteMutation}/>,
        }
    );
}

function buildFirmwareActionColumns<T extends WithId>(): ColumnDef<T>[] {
    return [
        buildSelectEntityColumn(),
        buildViewEntityColumn("View firmware", "/firmwares"),
        buildDeleteEntityColumn("Delete firmware", "Delete selected firmwares", DELETE_FIRMWARE_BY_OBJECT_ID),
    ];
}

function buildAppActionColumns<T extends WithId>(): ColumnDef<T>[] {
    return [
        buildSelectEntityColumn(),
        buildViewEntityColumn("View app", "/apps"),
    ];
}

export {
    buildSelectEntityColumn,
    buildViewEntityColumn,
    buildDeleteEntityColumn,
    buildFirmwareActionColumns,
    buildAppActionColumns,
}
