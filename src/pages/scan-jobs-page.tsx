import { BasePage } from "@/pages/base-page.tsx";
import { RqJobsTable } from "@/components/rq-jobs-table.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
    ActivityIcon,
    AlertCircleIcon,
    ArrowLeftIcon,
    FileTextIcon,
    ExternalLinkIcon,
    TerminalIcon,
    SparklesIcon,
    LayersIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { APPS_URL, FIRMWARE_URL, REPORTS_URL } from "@/components/ui/sidebar/app-sidebar.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { ApkScannerLogView } from "@/components/apk-scanner-log-view/apk-scanner-log-view.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { HardDriveDownloadIcon } from "lucide-react";

export interface ScanJobsLocationState {
    returnUrl?: string;
    returnTitle?: string;
    targetName?: string;
    scannedCount?: number;
}

export function ScanJobsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = (location.state as ScanJobsLocationState | null) ?? null;

    const returnUrl = state?.returnUrl;
    const returnTitle = state?.returnTitle || (returnUrl ? "Previous Page" : undefined);
    const targetName = state?.targetName;
    const scannedCount = state?.scannedCount;

    // Determine if the returnUrl was an app detail page or reports page
    const isAppReturn = returnUrl?.includes("/apps/");
    const reportsUrl = isAppReturn && returnUrl
        ? (returnUrl.includes("/reports") ? returnUrl : `${returnUrl}${REPORTS_URL}`)
        : undefined;

    return (
        <BasePage title="Recent App Scan Jobs">
            <div className="w-full max-w-7xl flex flex-col gap-6">
                {/* Contextual Return Banner when arriving from a Scan Action */}
                {returnUrl && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                                <SparklesIcon className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Scan Queued Successfully
                                    </h2>
                                    {scannedCount !== undefined && (
                                        <Badge variant="outline" className="text-xs bg-background/50 font-medium">
                                            {scannedCount} Scanner{scannedCount === 1 ? "" : "s"}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {targetName ? (
                                        <>
                                            Target: <span className="font-medium text-foreground font-mono">{targetName}</span>. You can inspect live logs below or navigate back.
                                        </>
                                    ) : (
                                        "Scans are executing in the background. You can inspect live logs below or return."
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(returnUrl)}
                                className="h-8 gap-1.5 text-xs shadow-xs"
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                <span>Back to {returnTitle ?? "App"}</span>
                            </Button>
                            {reportsUrl && reportsUrl !== returnUrl && (
                                <Button
                                    size="sm"
                                    onClick={() => navigate(reportsUrl)}
                                    className="h-8 gap-1.5 text-xs shadow-xs"
                                >
                                    <FileTextIcon className="size-3.5" />
                                    <span>View Reports</span>
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Hero / Overview Card */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <ActivityIcon className="size-4 text-primary" aria-hidden="true" />
                                    <span>Scanner Pipeline Monitoring</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Real-time execution telemetry and Redis Queue (RQ) tasks for static and external security analyzers.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                    <a href="/django-rq" target="_blank" rel="noopener noreferrer">
                                        <ExternalLinkIcon className="size-3.5" />
                                        <span>RQ Backend</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-xs text-muted-foreground space-y-2">
                        <p>
                            This dashboard displays active and completed scanner jobs enqueued via FMD worker queues.
                            Scan results are automatically parsed, indexed, and made available under each application&apos;s
                            {" "}
                            <Link className="ui-link font-medium" to={REPORTS_URL}>Scan Reports</Link>
                            {" "}
                            view.
                        </p>
                    </CardContent>
                </Card>

                {/* Live Console Logs Viewer */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <TerminalIcon className="size-4 text-primary" aria-hidden="true" />
                                <span>Live Scanner Console Logs</span>
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px] uppercase font-mono tracking-wider">
                                Live Stream
                            </Badge>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground">
                            Standard output and diagnostics streamed directly from running analyzer containers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-b-xl overflow-hidden border-t border-border/30">
                            <ApkScannerLogView />
                        </div>
                    </CardContent>
                </Card>

                {/* RQ Jobs Table Card */}
                <Card className="border-border/60 shadow-xs">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <LayersIcon className="size-4 text-primary" aria-hidden="true" />
                                <span>Background Worker Tasks</span>
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground">
                            Queued, in-progress, finished, and failed worker tasks across scanner and extractor queues.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Tabs defaultValue="all" className="space-y-4">
                            <TabsList className="bg-muted/50 p-1">
                                <TabsTrigger value="all" className="text-xs gap-1.5">
                                    <LayersIcon className="size-3.5" />
                                    <span>All Tasks</span>
                                </TabsTrigger>
                                <TabsTrigger value="scanner" className="text-xs gap-1.5">
                                    <ActivityIcon className="size-3.5" />
                                    <span>Scanner Queue</span>
                                </TabsTrigger>
                                <TabsTrigger value="extractor" className="text-xs gap-1.5">
                                    <HardDriveDownloadIcon className="size-3.5" />
                                    <span>Extractor Queue</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="m-0">
                                <RqJobsTable funcNames={["start_scan", "start_file_export_by_regex"]} />
                            </TabsContent>
                            <TabsContent value="scanner" className="m-0">
                                <RqJobsTable queueName="scanner" funcNames={["start_scan"]} />
                            </TabsContent>
                            <TabsContent value="extractor" className="m-0">
                                <RqJobsTable queueName="extractor" funcNames={["start_file_export_by_regex"]} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Navigation Guide Callout */}
                <Alert className="border-border/60 bg-muted/30">
                    <AlertCircleIcon className="size-4 text-primary" />
                    <AlertTitle className="text-xs font-medium text-foreground">
                        Ready to analyze more binaries?
                    </AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>You can launch analysis jobs from the</span>
                        <Link to={FIRMWARE_URL} className="ui-link font-medium">Firmware</Link>
                        <span>or</span>
                        <Link to={APPS_URL} className="ui-link font-medium">Apps</Link>
                        <span>pages.</span>
                    </AlertDescription>
                </Alert>
            </div>
        </BasePage>
    );
}
