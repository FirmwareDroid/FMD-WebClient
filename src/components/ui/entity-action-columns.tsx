import type {ColumnDef} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {EyeIcon, LoaderCircleIcon, ScanSearchIcon, TrashIcon} from "lucide-react";
import {useLazyQuery, useMutation} from "@apollo/client";
import {DELETE_FIRMWARE_BY_OBJECT_ID} from "@/components/graphql/firmware.graphql.ts";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import {useNavigate, useParams} from "react-router";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {
    Exact,
    GetRqJobListQuery,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils.ts";
import {Scanner, ScannersTable} from "@/components/ui/scanners-table.tsx";
import {useState} from "react";

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
                            <ActionButton
                                variant="outline"
                                onClick={() => {
                                    if (basePath === "/apps" && firmwareId) {
                                        void navigate(`/firmwares/${firmwareId}${basePath}/${rowOriginalId}`);
                                    } else {
                                        void navigate(`${basePath}/${rowOriginalId}`);
                                    }
                                }}
                            >
                                <EyeIcon className="size-5"/>
                            </ActionButton>
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
            header: ({table}) =>
                <DeleteEntityButton<U>
                    ids={table.getSelectedRowModel().flatRows.map(row => row.original.id)}
                    tooltip={tooltipSelected}
                    deleteMutation={deleteMutation}
                />,
            cell: ({row}) =>
                <DeleteEntityButton
                    ids={[row.original.id]}
                    tooltip={tooltipSingle}
                    deleteMutation={deleteMutation}
                />
        }
    );
}

function ScanAppButton(
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
        }>>;
    }>
) {
    const [selectedScanners, setSelectedScanners] = useState<Scanner[]>([]);
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
                    <Button
                        disabled={selectedScanners.length <= 0}
                        onClick={() => {
                            selectedScanners.forEach((scanner) => void scanApk({
                                variables: {
                                    objectIds: ids.map(id => convertIdToObjectId(id)),
                                    scannerName: scanner.id,
                                }
                            }));
                            void navigate("/scanner");
                        }}>Start Scan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function buildScanAppColumn<T extends WithId>(
    tooltipSingle: string,
    tooltipSelected: string,
    mutation: TypedDocumentNode<ScanApksByObjectIdsMutation | ScanApksByFirmwareObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T> {
    return (
        {
            id: "scan",
            header: ({table}) =>
                <ScanAppButton
                    ids={table.getSelectedRowModel().flatRows.map(row => row.original.id)}
                    tooltip={tooltipSelected}
                    mutation={mutation}
                />,
            cell: ({row}) =>
                <ScanAppButton
                    ids={[row.original.id]}
                    tooltip={tooltipSingle}
                    mutation={mutation}
                />,
        }
    );
}

function buildFirmwareActionColumns<T extends WithId>(
    mutation: TypedDocumentNode<ScanApksByFirmwareObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T>[] {
    return [
        buildSelectEntityColumn(),
        buildViewEntityColumn("View firmware", "/firmwares"),
        buildScanAppColumn("Scan all apps of this firmware", "Scan all apps of selected firmwares", mutation),
        buildDeleteEntityColumn("Delete firmware", "Delete selected firmwares", DELETE_FIRMWARE_BY_OBJECT_ID),
    ];
}

function buildAppActionColumns<T extends WithId>(
    mutation: TypedDocumentNode<ScanApksByObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T> [] {
    return [
        buildSelectEntityColumn(),
        buildViewEntityColumn("View app", "/apps"),
        buildScanAppColumn("Scan app", "Scan selected apps", mutation),
    ];
}

export {
    buildSelectEntityColumn,
    buildViewEntityColumn,
    buildDeleteEntityColumn,
    buildFirmwareActionColumns,
    buildAppActionColumns,
}
