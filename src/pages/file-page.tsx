import {BasePage} from "@/pages/base-page.tsx";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "@/lib/apollo-hooks";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    CalendarIcon,
    DownloadIcon,
    FileIcon,
    FingerprintIcon,
    FolderIcon,
    FolderTreeIcon,
    HardDriveIcon,
    LayersIcon,
    LinkIcon,
    SmartphoneIcon,
} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useFragment as readFragment} from "@/__generated__";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {FileAllFragment} from "@/__generated__/graphql.ts";
import {FILE_ALL, GET_FILE_BY_OBJECT_ID} from "@/components/graphql/file.graphql.ts";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {APPS_URL, FILES_URL, FIRMWARE_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {formatDateTime} from "@/lib/date-utils.ts";
import {downloadJsonFile, formatBytes} from "@/lib/format-utils.ts";
import {CopyButton} from "@/components/ui/copy-button.tsx";
import {DownloadFirmwareFileButton} from "@/components/firmware/download-firmware-file-button.tsx";
import {useSetBreadcrumbTitle} from "@/lib/breadcrumb-store.ts";

export function FilePage() {
    const {firmwareId, fileId} = useParams<{ firmwareId?: string; fileId?: string }>();
    const navigate = useNavigate();

    const fileObjectId = fileId ? convertIdToObjectId(fileId) : undefined;

    const {
        loading: filesLoading,
        data: filesData,
        error: filesError,
    } = useQuery(GET_FILE_BY_OBJECT_ID, {
        variables: {objectIdList: fileObjectId ? [fileObjectId] : undefined},
        skip: !fileObjectId,
        fetchPolicy: "cache-first",
    });

    const files = (filesData?.firmware_file_list ?? [])
        .map((item) => readFragment(FILE_ALL, item))
        .filter(isNonNullish);

    const file: FileAllFragment | undefined = files[0];

    useSetBreadcrumbTitle(fileId, file?.name);

    if (!fileId) {
        return (
            <BasePage title="File (missing ID)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing File ID</AlertTitle>
                    <AlertDescription>No file identifier was provided in the route.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (filesLoading) {
        return (
            <BasePage title="File Details">
                <div className="w-full space-y-4 max-w-5xl">
                    <Skeleton className="w-full h-24 rounded-lg"/>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                </div>
            </BasePage>
        );
    }

    if (filesError) {
        return (
            <BasePage title="File Details">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Unable to load file</AlertTitle>
                    <AlertDescription>An error occurred while retrieving this file from the database. Please try again.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (files.length < 1) {
        return (
            <BasePage title="File (not found)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>File Not Found</AlertTitle>
                    <AlertDescription>Could not find a file record matching ID '{fileId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (files.length > 1) {
        return (
            <BasePage title="File (multiple matches)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Multiple Files Found</AlertTitle>
                    <AlertDescription>Found multiple files matching ID '{fileId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    const currentFirmwareId = file.firmwareIdReference?.id || firmwareId;
    const connectedAppId = file.androidAppReference?.id;

    // Parse metaDict safely if available
    let parsedMeta: Record<string, unknown> | null = null;
    if (file.metaDict) {
        try {
            parsedMeta = typeof file.metaDict === "string" ? JSON.parse(file.metaDict) : file.metaDict;
        } catch {
            parsedMeta = null;
        }
    }

    return (
        <BasePage title={file.name || "File Details"}>
            <div className="w-full max-w-5xl space-y-6">
                {/* Header Card & Actions */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    {file.isDirectory ? (
                                        <FolderIcon className="size-6 text-amber-500" aria-hidden="true" />
                                    ) : file.isSymlink ? (
                                        <LinkIcon className="size-6 text-sky-500" aria-hidden="true" />
                                    ) : (
                                        <FileIcon className="size-6 text-primary" aria-hidden="true" />
                                    )}
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl sm:text-2xl font-bold truncate">
                                            {file.name || "Unnamed File"}
                                        </CardTitle>
                                        {file.name && <CopyButton value={file.name} label="Copy filename" />}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {file.isDirectory && (
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs">
                                                Directory
                                            </Badge>
                                        )}
                                        {file.isSymlink && (
                                            <Badge variant="secondary" className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-xs">
                                                Symlink
                                            </Badge>
                                        )}
                                        {!file.isDirectory && !file.isSymlink && (
                                            <Badge variant="outline" className="text-xs">
                                                Regular File
                                            </Badge>
                                        )}
                                        {file.partitionName && (
                                            <Badge variant="outline" className="font-mono text-xs">
                                                Partition: {file.partitionName}
                                            </Badge>
                                        )}
                                        {file.isOnDisk && (
                                            <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                                                On Disk
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {currentFirmwareId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(currentFirmwareId)}${FILES_URL}`);
                                        }}
                                        title="Back to file listing"
                                    >
                                        <ArrowLeftIcon className="size-4 mr-1.5" aria-hidden="true" />
                                        Files
                                    </Button>
                                )}
                                {currentFirmwareId && connectedAppId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(currentFirmwareId)}${APPS_URL}/${encodeURIComponent(connectedAppId)}`);
                                        }}
                                        title="View extracted application details"
                                    >
                                        <SmartphoneIcon className="size-4 mr-1.5" aria-hidden="true" />
                                        View App
                                    </Button>
                                )}
                                {!file.isDirectory && (
                                    <DownloadFirmwareFileButton
                                        fileId={file.id}
                                        isOnDisk={file.isOnDisk}
                                        fileName={file.name}
                                        text="Download File"
                                        variant="default"
                                        size="sm"
                                    />
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        downloadJsonFile(`${file.name || "file"}-metadata.json`, file);
                                    }}
                                    title="Export raw file metadata as JSON"
                                >
                                    <DownloadIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Download JSON
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* File Metadata Overview */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                            File Information
                        </CardTitle>
                        <CardDescription>
                            Physical and logical attributes recorded during firmware extraction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <HardDriveIcon className="size-3.5" aria-hidden="true" /> File Size
                            </span>
                            <div className="font-medium text-foreground">
                                {file.isDirectory ? (
                                    <span className="text-muted-foreground italic font-sans text-sm">Directory (N/A)</span>
                                ) : file.fileSizeBytes !== null && file.fileSizeBytes !== undefined ? (
                                    <>
                                        <span title={`${file.fileSizeBytes.toLocaleString()} bytes`}>
                                            {formatBytes(file.fileSizeBytes)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({file.fileSizeBytes.toLocaleString()} bytes)
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <CalendarIcon className="size-3.5" aria-hidden="true" /> Indexed Date
                            </span>
                            <div className="font-medium text-foreground">
                                <span title={file.indexedDate ?? undefined}>
                                    {formatDateTime(file.indexedDate)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <FolderTreeIcon className="size-3.5" aria-hidden="true" /> Relative Firmware Path
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {file.relativePath || "—"}
                                </code>
                                {file.relativePath && (
                                    <CopyButton value={file.relativePath} label="Copy relative path" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parent Directory</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {file.parentDir || "—"}
                                </code>
                                {file.parentDir && (
                                    <CopyButton value={file.parentDir} label="Copy parent directory" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Storage Path</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {file.absoluteStorePath || "—"}
                                </code>
                                {file.absoluteStorePath && (
                                    <CopyButton value={file.absoluteStorePath} label="Copy storage path" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hashes & File Integrity */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FingerprintIcon className="size-4 text-primary" aria-hidden="true" />
                            File Integrity & Hashes
                        </CardTitle>
                        <CardDescription>
                            Cryptographic and fuzzy hashes computed for malware analysis and deduplication.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">MD5</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {file.md5 || (file.isDirectory ? "Not applicable for directories" : "—")}
                                </code>
                                {file.md5 && <CopyButton value={file.md5} label="Copy MD5" />}
                            </div>
                        </div>

                        {file.tlshReference?.digest && (
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">TLSH Fuzzy Hash</span>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                    <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                        {file.tlshReference.digest}
                                    </code>
                                    <CopyButton value={file.tlshReference.digest} label="Copy TLSH" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Connected Entities */}
                {(file.firmwareIdReference || file.androidAppReference) && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <FolderTreeIcon className="size-4 text-primary" aria-hidden="true" />
                                Associated Entities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {file.firmwareIdReference && (
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Parent Firmware</span>
                                    <div className="font-semibold text-foreground truncate">
                                        {file.firmwareIdReference.filename || "Firmware"}
                                    </div>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-primary text-xs"
                                        onClick={() => {
                                            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(file.firmwareIdReference?.id || "")}`);
                                        }}
                                    >
                                        View Firmware Details &rarr;
                                    </Button>
                                </div>
                            )}

                            {file.androidAppReference && currentFirmwareId && (
                                <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Extracted Android App</span>
                                    <div className="font-semibold text-foreground truncate">
                                        {file.androidAppReference.packagename || file.androidAppReference.filename || "Android App"}
                                    </div>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-primary text-xs"
                                        onClick={() => {
                                            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(currentFirmwareId)}${APPS_URL}/${encodeURIComponent(file.androidAppReference?.id || "")}`);
                                        }}
                                    >
                                        View App Details &rarr;
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Additional Metadata (if available) */}
                {parsedMeta && Object.keys(parsedMeta).length > 0 && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">Extended Metadata</CardTitle>
                                <CopyButton value={JSON.stringify(parsedMeta, null, 2)} label="Copy JSON" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <pre className="p-3 rounded-md bg-muted/50 border border-border/50 font-mono text-xs overflow-x-auto text-foreground">
                                <code>{JSON.stringify(parsedMeta, null, 2)}</code>
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </BasePage>
    );
}
