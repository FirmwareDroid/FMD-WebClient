import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@/lib/apollo-hooks";
import { BasePage } from "@/pages/base-page.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
    AlertCircleIcon,
    ArrowLeftIcon,
    CalendarIcon,
    DownloadIcon,
    HardDriveIcon,
    KeyIcon,
    LayersIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
    SmartphoneIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { CopyButton } from "@/components/ui/copy-button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { formatDateTime } from "@/lib/date-utils.ts";
import { downloadJsonFile } from "@/lib/format-utils.ts";
import { parseReportResults } from "@/lib/report-utils.ts";
import { useSetBreadcrumbTitle } from "@/lib/breadcrumb-store.ts";
import { APPS_URL, FIRMWARE_URL } from "@/components/ui/sidebar/app-sidebar.tsx";
import {
    ANDROGUARD_REPORT,
    ANDROWARN_REPORT,
    APKID_REPORT,
    APKLEAKS_REPORT,
    APKSCAN_REPORT,
    EXODUS_REPORT,
    FLOWDROID_REPORT,
    GET_SCANNER_REPORT,
    MOBSFS_REPORT,
    QARK_REPORT,
    QUARK_ENGINE_REPORT,
    TRUESEEING_REPORT,
    TRUFFLEHOG_REPORT,
    VIRUSTOTAL_REPORT,
} from "@/components/graphql/report.graphql.ts";
import { useFragment as readFragment } from "@/__generated__";

// Scanner Visualizers
import { TruffleHogReportView } from "@/components/report/trufflehog-report-view.tsx";
import { ApkleaksReportView } from "@/components/report/apkleaks-report-view.tsx";
import { ApkidReportView } from "@/components/report/apkid-report-view.tsx";
import { ExodusReportView } from "@/components/report/exodus-report-view.tsx";
import { VulnerabilitiesReportView } from "@/components/report/vulnerabilities-report-view.tsx";
import { AndroGuardReportView } from "@/components/report/androguard-report-view.tsx";
import { AdaptiveGenericReportView } from "@/components/report/adaptive-generic-report-view.tsx";

interface GenericReportPageProps {
    reportId: string;
    scannerName: string;
    query?: any;
}

function resolveReportFragmentData(report: any): any {
    if (!report) return null;
    switch (report.__typename) {
        case "ApkidReport":
            return readFragment(APKID_REPORT, report);
        case "ApkleaksReport":
            return readFragment(APKLEAKS_REPORT, report);
        case "ExodusReport":
            return readFragment(EXODUS_REPORT, report);
        case "TrueseeingReport":
            return readFragment(TRUESEEING_REPORT, report);
        case "VirusTotalReport":
            return readFragment(VIRUSTOTAL_REPORT, report);
        case "APKscanReport":
            return readFragment(APKSCAN_REPORT, report);
        case "AndrowarnReport":
            return readFragment(ANDROWARN_REPORT, report);
        case "AndroGuardReport":
            return readFragment(ANDROGUARD_REPORT, report);
        case "MobSFScanReport":
            return readFragment(MOBSFS_REPORT, report);
        case "QarkReport":
            return readFragment(QARK_REPORT, report);
        case "QuarkEngineReport":
            return readFragment(QUARK_ENGINE_REPORT, report);
        case "FlowDroidReport":
            return readFragment(FLOWDROID_REPORT, report);
        case "TruffleHogReport":
            return readFragment(TRUFFLEHOG_REPORT, report);
        default:
            return null;
    }
}

