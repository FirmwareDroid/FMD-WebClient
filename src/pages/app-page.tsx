import {useNavigate, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {BasePage} from "@/pages/base-page.tsx";
import {useMutation, useQuery} from "@/lib/apollo-hooks";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {APP_ALL, GET_APP_BY_ID, SCAN_APKS_BY_OBJECT_IDS} from "@/components/graphql/app.graphql.ts";
import {GET_APP_REPORTS_WITH_FINDINGS, META_APK_SCANNER_REPORT} from "@/components/graphql/report.graphql.ts";
import {SecurityFindingsCard} from "@/components/report/security-findings-card.tsx";
import {extractInterestingFindings} from "@/lib/report-utils.ts";
import {useMemo} from "react";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {useFragment as readFragment} from "@/__generated__";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {
    AlertCircleIcon,
    CalendarIcon,
    DownloadIcon,
    FileIcon,
    FingerprintIcon,
    FolderTreeIcon,
    HardDriveIcon,
    KeyIcon,
    LayersIcon,
    PlayIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Spinner} from "@/components/ui/spinner.tsx";
import {AppAllFragment, MetaReportFieldsFragment} from "@/__generated__/graphql.ts";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {ScanAppActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {FILES_URL, FIRMWARE_URL} from "@/components/ui/sidebar/app-sidebar.tsx";
import {formatDateTime} from "@/lib/date-utils.ts";
import {downloadJsonFile, formatBytes} from "@/lib/format-utils.ts";
import {CopyButton} from "@/components/ui/copy-button.tsx";
import {StateHandlingScrollableDataTable} from "@/components/ui/table/data-table.tsx";
import {buildViewReportColumn} from "@/components/data-table-action-columns/report-action-columns.tsx";
import {useToastStore} from "@/stores/toast.ts";
import {useSetBreadcrumbTitle} from "@/lib/breadcrumb-store.ts";
import {AndroidManifestCard} from "@/components/app/android-manifest-card.tsx";
import {parseAndroidManifest} from "@/lib/manifest-utils.ts";
import type {ColumnDef} from "@tanstack/react-table";

const reportColumns: ColumnDef<MetaReportFieldsFragment, unknown>[] = [
    buildViewReportColumn<MetaReportFieldsFragment>(),
    {
        id: "scannerName",
        accessorKey: "scannerName",
        header: "Scanner Name",
        cell: ({ getValue }) => {
            const val = getValue() as string | null | undefined;
            return <span className="font-medium text-foreground">{val || "—"}</span>;
        },
    },
    {
        id: "scannerVersion",
        accessorKey: "scannerVersion",
        header: "Scanner Version",
        cell: ({ getValue }) => {
            const val = getValue() as string | null | undefined;
            return <span className="text-muted-foreground">{val || "—"}</span>;
        },
    },
    {
        id: "reportDate",
        accessorKey: "reportDate",
        header: "Report Date",
        cell: ({ getValue }) => {
            const val = getValue() as string | null | undefined;
            return <span title={val ?? undefined}>{formatDateTime(val)}</span>;
        },
    },
    {
        id: "scanStatus",
        accessorKey: "scanStatus",
        header: "Status",
        cell: ({ getValue }) => {
            const raw = getValue() as string | null | undefined;
            if (!raw) return <span className="text-muted-foreground">—</span>;
            const normalized = raw.toLowerCase().trim();

            if (normalized === "finished" || normalized === "success" || normalized === "completed") {
                return (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        {raw}
                    </Badge>
                );
            }
            if (normalized === "failed" || normalized === "error") {
                return <Badge variant="destructive">{raw}</Badge>;
            }
            return <Badge variant="outline">{raw}</Badge>;
        },
    },
];

export function AppPage() {
    const {appId} = useParams<{ appId: string }>();
    const navigate = useNavigate();
    const toast = useToastStore();
    const [isTriggeringScan, setIsTriggeringScan] = useState(false);
    const [scanApk] = useMutation(SCAN_APKS_BY_OBJECT_IDS);

    const {
        loading: appsLoading,
        data: appsData,
        error: appsError,
        refetch: refetchApp,
    } = useQuery(GET_APP_BY_ID, {
        variables: {id: appId as string},
        skip: !appId,
    });

    const apps = (appsData?.android_firmware_connection?.edges ?? [])
        .flatMap((firmwareEdge: any) => (firmwareEdge?.node?.androidAppIdList?.edges ?? []))
        .map((edge) => readFragment(APP_ALL, edge?.node))
        .filter(isNonNullish);

    const app: AppAllFragment | undefined = apps[0];
    const appObjectId = app?.pk ?? (appId ? convertIdToObjectId(appId) : undefined);

    const parsedManifest = parseAndroidManifest(app?.androidManifestDict);

    useSetBreadcrumbTitle(appId, app?.filename || app?.packagename);

    const {
        loading: reportsLoading,
        error: reportsError,
        data: reportsData,
        refetch: refetchReports,
    } = useQuery(GET_APP_REPORTS_WITH_FINDINGS, {
        variables: {appObjectId: appObjectId},
        skip: !appObjectId,
        fetchPolicy: "cache-and-network",
    });

    const rawReports = (reportsData?.apk_scanner_report_list ?? []).filter(isNonNullish);

    const reports = rawReports
        .map((report) => {
            if (!report) return null;
            return readFragment(META_APK_SCANNER_REPORT, report as any);
        })
        .filter(isNonNullish);

    const interestingFindings = useMemo(() => {
        return extractInterestingFindings(rawReports as any);
    }, [rawReports]);

    // Query active scanner RQ jobs
    const {
        data: rqData,
        refetch: refetchRqJobs,
        startPolling,
        stopPolling,
    } = useQuery(GET_RQ_JOB_LIST, {
        variables: {queueName: "scanner"},
        skip: !appObjectId,
        fetchPolicy: "network-only",
    });

    const hasActiveManifestJob = Boolean(
        appObjectId &&
        (rqData?.rq_job_list ?? []).some((job) => {
            if (!job || job.isFinished || job.isFailed) return false;
            let meta: any = job.meta;
            if (typeof meta === "string") {
                try {
                    meta = JSON.parse(meta);
                } catch {
                    meta = null;
                }
            }
            return (
                meta?.module_name === "MANIFEST" &&
                Array.isArray(meta?.object_id_list) &&
                meta.object_id_list.includes(appObjectId)
            );
        })
    );

    const isManifestScanRunning = isTriggeringScan || hasActiveManifestJob;
    const wasRunningRef = useRef(false);

    useEffect(() => {
        if (isManifestScanRunning) {
            startPolling(3000);
            wasRunningRef.current = true;
        } else {
            stopPolling();
            if (wasRunningRef.current) {
                wasRunningRef.current = false;
                // Job completed: refetch app details to pick up updated package name
                void refetchApp();
                void refetchReports();
            }
        }
        return () => {
            stopPolling();
        };
    }, [isManifestScanRunning, startPolling, stopPolling, refetchApp, refetchReports]);

    const handleRunManifestScan = async () => {
        if (!appObjectId || isManifestScanRunning) return;
        setIsTriggeringScan(true);
        try {
            await scanApk({
                variables: {
                    objectIds: [appObjectId],
                    scannerName: "MANIFEST",
                    queueName: "scanner",
                },
            });
            toast.success("MANIFEST scan job started. Package name will be updated once analysis finishes.");
            void refetchRqJobs();
            void refetchReports();
        } catch (err) {
            console.error("Failed to start MANIFEST scan job:", err);
            toast.error("Failed to start MANIFEST scan job. Please try again.");
        } finally {
            setIsTriggeringScan(false);
        }
    };

    if (!appId) {
        return (
            <BasePage title="App (missing ID)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing App ID</AlertTitle>
                    <AlertDescription>No application identifier was provided in the route.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (appsLoading) {
        return (
            <BasePage title="App Details">
                <div className="w-full space-y-4 max-w-5xl">
                    <Skeleton className="w-full h-24 rounded-lg"/>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                    <Skeleton className="w-full h-64 rounded-lg"/>
                </div>
            </BasePage>
        );
    }

    if (appsError) {
        return (
            <BasePage title="App Details">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Unable to load this app</AlertTitle>
                    <AlertDescription>An error occurred while fetching app details. Please try again.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (apps.length < 1) {
        return (
            <BasePage title="App (not found)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>App Not Found</AlertTitle>
                    <AlertDescription>Could not find an application matching ID '{appId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (apps.length > 1) {
        return (
            <BasePage title="App (multiple matches)">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>Multiple Apps Found</AlertTitle>
                    <AlertDescription>Found multiple app entries matching ID '{appId}'.</AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    const firmwareId = app.firmwareIdReference?.id;
    const firmwareFileId = app.firmwareFileReference?.id;

    return (
        <BasePage title={app.filename || "App Details"}>
            <div className="w-full max-w-5xl space-y-6">
                {/* Header Card & Action Bar */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <SmartphoneIcon className="size-6" aria-hidden="true" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <CardTitle className="text-xl sm:text-2xl font-bold truncate">
                                            {app.filename || "Unnamed Application"}
                                        </CardTitle>
                                        {appObjectId && (
                                            <Badge variant="outline" className="font-mono text-xs gap-1.5 px-2 py-0.5 border-border/80 bg-muted/40">
                                                <KeyIcon className="size-3 text-primary" aria-hidden="true" />
                                                <span className="text-muted-foreground text-[11px]">ObjectId:</span>
                                                <span className="text-foreground font-semibold">{appObjectId}</span>
                                                <CopyButton value={appObjectId} label="Copy app ObjectId" />
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <CardDescription className="font-mono text-xs break-all">
                                            {app.packagename || "Unpackaged / System library"}
                                        </CardDescription>
                                        {!app.packagename && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-6 px-2 text-[11px] gap-1.5 font-medium text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                                                disabled={isManifestScanRunning}
                                                onClick={() => void handleRunManifestScan()}
                                                title={isManifestScanRunning ? "MANIFEST scan is currently running" : "Run MANIFEST scanner to extract package name"}
                                            >
                                                {isManifestScanRunning ? (
                                                    <>
                                                        <Spinner size="sm" />
                                                        Manifest Scan Running...
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayIcon className="size-3 text-primary fill-primary" aria-hidden="true" />
                                                        Scan MANIFEST
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <ScanAppActionButton
                                    ids={[appId]}
                                    tooltip="Scan this app"
                                    text="Scan this App"
                                    mutation={SCAN_APKS_BY_OBJECT_IDS}
                                />
                                {firmwareId && firmwareFileId && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${FILES_URL}/${encodeURIComponent(firmwareFileId)}`);
                                        }}
                                    >
                                        <FileIcon className="size-4 mr-1.5" aria-hidden="true" />
                                        Firmware File
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        downloadJsonFile(`${app.filename || "app"}-metadata.json`, app);
                                    }}
                                    title="Export raw app metadata as JSON"
                                >
                                    <DownloadIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Download JSON
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Application Overview */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                            Application Overview
                        </CardTitle>
                        <CardDescription>
                            Key identification and file system details for this application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <KeyIcon className="size-3.5 text-primary" aria-hidden="true" /> Unique Object ID (MongoDB)
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {appObjectId || "—"}
                                </code>
                                {appObjectId && (
                                    <CopyButton value={appObjectId} label="Copy unique ObjectId" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Package Name</span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {app.packagename ? (
                                    <div className="font-mono text-sm break-all font-medium text-foreground">
                                        {app.packagename}
                                    </div>
                                ) : isManifestScanRunning ? (
                                    <Badge
                                        variant="outline"
                                        className="border-amber-500/40 text-amber-500 bg-amber-500/10 gap-1.5 font-medium px-2.5 py-1 text-xs"
                                    >
                                        <Spinner size="sm" className="text-amber-500" />
                                        Manifest analysis in progress...
                                    </Badge>
                                ) : (
                                    <>
                                        <span className="text-muted-foreground italic font-sans text-sm">
                                            Not detected
                                        </span>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="h-7 px-2.5 text-xs font-medium gap-1.5 shadow-none border border-border/60 hover:bg-secondary/80 text-foreground"
                                            disabled={isManifestScanRunning}
                                            onClick={() => void handleRunManifestScan()}
                                            title="Run the MANIFEST scanner to extract package name and manifest metadata"
                                        >
                                            <PlayIcon className="size-3.5 text-primary fill-primary" aria-hidden="true" />
                                            Run MANIFEST Scan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Partition</span>
                            <div>
                                {app.partitionName ? (
                                    <Badge variant="outline" className="font-mono text-xs font-semibold">
                                        {app.partitionName}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <HardDriveIcon className="size-3.5" aria-hidden="true" /> File Size
                            </span>
                            <div className="font-medium text-foreground">
                                <span title={`${app.fileSizeBytes.toLocaleString()} bytes`}>
                                    {formatBytes(app.fileSizeBytes)}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({app.fileSizeBytes.toLocaleString()} bytes)
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <CalendarIcon className="size-3.5" aria-hidden="true" /> Indexed Date
                            </span>
                            <div className="font-medium text-foreground">
                                <span title={app.indexedDate ?? undefined}>
                                    {formatDateTime(app.indexedDate)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <FolderTreeIcon className="size-3.5" aria-hidden="true" /> Android Firmware Path
                            </span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {app.relativeFirmwarePath || "—"}
                                </code>
                                {app.relativeFirmwarePath && (
                                    <CopyButton value={app.relativeFirmwarePath} label="Copy firmware path" />
                                )}
                            </div>
                        </div>

                        {app.relativeStorePath && (
                            <div className="space-y-1 md:col-span-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <FolderTreeIcon className="size-3.5" aria-hidden="true" /> Relative Store Path
                                </span>
                                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                    <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                        {app.relativeStorePath}
                                    </code>
                                    <CopyButton value={app.relativeStorePath} label="Copy relative store path" />
                                </div>
                            </div>
                        )}

                        {app.originalFilename && app.originalFilename !== app.filename && (
                            <div className="space-y-1 md:col-span-2">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Original Filename</span>
                                <div className="text-sm text-foreground break-all">
                                    {app.originalFilename}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Android Manifest Card (rendered when manifest data is available) */}
                {parsedManifest && (
                    <AndroidManifestCard
                        manifest={parsedManifest}
                        appName={app.filename}
                    />
                )}

                {/* Hashes & File Integrity */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <FingerprintIcon className="size-4 text-primary" aria-hidden="true" />
                            File Integrity & Hashes
                        </CardTitle>
                        <CardDescription>
                            Cryptographic checksums for verifying file authenticity and conducting OSINT / threat analysis.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">SHA-256</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {app.sha256 || "—"}
                                </code>
                                {app.sha256 && <CopyButton value={app.sha256} label="Copy SHA-256" />}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">SHA-1</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {app.sha1 || "—"}
                                </code>
                                {app.sha1 && <CopyButton value={app.sha1} label="Copy SHA-1" />}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">MD5</span>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/50">
                                <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                                    {app.md5 || "—"}
                                </code>
                                {app.md5 && <CopyButton value={app.md5} label="Copy MD5" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Scan Findings */}
                <SecurityFindingsCard
                    findings={interestingFindings}
                    loading={reportsLoading}
                    currentAppId={appId}
                    defaultFirmwareId={firmwareId}
                    title="Security Scan Findings"
                    description="Key findings, secrets, and vulnerabilities detected for this application."
                />

                {/* Security Scan Reports */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <ShieldCheckIcon className="size-4 text-primary" aria-hidden="true" />
                                    Security Scan Reports
                                    <Badge variant="secondary" className="ml-2 font-mono text-xs">
                                        {reports.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Reports generated by static and dynamic security scanners for this app.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <StateHandlingScrollableDataTable
                            columns={reportColumns}
                            data={reports}
                            dataLoading={reportsLoading}
                            dataError={reportsError}
                        />
                    </CardContent>
                </Card>
            </div>
        </BasePage>
    );
}
