import type {ColumnDef} from "@tanstack/react-table";
import {useNavigate} from "react-router";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {APPS_URL, FIRMWARE_URL, REPORTS_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {EyeIcon} from "lucide-react";

type WithIdAndAppIdAndFirmwareId = {
    id?: string | null;
    scannerName: string;
    androidAppIdReference: {
        __typename?: "AndroidAppType"
        id: string
        filename: string
        firmwareIdReference?: {
            __typename?: "AndroidFirmwareType"
            id: string
        } | null
    };
};

export function buildViewReportColumn<T extends WithIdAndAppIdAndFirmwareId>(): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                const reportId = row.original.id;
                const appId = row.original.androidAppIdReference.id;
                const firmwareId = row.original.androidAppIdReference.firmwareIdReference?.id;
                const scannerName = row.original.scannerName;

                return (
                    <>
                        {firmwareId && reportId && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => void navigate(`${FIRMWARE_URL}/${firmwareId}${APPS_URL}/${appId}${REPORTS_URL}/${scannerName}-${reportId}`)}
                                    >
                                        <EyeIcon className="size-5"/>
                                    </ActionButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View report</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </>
                );
            },
        }
    );
}