export function GenericReportPage({
    reportId,
    scannerName,
}: GenericReportPageProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("findings");

    useSetBreadcrumbTitle(reportId, `${scannerName} Report`);

    const { data, loading, error } = useQuery(GET_SCANNER_REPORT, {
        variables: {
            reportObjectId: reportId,
        },
    });

    const report = data?.apk_scanner_report_list?.[0];
    const fragmentData = resolveReportFragmentData(report);
    const rawPayload = (fragmentData as any)?.results ?? fragmentData;
    const parsedResults = parseReportResults(rawPayload);

    if (loading) {
        return (
            <BasePage title={`${scannerName} Report`}>
                <div className="w-full max-w-5xl space-y-4">
                    <Skeleton className="w-full h-24 rounded-lg" />
                    <Skeleton className="w-full h-40 rounded-lg" />
                    <Skeleton className="w-full h-64 rounded-lg" />
                </div>
            </BasePage>
        );
    }

    if (error) {
        return (
            <BasePage title={`${scannerName} Report`}>
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon />
                    <AlertTitle>Error loading {scannerName} report.</AlertTitle>
                    <AlertDescription>
                        {error.message || "An unexpected error occurred while loading scan results."}
                    </AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    if (!report) {
        return (
            <BasePage title={`${scannerName} Report`}>
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon />
                    <AlertTitle>Report Not Found</AlertTitle>
                    <AlertDescription>
                        Could not find a security scan report with ID '{reportId}'.
                    </AlertDescription>
                </Alert>
            </BasePage>
        );
    }

    const appRef = report.androidAppIdReference;
    const appId = appRef?.id;
    const appFilename = appRef?.filename;
    const packagename = appRef?.packagename;
    const firmwareId = appRef?.firmwareIdReference?.id;
    const scanStatus = (report.scanStatus || "completed").toLowerCase();
    const isCompleted = scanStatus === "completed" || scanStatus === "finished" || scanStatus === "success";
    const isFailed = scanStatus === "failed" || scanStatus === "error" || parsedResults.isError;

    const handleBackToApp = () => {
        if (firmwareId && appId) {
            void navigate(`${FIRMWARE_URL}/${encodeURIComponent(firmwareId)}${APPS_URL}/${encodeURIComponent(appId)}`);
        } else {
            void navigate(-1);
        }
    };

    const handleDownloadReport = () => {
        const payload = {
            id: report.id,
            pk: report.pk,
            scannerName: report.scannerName || scannerName,
            scannerVersion: report.scannerVersion,
            scanStatus: report.scanStatus,
            reportDate: report.reportDate,
            application: {
                id: appId,
                filename: appFilename,
                packagename,
            },
            results: parsedResults.rawJson,
        };
        downloadJsonFile(
            `${scannerName.toLowerCase()}-report-${report.pk || reportId}.json`,
            payload
        );
    };

    const renderFindingsView = () => {
        const type = report.__typename;

        if (type === "TruffleHogReport") {
            return <TruffleHogReportView data={parsedResults.data} />;
        }

        if (type === "ApkleaksReport") {
            return <ApkleaksReportView data={parsedResults.data} />;
        }

        if (type === "ApkidReport") {
            return <ApkidReportView data={parsedResults.data} />;
        }

        if (type === "ExodusReport") {
            return <ExodusReportView data={parsedResults.data} />;
        }

        if (
            type === "MobSFScanReport" ||
            type === "SuperReport" ||
            type === "QuarkEngineReport" ||
            type === "TrueseeingReport" ||
            type === "FlowDroidReport" ||
            type === "AndrowarnReport"
        ) {
            return (
                <VulnerabilitiesReportView
                    data={parsedResults.data}
                    scannerName={report.scannerName || scannerName}
                />
            );
        }

        if (type === "AndroGuardReport") {
            return <AndroGuardReportView data={fragmentData as Record<string, any>} />;
        }

        return (
            <AdaptiveGenericReportView
                data={parsedResults.data}
                scannerName={report.scannerName || scannerName}
            />
        );
    };

    return (
        <BasePage title={`${report.scannerName || scannerName} Report`}>
            <div className="w-full max-w-5xl space-y-6">
                {/* Header Card & Actions */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <ShieldAlertIcon className="size-6" aria-hidden="true" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <CardTitle className="text-xl sm:text-2xl font-bold truncate">
                                            {report.scannerName || scannerName}
                                        </CardTitle>
                                        {report.scannerVersion && (
                                            <Badge variant="outline" className="font-mono text-xs text-muted-foreground border-border/80">
                                                {report.scannerVersion}
                                            </Badge>
                                        )}
                                        {report.pk && (
                                            <Badge variant="outline" className="font-mono text-xs gap-1.5 px-2 py-0.5 border-border/80 bg-muted/40">
                                                <KeyIcon className="size-3 text-primary" aria-hidden="true" />
                                                <span className="text-muted-foreground text-[11px]">ObjectId:</span>
                                                <span className="text-foreground font-semibold">{report.pk}</span>
                                                <CopyButton value={report.pk} label="Copy report ObjectId" />
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                        <span>Status:</span>
                                        {isCompleted ? (
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                                <ShieldCheckIcon className="size-3 mr-1" />
                                                {report.scanStatus || "Completed"}
                                            </Badge>
                                        ) : isFailed ? (
                                            <Badge variant="destructive" className="text-xs">
                                                {report.scanStatus || "Failed"}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">
                                                {report.scanStatus}
                                            </Badge>
                                        )}
                                        <span className="text-muted-foreground/60">•</span>
                                        <span title={report.reportDate ?? undefined}>
                                            {formatDateTime(report.reportDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBackToApp}
                                    title={appFilename ? `Back to ${appFilename}` : "Back to Application"}
                                >
                                    <ArrowLeftIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Back to App
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadReport}
                                    title="Export complete report as JSON"
                                >
                                    <DownloadIcon className="size-4 mr-1.5" aria-hidden="true" />
                                    Download JSON
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Scan Execution Failure Warning */}
                {isFailed && (
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>Scanner Reported Failure</AlertTitle>
                        <AlertDescription>
                            {parsedResults.errorMessage ||
                                "The scanner process terminated with an error or returned a non-zero exit status."}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Application & Scan Overview */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                            Target Application & Environment
                        </CardTitle>
                        <CardDescription>
                            Execution context and metadata for the analyzed package.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <SmartphoneIcon className="size-3.5 text-primary" aria-hidden="true" /> Target Application
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-foreground">
                                    {appFilename || "Unknown Package"}
                                </span>
                                {appId && firmwareId && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs text-primary"
                                        onClick={handleBackToApp}
                                    >
                                        (View App)
                                    </Button>
                                )}
                            </div>
                            {packagename && (
                                <p className="font-mono text-xs text-muted-foreground break-all">
                                    {packagename}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <CalendarIcon className="size-3.5" aria-hidden="true" /> Scan Execution Time
                            </span>
                            <div className="font-medium text-foreground">
                                <span title={report.reportDate ?? undefined}>
                                    {formatDateTime(report.reportDate)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Scanner Tool & Version
                            </span>
                            <div className="font-mono text-sm text-foreground">
                                {report.scannerName || scannerName}{" "}
                                <span className="text-muted-foreground">
                                    ({report.scannerVersion || "version unlisted"})
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <HardDriveIcon className="size-3.5" aria-hidden="true" /> Scan Status
                            </span>
                            <div>
                                {isCompleted ? (
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs">
                                        <ShieldCheckIcon className="size-3 mr-1" />
                                        Completed Successfully
                                    </Badge>
                                ) : isFailed ? (
                                    <Badge variant="destructive" className="text-xs">
                                        Scan Failed
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        {report.scanStatus}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs: Findings vs Raw JSON Inspector */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-muted/80 p-1 border border-border/50">
                        <TabsTrigger value="findings" className="gap-1.5">
                            <ShieldCheckIcon className="size-4 text-primary" />
                            Findings & Analysis
                        </TabsTrigger>
                        <TabsTrigger value="raw-json" className="gap-1.5">
                            <LayersIcon className="size-4" />
                            Raw JSON Payload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="findings" className="pt-2">
                        {renderFindingsView()}
                    </TabsContent>

                    <TabsContent value="raw-json" className="pt-2">
                        <Card className="border-border/60 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/40">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <LayersIcon className="size-4 text-primary" />
                                            Raw Scanner Payload
                                        </CardTitle>
                                        <CardDescription>
                                            Complete unmanipulated JSON object as stored in the database.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CopyButton
                                            value={JSON.stringify(parsedResults.rawJson, null, 2)}
                                            label="Copy raw JSON"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadReport}
                                        >
                                            <DownloadIcon className="size-4 mr-1.5" />
                                            Export JSON
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 dark:bg-zinc-900 font-mono text-xs overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre leading-relaxed select-all">
                                    {JSON.stringify(parsedResults.rawJson, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </BasePage>
    );
}
