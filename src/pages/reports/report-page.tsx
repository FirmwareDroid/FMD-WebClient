import {BasePage} from "@/pages/base-page.tsx";
import {useParams} from "react-router";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {ApkidReportPage} from "@/pages/reports/apkid-report-page.tsx";
import {AndroGuardReportPage} from "@/pages/reports/andro-guard-report-page.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {ExodusReportPage} from "@/pages/reports/exodus-report-page.tsx";
import {ApkleaksReportPage} from "@/pages/reports/apkleaks-report.tsx";
import {TrueseeingReportPage} from "@/pages/reports/trueseeing-report-page.tsx";
import {AndrowarnReportPage} from "@/pages/reports/androwarn-report-page.tsx";
import {APKScanReportPage} from "@/pages/reports/apkscan-report-page.tsx";
import {FlowdroidReportPage} from "@/pages/reports/flowdroid-report-page.tsx";
import {MobSFSReportPage} from "@/pages/reports/mobsfs-report-page.tsx";
import {QarkReportPage} from "@/pages/reports/qark-report-page.tsx";
import {QuarkEngineReportPage} from "@/pages/reports/quark-engine-report-page.tsx";
import {SuperReportPage} from "@/pages/reports/super-report-page.tsx";
import {VirusTotalReportPage} from "@/pages/reports/virustotal-report-page.tsx";

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
        case "Trueseeing":
            return (
                <TrueseeingReportPage reportId={reportId}/>
            );
        case "Androwarn":
            return (
                <AndrowarnReportPage reportId={reportId}/>
            );
        case "APKscan":
            return (
                <APKScanReportPage reportId={reportId}/>
            );
        case "FlowDroid":
            return (
                <FlowdroidReportPage reportId={reportId}/>
            );
        case "MobSFScan":
            return (
                <MobSFSReportPage reportId={reportId}/>
            );
        case "Qark":
            return (
                <QarkReportPage reportId={reportId}/>
            );
        case "QuarkEngine":
            return (
                <QuarkEngineReportPage reportId={reportId}/>
            );
        case "Super":
            return (
                <SuperReportPage reportId={reportId}/>
            );
        case "VirusTotal":
            return (
                <VirusTotalReportPage reportId={reportId}/>
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