import {BasePage} from "@/pages/base-page.tsx";
import {useParams} from "react-router";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {ApkidReportPage} from "@/pages/reports/apkid-report-page.tsx";
import {AndroGuardReportPage} from "@/pages/reports/andro-guard-report-page.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ExodusReportPage} from "@/pages/reports/exodus-report-page.tsx";
import {ApkleaksReportPage} from "@/pages/reports/apkleaks-report.tsx";

export type ImplReportPageProps = {
    reportId: string;
}

function SpecificReportPage(
    {
        scannerName,
        reportId,
    }: Readonly<{
        scannerName: string;
        reportId: string;
    }>) {
    switch (scannerName) {
        case "AndroGuard":
            return (
                <AndroGuardReportPage reportId={reportId}/>
            );
        case "APKiD":
            return (
                <ApkidReportPage reportId={reportId}/>
            );
        case "APKLeaks":
            return (
                <ApkleaksReportPage reportId={reportId}/>
            );
        case "Exodus":
            return (
                <ExodusReportPage reportId={reportId}/>
            );
        default:
            return (
                <BasePage title="Unknown Report Type">
                    <Alert variant="destructive">
                        <AlertCircleIcon/>
                        <AlertTitle>Scanner/Report type '{scannerName}' is unknown or has not been implemented by the
                            FMD web frontend.</AlertTitle>
                    </Alert>
                </BasePage>
            );
    }
}

export function ReportPage() {
    const {scannerNameAndReportId} = useParams<{ scannerNameAndReportId: string; }>();

    if (!scannerNameAndReportId) {
        return (
            <BasePage title={"Unexpected Error"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Failed to identify the requested report.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    const [scannerName, reportId] = scannerNameAndReportId.split("-");

    return (
        <SpecificReportPage scannerName={scannerName} reportId={reportId}/>
    );
}

export function ReportLoadingPage() {
    return (
        <BasePage title="Report loading...">
            <Skeleton className="w-full h-[400px]"/>
        </BasePage>
    );
}