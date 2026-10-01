import {BasePage} from "@/pages/base-page.tsx";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "@/lib/apollo-hooks";
import {
    FIRMWARE_ALL,
    GET_FIRMWARES_BY_OBJECT_IDS,
    SCAN_APKS_BY_FIRMWARE_OBJECT_IDS
} from "@/components/graphql/firmware.graphql.ts";
import {FirmwareAllFragment} from "@/__generated__/graphql.ts";
import {useFragment as readFragment} from "@/__generated__";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {
    AlertCircleIcon,
    ArrowRightIcon,
    CalendarIcon,
    CheckCircle2Icon,
    CpuIcon,
    DownloadIcon,
    FilesIcon,
    FingerprintIcon,
    FolderTreeIcon,
    HardDriveIcon,
    LayersIcon,
    ServerIcon,
    SmartphoneIcon,
    TagIcon,
    XCircleIcon,
} from "lucide-react";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ScanAppActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {APPS_URL, FILES_URL, FIRMWARE_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {useSetBreadcrumbTitle} from "@/lib/breadcrumb-store.ts";
import {formatDateTime} from "@/lib/date-utils.ts";
import {downloadJsonFile, formatBytes} from "@/lib/format-utils.ts";
import {CopyButton} from "@/components/ui/copy-button.tsx";

interface PartitionInfo {
    is_import_success?: boolean;
    firmware_file_count?: number;
    android_app_count?: number;
    build_prop_count?: number;
}

export function FirmwarePage() {
    const {firmwareId} = useParams<{ firmwareId: string }>();
    const navigate = useNavigate();

    const {
        loading: firmwaresLoading,
        data: firmwaresData,
        error: firmwaresError,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        variables: {objectIds: convertIdToObjectId(firmwareId as string)},
        skip: !firmwareId,
    });

    const firmwares = (firmwaresData?.android_firmware_connection?.edges ?? [])
        .map((edge) => readFragment(FIRMWARE_ALL, edge?.node))
        .filter(isNonNullish);

    const firmware: FirmwareAllFragment | undefined = firmwares[0];
    useSetBreadcrumbTitle(firmwareId, firmware?.filename || firmware?.originalFilename);

    if (!firmwareId) {
        return (
            <BasePage title="Firmware (missing ID)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing Firmware ID</AlertTitle>
                    <AlertDescription>No firmware identifier was provided in the route.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (firmwaresLoading) {
        return (
            <BasePage title="Firmware Details">
                <div className="w-full space-y-4 max-w-5xl">
                    <Skeleton className="w-full h-24 rounded-lg"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Skeleton className="h-28 rounded-lg"/>
                        <Skeleton className="h-28 rounded-lg"/>
                        <Skeleton className="h-28 rounded-lg"/>
                        <Skeleton className="h-28 rounded-lg"/>
                    </div>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                </div>
            </BasePage>
        );
    }

    if (firmwaresError) {
        return (
            <BasePage title="Firmware Details">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Unable to load firmware</AlertTitle>
                    <AlertDescription>An error occurred while loading this firmware image. Please try again.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (firmwares.length < 1) {
        return (
            <BasePage title="Firmware (not found)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Firmware Not Found</AlertTitle>
                    <AlertDescription>Could not find a firmware record matching ID '{firmwareId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (firmwares.length > 1) {
        return (
            <BasePage title="Firmware (multiple matches)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Multiple Firmware Images Found</AlertTitle>
                    <AlertDescription>Found multiple firmware entries matching ID '{firmwareId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    // Safely parse partitionInfoDict
    let partitions: Record<string, PartitionInfo> = {};
    if (firmware.partitionInfoDict) {
        try {
            partitions = typeof firmware.partitionInfoDict === "string"
                ? JSON.parse(firmware.partitionInfoDict)
                : firmware.partitionInfoDict;
        } catch {
            partitions = {};
        }
    }

    const partitionEntries = Object.entries(partitions);
    const successfulPartitions = partitionEntries.filter(([, data]) => data?.is_import_success);
    const totalExtractedApps = partitionEntries.reduce((acc, [, data]) => acc + (data?.android_app_count ?? 0), 0);
    const totalExtractedFiles = partitionEntries.reduce((acc, [, data]) => acc + (data?.firmware_file_count ?? 0), 0);
    const totalBuildProps = partitionEntries.reduce((acc, [, data]) => acc + (data?.build_prop_count ?? 0), 0);

    const displayName = firmware.originalFilename || firmware.filename || "Firmware Image";

    return (
        <BasePage title={`Firmware (${displayName})`}>
            <div className="w-full max-w-5xl space-y-6">
                {/* Header Card & Action Bar */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <ServerIcon className="size-6" aria-hidden="true" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl sm:text-2xl font-bold truncate max-w-[500px]" title={displayName}>
                                            {displayName}
                                        </CardTitle>
                                        <CopyButton value={displayName} label="Copy firmware name" />
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {firmware.osVendor && (
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {firmware.osVendor}
                                            </Badge>
                                        )}
                                        {firmware.versionDetected !== null && firmware.versionDetected !== undefined && (
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                                                Android {firmware.versionDetected}
                                            </Badge>
                                        )}
                                        {firmware.hasFileIndex ? (
                                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-xs">
                                                Files Indexed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground text-xs">
                                                Index Pending
                                            </Badge>
                                        )}
                                        {firmware.hasFuzzyHashIndex && (
                                            <Badge variant="outline" className="border-sky-500/30 text-sky-500 bg-sky-500/10 text-xs">
                                                Fuzzy Hashes Active
                                            </Badge>
                                        )}
                                        {firmware.tag && (
                                            <Badge variant="secondary" className="text-xs gap-1">
                                                <TagIcon className="size-3" />
                                                {firmware.tag}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${APPS_URL}`);
                                    }}
                                    title="View extracted Android applications"
                                >
                                    <SmartphoneIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Explore Apps
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${FILES_URL}`);
                                    }}
                                    title="Browse extracted file system"
                                >
                                    <FilesIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Browse Files
                                </Button>
                                <ScanAppActionButton
                                    ids={[firmwareId]}
                                    tooltip="Scan all apps extracted from this firmware"
                                    text="Scan All Apps"
                                    mutation={SCAN_APKS_BY_FIRMWARE_OBJECT_IDS}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        downloadJsonFile(`${firmware.filename || "firmware"}-metadata.json`, firmware);
                                    }}
                                    title="Export raw firmware metadata as JSON"
                                >
                                    <DownloadIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Download JSON
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* KPI Metrics Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card
                        className="border-border/60 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${APPS_URL}`)}
                    >
                        <CardContent className="pt-4 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-semibold uppercase tracking-wider">Extracted Apps</span>
                                <SmartphoneIcon className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {totalExtractedApps.toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-primary font-medium pt-1">
                                <span>View all apps</span>
                                <ArrowRightIcon className="size-3 ml-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-border/60 shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${FILES_URL}`)}
                    >
                        <CardContent className="pt-4 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-semibold uppercase tracking-wider">Total Files</span>
                                <FilesIcon className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {totalExtractedFiles.toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-primary font-medium pt-1">
                                <span>Browse file system</span>
                                <ArrowRightIcon className="size-3 ml-1" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="pt-4 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-semibold uppercase tracking-wider">Active Partitions</span>
                                <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                                {successfulPartitions.length}
                                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                                    of {partitionEntries.length} total
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-1 truncate">
                                {successfulPartitions.map(([name]) => name).join(", ") || "None"}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 shadow-sm">
                        <CardContent className="pt-4 space-y-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-semibold uppercase tracking-wider">OS Platform</span>
                                <CpuIcon className="size-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="text-2xl font-bold text-foreground truncate">
                                {firmware.osVendor || "Android"}
                            </div>
                            <div className="text-xs text-muted-foreground pt-1">
                                {firmware.versionDetected ? `Version ${firmware.versionDetected}` : "Version undetected"}
                                {totalBuildProps > 0 && ` (${totalBuildProps} build.prop)`}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Partition Breakdown */}
                {partitionEntries.length > 0 && (
                    <Card className="border-border/60 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                                Partition Extraction Details
                            </CardTitle>
                            <CardDescription>
                                Overview of firmware partitions and resources extracted during unbundling.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Partition</th>
                                            <th className="py-2.5 px-3">Status</th>
                                            <th className="py-2.5 px-3 text-right">Files</th>
                                            <th className="py-2.5 px-3 text-right">APKs</th>
                                            <th className="py-2.5 px-3 text-right">Build Properties</th>
                                            <th className="py-2.5 px-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40">
                                        {partitionEntries.map(([name, data]) => {
                                            const isSuccess = Boolean(data?.is_import_success);
                                            const fileCount = data?.firmware_file_count ?? 0;
                                            const appCount = data?.android_app_count ?? 0;
                                            const propCount = data?.build_prop_count ?? 0;

                                            return (
                                                <tr key={name} className="hover:bg-muted/30 transition-colors">
                                                    <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            {name}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        {isSuccess ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                <CheckCircle2Icon className="size-3.5" />
                                                                Extracted
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <XCircleIcon className="size-3.5" />
                                                                Skipped / Empty
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-medium text-foreground">
                                                        {fileCount.toLocaleString()}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        {appCount > 0 ? (
                                                            <Badge variant="secondary" className="font-mono text-xs">
                                                                {appCount} APKs
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">0</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                                                        {propCount > 0 ? `${propCount} prop` : "—"}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        {isSuccess && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs text-primary hover:text-primary"
                                                                onClick={() => {
                                                                    void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${FILES_URL}`);
                                                                }}
                                                            >
                                                                Browse
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Firmware Details & Storage Paths */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FolderTreeIcon className="size-4 text-primary" aria-hidden="true" />
                            Firmware Information & Storage
                        </CardTitle>
                        <CardDescription>
                            File attributes, disk storage locations, and build file references.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <HardDriveIcon className="size-3.5" aria-hidden="true" /> File Size
                            </span>
                            <div className="font-medium text-foreground">
                                {firmware.fileSizeBytes !== null && firmware.fileSizeBytes !== undefined ? (
                                    <>
                                        <span title={`${firmware.fileSizeBytes.toLocaleString()} bytes`}>
                                            {formatBytes(firmware.fileSizeBytes)}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            ({firmware.fileSizeBytes.toLocaleString()} bytes)
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
                                <span title={firmware.indexedDate ?? undefined}>
                                    {formatDateTime(firmware.indexedDate)}
                                </span>
                            </div>
                        </div>

                        {firmware.originalFilename && firmware.originalFilename !== firmware.filename && (
                            <div className="space-y-1 md:col-span-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Original Archive Filename
                                </span>
                                <div className="text-sm text-foreground break-all">
                                    {firmware.originalFilename}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Internal Filename / Hash
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.filename || "—"}
                                </code>
                                {firmware.filename && <CopyButton value={firmware.filename} label="Copy internal filename" />}
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Relative Store Path
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.relativeStorePath || "—"}
                                </code>
                                {firmware.relativeStorePath && (
                                    <CopyButton value={firmware.relativeStorePath} label="Copy relative store path" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Absolute Store Path
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.absoluteStorePath || "—"}
                                </code>
                                {firmware.absoluteStorePath && (
                                    <CopyButton value={firmware.absoluteStorePath} label="Copy absolute store path" />
                                )}
                            </div>
                        </div>

                        {firmware.aecsBuildFilePath && (
                            <div className="space-y-1 md:col-span-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    AECS Build File
                                </span>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                    <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                        {firmware.aecsBuildFilePath}
                                    </code>
                                    <CopyButton value={firmware.aecsBuildFilePath} label="Copy AECS build path" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cryptographic Hashes & Checksums */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FingerprintIcon className="size-4 text-primary" aria-hidden="true" />
                            Cryptographic Integrity & Hashes
                        </CardTitle>
                        <CardDescription>
                            Cryptographic checksums for verifying firmware integrity and tracking threat intelligence signatures.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">SHA-256</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.sha256 || "—"}
                                </code>
                                {firmware.sha256 && <CopyButton value={firmware.sha256} label="Copy SHA-256" />}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">SHA-1</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.sha1 || "—"}
                                </code>
                                {firmware.sha1 && <CopyButton value={firmware.sha1} label="Copy SHA-1" />}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">MD5</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {firmware.md5 || "—"}
                                </code>
                                {firmware.md5 && <CopyButton value={firmware.md5} label="Copy MD5" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </BasePage>
    );
}
