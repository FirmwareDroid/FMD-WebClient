import {formatDateTime} from "@/lib/date-utils.ts";
import {formatBytes} from "@/lib/format-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {FileListItemFragment, FirmwareAllFragment} from "@/__generated__/graphql.ts";
import {useParams, useSearchParams} from "react-router";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useQuery} from "@/lib/apollo-hooks";
import {useFragment as readFragment} from "@/__generated__";
import {FILE_LIST_ITEM, GET_FILES_BY_FIRMWARE} from "@/components/graphql/file.graphql.ts";
import {FIRMWARE_ALL, GET_FIRMWARES_BY_OBJECT_IDS} from "@/components/graphql/firmware.graphql.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildFileActionColumns} from "@/components/data-table-action-columns/file-action-columns.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {CursorPaginationProps} from "@/components/ui/table/cursor-pagination.tsx";
import {FileIcon, FolderIcon, HardDriveIcon, LayersIcon, LinkIcon} from "lucide-react";
import {useSetBreadcrumbTitle} from "@/lib/breadcrumb-store.ts";
import {ExtractFirmwareFilesDialog} from "@/components/firmware/extract-firmware-files-dialog.tsx";
import {DownloadExtractedArchiveButton} from "@/components/firmware/download-firmware-file-button.tsx";
import {FirmwareExtractionProgressBar} from "@/components/firmware/firmware-extraction-progress-bar.tsx";

interface PartitionInfo {
    is_import_success?: boolean;
    firmware_file_count?: number;
    android_app_count?: number;
    build_prop_count?: number;
}

const columns: ColumnDef<FileListItemFragment>[] = [
    ...buildFileActionColumns<FileListItemFragment>(),
    {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const file = row.original;
            return (
                <div className="flex items-center gap-2 max-w-[320px]">
                    {file.isDirectory ? (
                        <FolderIcon className="size-4 text-amber-500 shrink-0" aria-hidden="true" />
                    ) : file.isSymlink ? (
                        <LinkIcon className="size-4 text-sky-500 shrink-0" aria-hidden="true" />
                    ) : (
                        <FileIcon className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    )}
                    <span className="font-medium text-foreground truncate" title={file.name}>
                        {file.name}
                    </span>
                </div>
            );
        },
    },
    {
        id: "relativePath",
        accessorKey: "relativePath",
        header: "Relative Path",
        cell: ({getValue}) => {
            const val = getValue() as string | null | undefined;
            return (
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[260px] inline-block" title={val ?? undefined}>
                    {val || "—"}
                </span>
            );
        },
    },
    {
        id: "fileSizeBytes",
        accessorKey: "fileSizeBytes",
        header: "File Size",
        cell: ({row}) => {
            const bytes = row.original.fileSizeBytes;
            if (row.original.isDirectory) {
                return <span className="text-muted-foreground text-xs italic">Directory</span>;
            }
            if (bytes === null || bytes === undefined) {
                return <span className="text-muted-foreground text-xs">—</span>;
            }
            return (
                <span className="font-medium text-foreground text-xs" title={`${bytes.toLocaleString()} bytes`}>
                    {formatBytes(bytes)}
                </span>
            );
        },
    },
    {
        id: "partitionName",
        accessorKey: "partitionName",
        header: "Partition",
        cell: ({getValue}) => {
            const val = getValue() as string | null | undefined;
            if (!val) return <span className="text-muted-foreground text-xs">—</span>;
            return (
                <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0">
                    {val}
                </Badge>
            );
        },
    },
    {
        id: "type",
        header: "Type",
        cell: ({row}) => {
            const file = row.original;
            if (file.isDirectory) {
                return <Badge variant="secondary" className="text-[11px] px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">Dir</Badge>;
            }
            if (file.isSymlink) {
                return <Badge variant="secondary" className="text-[11px] px-1.5 py-0 bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20">Symlink</Badge>;
            }
            return <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-muted-foreground">File</Badge>;
        },
    },
    {
        id: "indexedDate",
        accessorKey: "indexedDate",
        header: "Indexed Date",
        cell: ({getValue}) => {
            const val = getValue() as string | null | undefined;
            return <span className="text-xs text-muted-foreground" title={val ?? undefined}>{formatDateTime(val)}</span>;
        },
    },
];

