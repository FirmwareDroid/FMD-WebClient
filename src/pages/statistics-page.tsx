import {BasePage} from "@/pages/base-page.tsx";
import {useQuery} from "@/lib/apollo-hooks.ts";
import {
    GET_FIRMWARE_ID_LIST,
    GET_APP_ID_LIST,
    GET_STATISTICS_REPORT_LIST,
    GET_APKLEAKS_STATISTICS,
    GET_EXODUS_STATISTICS,
} from "@/components/graphql/statistics.graphql.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {CpuIcon, SquareIcon, BookOpenIcon, BarChart2Icon, CalendarIcon} from "lucide-react";

// ----------------------------------------------------------------------------------------------------
// Stat card component
// ----------------------------------------------------------------------------------------------------

type StatCardProps = {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    loading?: boolean;
    description?: string;
};

function StatCard({title, value, icon, loading, description}: Readonly<StatCardProps>) {
    return (
        <Card className="flex-1 min-w-[160px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <span className="text-muted-foreground">{icon}</span>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-20"/>
                ) : (
                    <div className="text-3xl font-bold">{value}</div>
                )}
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

// ----------------------------------------------------------------------------------------------------
// Scanner coverage row
// ----------------------------------------------------------------------------------------------------

type ScannerCoverageRowProps = {
    name: string;
    appCount: number;
    reportCount: number;
    totalApps: number;
    date: string;
    badge?: string;
};

function ScannerCoverageRow({name, appCount, reportCount, totalApps, date, badge}: Readonly<ScannerCoverageRowProps>) {
    const coverage = totalApps > 0 ? Math.round((appCount / totalApps) * 100) : 0;
    const formattedDate = new Date(date as string).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="flex flex-col gap-1 py-3 border-b last:border-b-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{name}</span>
                    {badge && <Badge variant="secondary">{badge}</Badge>}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3"/>
                        {formattedDate}
                    </span>
                    <span>{appCount.toLocaleString()} apps · {reportCount.toLocaleString()} reports</span>
                    <span className="font-semibold text-foreground">{coverage}%</span>
                </div>
            </div>
            <Progress value={coverage} className="h-1.5"/>
        </div>
    );
}

// ----------------------------------------------------------------------------------------------------
// Main Statistics Page
// ----------------------------------------------------------------------------------------------------

export function StatisticsPage() {
    const {data: firmwareIdData, loading: firmwareLoading} = useQuery(GET_FIRMWARE_ID_LIST);
    const {data: appIdData, loading: appLoading} = useQuery(GET_APP_ID_LIST);
    const {data: statsData, loading: statsLoading} = useQuery(GET_STATISTICS_REPORT_LIST);
    const {data: apkleaksData, loading: apkleaksLoading} = useQuery(GET_APKLEAKS_STATISTICS);
    const {data: exodusData, loading: exodusLoading} = useQuery(GET_EXODUS_STATISTICS);

    const firmwareCount: number = (firmwareIdData?.android_firmware_id_list ?? []).length;
    const appCount: number = (appIdData?.android_app_id_list ?? []).length;

    const statisticsReports: Array<{
        id?: string | null;
        reportName: string;
        reportDate: string;
        androidAppCount: number;
        reportCount: number;
    }> = statsData?.statistics_report_list ?? [];

    const apkleaksReports: Array<{
        id?: string | null;
        reportName: string;
        reportDate: string;
        androidAppCount: number;
        reportCount: number;
        leaksCountDict?: string | null;
    }> = apkleaksData?.apkleaks_statistics_report_list ?? [];

    const exodusReports: Array<{
        id?: string | null;
        reportName: string;
        reportDate: string;
        androidAppCount: number;
        reportCount: number;
        trackerCountDict?: string | null;
    }> = exodusData?.exodus_statistics_report_list ?? [];

    const totalReports = statisticsReports.reduce((sum, r) => sum + r.reportCount, 0);

    const scannerCoverageLoading = statsLoading || apkleaksLoading || exodusLoading;

    const allScannerRows = [
        ...statisticsReports.map(r => ({
            key: `stats-${r.id ?? r.reportName}`,
            name: r.reportName,
            appCount: r.androidAppCount,
            reportCount: r.reportCount,
            date: r.reportDate,
            badge: undefined as string | undefined,
        })),
        ...apkleaksReports.map(r => ({
            key: `apkleaks-${r.id ?? r.reportName}`,
            name: r.reportName,
            appCount: r.androidAppCount,
            reportCount: r.reportCount,
            date: r.reportDate,
            badge: "APKLeaks",
        })),
        ...exodusReports.map(r => ({
            key: `exodus-${r.id ?? r.reportName}`,
            name: r.reportName,
            appCount: r.androidAppCount,
            reportCount: r.reportCount,
            date: r.reportDate,
            badge: "Exodus",
        })),
    ];

    return (
        <BasePage title="Statistics">
            <Card className="w-full max-w-5xl">
                <CardContent>
                    <p className="text-body">
                        Overview of all data indexed in FirmwareDroid. Counts are derived from the live API and
                        scanner statistics are generated by the FirmwareDroid analysis engine after scan jobs complete.
                    </p>
                </CardContent>
            </Card>

            {/* Summary Stat Cards */}
            <div className="w-full max-w-5xl flex flex-wrap gap-4">
                <StatCard
                    title="Firmware Images"
                    value={firmwareCount.toLocaleString()}
                    icon={<CpuIcon className="w-4 h-4"/>}
                    loading={firmwareLoading}
                    description="Total imported firmware"
                />
                <StatCard
                    title="Android Apps"
                    value={appCount.toLocaleString()}
                    icon={<SquareIcon className="w-4 h-4"/>}
                    loading={appLoading}
                    description="Total extracted APKs"
                />
                <StatCard
                    title="Scan Reports"
                    value={totalReports.toLocaleString()}
                    icon={<BookOpenIcon className="w-4 h-4"/>}
                    loading={statsLoading}
                    description="Across all scanner modules"
                />
                <StatCard
                    title="Scanner Modules"
                    value={allScannerRows.length.toLocaleString()}
                    icon={<BarChart2Icon className="w-4 h-4"/>}
                    loading={scannerCoverageLoading}
                    description="Statistics available"
                />
            </div>

            {/* Scanner Coverage */}
            <Card className="w-full max-w-5xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2Icon className="w-5 h-5"/>
                        Scanner Coverage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {scannerCoverageLoading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-10 w-full"/>
                            ))}
                        </div>
                    ) : allScannerRows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No scanner statistics available yet. Run scan jobs to generate statistics.
                        </p>
                    ) : (
                        <div>
                            <p className="text-xs text-muted-foreground mb-3">
                                Coverage shows the percentage of extracted apps ({appCount.toLocaleString()} total) that
                                have been analysed by each scanner module.
                            </p>
                            {allScannerRows.map(row => (
                                <ScannerCoverageRow
                                    key={row.key}
                                    name={row.name}
                                    appCount={row.appCount}
                                    reportCount={row.reportCount}
                                    totalApps={appCount}
                                    date={row.date}
                                    badge={row.badge}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </BasePage>
    );
}
