import type {ColumnDef} from "@tanstack/react-table";
import {
    buildSelectEntityColumn,
    WithIdAndFirmwareIdReference
} from "@/components/data-table-action-columns/entity-action-columns.tsx";
import {useNavigate} from "react-router";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {FILES_URL, FIRMWARE_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {EyeIcon} from "lucide-react";
import {DownloadFirmwareFileButton} from "@/components/firmware/download-firmware-file-button.tsx";

export type WithFileDownload = WithIdAndFirmwareIdReference & {
    name?: string | null;
    isOnDisk?: boolean | null;
    isDirectory?: boolean | null;
};

function buildViewFileColumn<T extends WithIdAndFirmwareIdReference>(): ColumnDef<T> {
    return (
        {
            id: "view",
            cell: ({row}) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                const fileId = row.original.id;
                const firmwareId = row.original.firmwareIdReference?.id;

                return (
                    <>
                        {firmwareId && (
                            <Tooltip delayDuration={500}>
                                <TooltipTrigger asChild>
                                    <ActionButton
                                        variant="outline"
                                        onClick={() => void navigate(`${FIRMWARE_URL}/${firmwareId}${FILES_URL}/${fileId}`)}
                                    >
                                        <EyeIcon className="size-5"/>
                                    </ActionButton>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>View file</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </>
                );
            },
        }
    );
}

function buildDownloadFileColumn<T extends WithFileDownload>(): ColumnDef<T> {
    return (
        {
            id: "download",
            cell: ({row}) => {
                const file = row.original;
                if (file.isDirectory) {
                    return null;
                }
                return (
                    <DownloadFirmwareFileButton
                        fileId={file.id}
                        isOnDisk={file.isOnDisk}
                        fileName={file.name}
                        variant="outline"
                        size="icon"
                    />
                );
            },
        }
    );
}

export function buildFileActionColumns<T extends WithFileDownload>(): ColumnDef<T> [] {
    return [
        buildSelectEntityColumn(),
        buildViewFileColumn(),
        buildDownloadFileColumn(),
    ];
}