export function FilesPage() {
    const {firmwareId} = useParams<{ firmwareId?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    let firmwareObjectId: string | undefined;
    if (firmwareId) {
        firmwareObjectId = convertIdToObjectId(firmwareId);
    }

    useSetBreadcrumbTitle("files", "Files");

    // Secure URL parameter parsing and validation
    const rawPartition = searchParams.get("partition");
    // Validate partition against safe identifier regex to prevent injection
    const selectedPartition = (rawPartition && /^[a-zA-Z0-9_-]+$/.test(rawPartition)) ? rawPartition : undefined;

    const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
    const currentPage = Number.isFinite(pageParam) && pageParam >= 1 ? pageParam : 1;

    const sizeParam = parseInt(searchParams.get("pageSize") ?? "50", 10);
    const validSizes = [10, 25, 50, 100, 250];
    const pageSize = validSizes.includes(sizeParam) ? sizeParam : 50;

    const offset = (currentPage - 1) * pageSize;

    // Load firmware metadata to show partition tabs (served from Apollo cache if visited FirmwarePage)
    const {data: firmwareData} = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        variables: {objectIds: firmwareObjectId},
        skip: !firmwareObjectId,
        fetchPolicy: "cache-first",
    });

    const firmwares = (firmwareData?.android_firmware_connection?.edges ?? [])
        .map((edge) => readFragment(FIRMWARE_ALL, edge?.node))
        .filter(isNonNullish);
    const firmware: FirmwareAllFragment | undefined = firmwares[0];

    // Safely extract partitions
    let partitions: Record<string, PartitionInfo> = {};
    if (firmware?.partitionInfoDict) {
        try {
            partitions = typeof firmware.partitionInfoDict === "string"
                ? JSON.parse(firmware.partitionInfoDict)
                : firmware.partitionInfoDict;
        } catch {
            partitions = {};
        }
    }
    const partitionEntries = Object.entries(partitions).filter(([, data]) => (data?.firmware_file_count ?? 0) > 0);

    // Query paginated files and total count
    const {
        loading: filesLoading,
        error: filesError,
        data: filesData,
        refetch: refetchFiles,
    } = useQuery(GET_FILES_BY_FIRMWARE, {
        variables: {
            filter: {
                firmware_id_reference: firmwareObjectId,
                ...(selectedPartition ? {partition_name: selectedPartition} : {}),
            },
            limit: pageSize,
            offset: offset,
        },
        skip: !firmwareObjectId,
        fetchPolicy: "cache-first",
    });

    const files = (filesData?.firmware_file_list ?? [])
        .map((item) => readFragment(FILE_LIST_ITEM, item))
        .filter(isNonNullish);

    const totalCount = filesData?.firmware_file_count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const handlePartitionChange = (partitionName: string | undefined) => {
        const nextParams = new URLSearchParams(searchParams);
        if (partitionName) {
            nextParams.set("partition", partitionName);
        } else {
            nextParams.delete("partition");
        }
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const handlePageChange = (newPage: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(newPage));
        setSearchParams(nextParams);
    };

    const handlePageSizeChange = (newSize: number) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("pageSize", String(newSize));
        nextParams.set("page", "1");
        setSearchParams(nextParams);
    };

    const cursorPagination: CursorPaginationProps = {
        pageSize: pageSize,
        onPageSizeChange: handlePageSizeChange,
        hasPrevious: currentPage > 1,
        hasNext: currentPage < totalPages,
        onPrevious: () => handlePageChange(currentPage - 1),
        onNext: () => handlePageChange(currentPage + 1),
        loading: filesLoading,
    };

    const startItem = totalCount > 0 ? offset + 1 : 0;
    const endItem = Math.min(offset + pageSize, totalCount);

    return (
        <BasePage title="Files">
            <div className="w-full space-y-4 max-w-5xl">
                {/* Partition Filter Tabs */}
                {partitionEntries.length > 0 && (
                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="pt-4 pb-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
                                <LayersIcon className="size-3.5 text-primary" aria-hidden="true" />
                                Partitions:
                            </span>
                            <Button
                                size="sm"
                                variant={!selectedPartition ? "default" : "outline"}
                                className="h-7 text-xs rounded-full px-3"
                                onClick={() => handlePartitionChange(undefined)}
                            >
                                All Partitions
                            </Button>
                            {partitionEntries.map(([name, data]) => {
                                const isSelected = selectedPartition === name;
                                const count = data?.firmware_file_count ?? 0;
                                return (
                                    <Button
                                        key={name}
                                        size="sm"
                                        variant={isSelected ? "default" : "outline"}
                                        className="h-7 text-xs rounded-full px-3 gap-1.5 font-mono"
                                        onClick={() => handlePartitionChange(name)}
                                    >
                                        <span>{name}</span>
                                        <span className={`text-[10px] px-1 rounded-sm ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                            {count.toLocaleString()}
                                        </span>
                                    </Button>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                {/* Real-Time File Extraction Progress Tracker */}
                {firmwareId && (
                    <FirmwareExtractionProgressBar
                        firmwareId={firmwareId}
                        onExtractionComplete={() => {
                            void refetchFiles();
                        }}
                    />
                )}

                {/* File Extraction & Download Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/30 border border-border/60 rounded-xl shadow-xs">
                    <div className="flex items-center gap-2">
                        <HardDriveIcon className="size-4 text-primary shrink-0" aria-hidden="true" />
                        <span className="text-xs text-muted-foreground">
                            Extract firmware files to server storage to enable direct file and archive downloads.
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {firmwareId && (
                            <>
                                <ExtractFirmwareFilesDialog
                                    firmwareId={firmwareId}
                                    firmwareName={firmware?.filename}
                                    buttonText="Extract All Files"
                                    variant="outline"
                                    size="sm"
                                />
                                <DownloadExtractedArchiveButton
                                    firmwareId={firmwareId}
                                    firmwareName={firmware?.filename}
                                    variant="outline"
                                    size="sm"
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                    <div className="flex items-center gap-2">
                        <HardDriveIcon className="size-3.5" aria-hidden="true" />
                        <span>
                            Showing <strong className="text-foreground font-semibold">{startItem.toLocaleString()}–{endItem.toLocaleString()}</strong> of <strong className="text-foreground font-semibold">{totalCount.toLocaleString()}</strong> files
                            {selectedPartition && (
                                <> in partition <Badge variant="outline" className="font-mono text-[10px] ml-1">{selectedPartition}</Badge></>
                            )}
                        </span>
                    </div>
                    {totalPages > 1 && (
                        <span>
                            Page <strong className="text-foreground font-semibold">{currentPage}</strong> of <strong className="text-foreground font-semibold">{totalPages}</strong>
                        </span>
                    )}
                </div>

                <StateHandlingScrollableDataTable
                    columns={columns}
                    data={files}
                    dataLoading={filesLoading}
                    dataError={filesError}
                    cursorPagination={cursorPagination}
                />
            </div>
        </BasePage>
    );
}
