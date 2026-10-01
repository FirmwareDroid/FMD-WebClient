import {formatDateTime} from "@/lib/date-utils.ts";
import {formatBytes} from "@/lib/format-utils.ts";
import {BasePage} from "@/pages/base-page.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {FileListItemFragment} from "@/__generated__/graphql.ts";
import {useParams} from "react-router";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {useQuery} from "@/lib/apollo-hooks";
import {useFragment as readFragment} from "@/__generated__";
import {FILE_LIST_ITEM, GET_FILES_BY_FIRMWARE} from "@/components/graphql/file.graphql.ts";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildFileActionColumns} from "@/components/data-table-action-columns/file-action-columns.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {FileIcon, FolderIcon, LinkIcon} from "lucide-react";
import {useSetBreadcrumbTitle} from "@/lib/breadcrumb-store.ts";

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

    let firmwareObjectId: string | undefined;
    if (firmwareId) {
        firmwareObjectId = convertIdToObjectId(firmwareId);
    }

    useSetBreadcrumbTitle("files", "Files");

    const {
        loading: filesLoading,
        error: filesError,
        data: filesData,
    } = useQuery(GET_FILES_BY_FIRMWARE, {
        variables: {
            filter: {
                firmware_id_reference: firmwareObjectId,
            },
        },
        skip: !firmwareObjectId,
        fetchPolicy: "cache-first",
    });

    const files = (filesData?.firmware_file_list ?? [])
        .map((item) => readFragment(FILE_LIST_ITEM, item))
        .filter(isNonNullish);

    return (
        <BasePage title="Files">
            <StateHandlingScrollableDataTable
                columns={columns}
                data={files}
                dataLoading={filesLoading}
                dataError={filesError}
            />
        </BasePage>
    );
}
