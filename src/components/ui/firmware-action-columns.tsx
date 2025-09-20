import type {ColumnDef, Table} from "@tanstack/react-table";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {AlertCircleIcon, LoaderCircle, LoaderCircleIcon, Trash, TrashIcon, ViewIcon} from "lucide-react";
import {useMutation} from "@apollo/client";
import {DELETE_FIRMWARE_BY_OBJECT_ID} from "@/components/graphql/firmware.graphql.ts";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import {Alert} from "@/components/ui/alert.tsx";
import {useNavigate} from "react-router";

type WithId = { id: string };

function DeleteSelectedButton<T extends WithId>({table}: Readonly<{ table: Table<T> }>) {
    const selectedObjectIds = table.getSelectedRowModel().rows.map((row) => convertIdToObjectId(row.original.id));
    const [deleteFirmwares, {loading, error}] = useMutation(DELETE_FIRMWARE_BY_OBJECT_ID, {
        variables: {objectIds: selectedObjectIds},
    });

    if (loading) {
        return (
            <LoaderCircleIcon className="animate-spin"></LoaderCircleIcon>
        );
    }

    if (error) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Alert variant="destructive">
                        <AlertCircleIcon/>
                    </Alert>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Error: '{error.message}'</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    const disabled = selectedObjectIds.length === 0;

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button
                    disabled={disabled}
                    onClick={() => void deleteFirmwares()}
                    variant="destructive"
                >
                    <TrashIcon/>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Delete selected firmwares</p>
            </TooltipContent>
        </Tooltip>
    )
}

function DeleteRowButton({id}: Readonly<{ id: string }>) {
    const [deleteFirmware, {loading, error}] = useMutation(
        DELETE_FIRMWARE_BY_OBJECT_ID, {
            variables: {
                objectIds: convertIdToObjectId(id)
            }
        }
    );

    if (loading) {
        return (
            <LoaderCircle className="animate-spin"></LoaderCircle>
        );
    }

    if (error) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Alert variant="destructive">
                        <AlertCircleIcon/>
                    </Alert>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Error: '{error.message}'</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button onClick={() => void deleteFirmware()} variant="destructive">
                    <Trash></Trash>
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Delete firmware</p>
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

function buildViewEntityColumn<T extends WithId>(): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                const navigate = useNavigate();
                const firmwareId = row.original.id;

                return (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/firmwares/${firmwareId}`)}
                            >
                                <ViewIcon/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View firmware</p>
                        </TooltipContent>
                    </Tooltip>
                );
            },
        }
    );
}

function buildDeleteEntityColumn<T extends WithId>(): ColumnDef<T> {
    return (
        {
            id: "delete",
            header: ({table}) => <DeleteSelectedButton<T> table={table}/>,
            cell: ({row}) => <DeleteRowButton id={row.original.id}/>,
        }
    );
}

function buildFirmwareActionColumns<T extends WithId>(): ColumnDef<T>[] {
    return [
        buildSelectEntityColumn(),
        buildViewEntityColumn(),
        buildDeleteEntityColumn(),
    ];
}

export {
    buildSelectEntityColumn,
    buildViewEntityColumn,
    buildDeleteEntityColumn,
    buildFirmwareActionColumns,
}
