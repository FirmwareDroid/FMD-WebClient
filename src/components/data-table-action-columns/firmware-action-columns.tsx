import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {Exact, Scalars, ScanApksByFirmwareObjectIdsMutation} from "@/__generated__/graphql.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {DELETE_FIRMWARE_BY_OBJECT_ID} from "@/components/graphql/firmware.graphql.ts";
import {
    buildDeleteEntityColumn,
    buildSelectEntityColumn,
    WithId
} from "@/components/data-table-action-columns/entity-action-columns.tsx";
import {useNavigate} from "react-router";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {FIRMWARES_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {EyeIcon} from "lucide-react";
import {buildScanAppColumn} from "@/components/data-table-action-columns/app-action-columns.tsx";

function buildViewFirmwareColumn<T extends WithId>(): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                const firmwareId = row.original.id;

                return (
                    <Tooltip delayDuration={500}>
                        <TooltipTrigger asChild>
                            <ActionButton
                                variant="outline"
                                onClick={() => void navigate(`${FIRMWARES_URL}/${firmwareId}`)}
                            >
                                <EyeIcon className="size-5"/>
                            </ActionButton>
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

export function buildFirmwareActionColumns<T extends WithId>(
    scanAppMutation: TypedDocumentNode<ScanApksByFirmwareObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
        queueName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T>[] {
    return [
        buildSelectEntityColumn(),
        buildViewFirmwareColumn(),
        buildScanAppColumn("Scan all apps of this firmware", "Scan all apps of selected firmwares", scanAppMutation),
        buildDeleteEntityColumn("Delete firmware", "Delete selected firmwares", DELETE_FIRMWARE_BY_OBJECT_ID),
    ];
}
