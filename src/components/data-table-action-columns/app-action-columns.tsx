import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Exact,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import type {ColumnDef} from "@tanstack/react-table";
import {
    buildSelectEntityColumn, WithId, WithIdAndFirmwareIdReference
} from "@/components/data-table-action-columns/entity-action-columns.tsx";
import {useNavigate} from "react-router";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ActionButton, ScanAppActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {APPS_URL, FIRMWARE_URL, REPORTS_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {BookOpenIcon, EyeIcon} from "lucide-react";

function buildViewAppColumn<T extends WithIdAndFirmwareIdReference>(): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                const appId = row.original.id;
                const firmwareId = row.original.firmwareIdReference?.id;

                return (
                    <>
                        {firmwareId && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => void navigate(`${FIRMWARE_URL}/${firmwareId}${APPS_URL}/${appId}`)}
                                    >
                                        <EyeIcon className="size-5"/>
                                    </ActionButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View app</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </>
                );
            },
        }
    );
}

function buildViewReportsColumn<T extends WithIdAndFirmwareIdReference>(): ColumnDef<T> {
    return (
        {
            id: "view-reports",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                const appId = row.original.id;
                const firmwareId = row.original.firmwareIdReference?.id;

                return (
                    <>
                        {firmwareId && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => void navigate(`${FIRMWARE_URL}/${firmwareId}${APPS_URL}/${appId}${REPORTS_URL}`)}
                                    >
                                        <BookOpenIcon className="size-5"/>
                                    </ActionButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View reports</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </>
                );
            }
        }
    );
}

export function buildScanAppColumn<T extends WithId>(
    tooltipSingle: string,
    tooltipSelected: string,
    scanMutation: TypedDocumentNode<ScanApksByObjectIdsMutation | ScanApksByFirmwareObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
        queueName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T> {
    return (
        {
            id: "scan",
            header: ({table}) =>
                <ScanAppActionButton
                    ids={table.getSelectedRowModel().flatRows.map(row => row.original.id)}
                    tooltip={tooltipSelected}
                    mutation={scanMutation}
                />,
            cell: ({row}) =>
                <ScanAppActionButton
                    ids={[row.original.id]}
                    tooltip={tooltipSingle}
                    mutation={scanMutation}
                />,
        }
    );
}

export function buildAppActionColumns<T extends WithIdAndFirmwareIdReference>(
    scanAppMutation: TypedDocumentNode<ScanApksByObjectIdsMutation, Exact<{
        objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
        scannerName: Scalars["String"]["input"]
        queueName: Scalars["String"]["input"]
    }>>,
): ColumnDef<T> [] {
    return [
        buildSelectEntityColumn(),
        buildViewAppColumn(),
        buildViewReportsColumn(),
        buildScanAppColumn("Scan app", "Scan selected apps", scanAppMutation),
    ];
}
