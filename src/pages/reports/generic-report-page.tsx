import { useQuery } from "@/lib/apollo-hooks";
import { BasePage } from "@/pages/base-page.tsx";
import { Alert, AlertTitle } from "@/components/ui/alert.tsx";
import { AlertCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { EntityTable } from "@/components/entity-table.tsx";
import {
    ANDROGUARD_REPORT,
    ANDROWARN_REPORT,
    APKID_REPORT,
    APKLEAKS_REPORT, APKSCAN_REPORT,
    EXODUS_REPORT, FLOWDROID_REPORT,
    GET_SCANNER_REPORT, MOBSFS_REPORT, QARK_REPORT, QUARK_ENGINE_REPORT,
    TRUESEEING_REPORT, VIRUSTOTAL_REPORT
} from "@/components/graphql/report.graphql.ts";
import {useFragment as readFragment} from "@/__generated__";

type GenericReportPageProps = {
    reportId: string;
    scannerName: string;
    query?: any;
};

export function GenericReportPage({
                                      reportId,
                                      scannerName,
                                  }: GenericReportPageProps) {

    const pageTitle = scannerName;

    const { data, loading, error } = useQuery(GET_SCANNER_REPORT, {
        variables: {
            reportObjectId: reportId,
        },
    });

    if (loading) {
        return (
            <BasePage title={pageTitle}>
                <Skeleton className="w-full h-[400px]" />
            </BasePage>
        );
    }

    if (error) {
        return (
            <BasePage title={pageTitle}>
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Error loading {pageTitle}.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    const report = data?.apk_scanner_report_list?.[0];

    if (report) {
        let fragmentData;
        switch (report.__typename){
            case "ApkidReport":
                fragmentData = readFragment(APKID_REPORT, report)
                break;
            case "ApkleaksReport":
                fragmentData = readFragment(APKLEAKS_REPORT, report)
                break;
            case "ExodusReport":
                fragmentData = readFragment(EXODUS_REPORT, report)
                break;
            case "TrueseeingReport":
                fragmentData = readFragment(TRUESEEING_REPORT, report)
                break;
            case "VirusTotalReport":
                fragmentData = readFragment(VIRUSTOTAL_REPORT, report)
                break;
            case "APKscanReport":
                fragmentData = readFragment(APKSCAN_REPORT, report)
                break;
            case "AndrowarnReport":
                fragmentData = readFragment(ANDROWARN_REPORT, report)
                break;
            case "AndroGuardReport":
                fragmentData = readFragment(ANDROGUARD_REPORT, report)
                break;
            case "MobSFScanReport":
                fragmentData = readFragment(MOBSFS_REPORT, report)
                break;
            case "QarkReport":
                fragmentData = readFragment(QARK_REPORT, report)
                break;
            case "QuarkEngineReport":
                fragmentData = readFragment(QUARK_ENGINE_REPORT, report)
                break;
            case "FlowDroidReport":
                fragmentData = readFragment(FLOWDROID_REPORT, report)
                break;
            default:
                return (
                    <BasePage title={pageTitle}>
                        <div>Report type unknown.</div>
                    </BasePage>
                );
        }
        return (
            <BasePage title={pageTitle}>
                <EntityTable entity={fragmentData}/>
            </BasePage>
        );
    }
    return (
        <BasePage title={pageTitle}>
            <div>No report data available.</div>
        </BasePage>
    );
}
