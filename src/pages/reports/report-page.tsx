import {BasePage} from "@/pages/base-page.tsx";
import {useParams} from "react-router";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {GenericReportPage} from "@/pages/reports/generic-report-page.tsx";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";


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

    const separatorIndex = scannerNameAndReportId.lastIndexOf("-");
    const scannerName = scannerNameAndReportId.slice(0, separatorIndex);
    const reportId = scannerNameAndReportId.slice(separatorIndex + 1);
    const objectId = convertIdToObjectId(reportId);

    if (separatorIndex <= 0 || !/^[a-zA-Z0-9_.-]{1,100}$/.test(scannerName) || !objectId) {
        return (
            <BasePage title="Invalid report">
                <Alert variant="destructive" role="alert">
                    <AlertCircleIcon/>
                    <AlertTitle>The requested report identifier is invalid.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    return (
        <GenericReportPage reportId={objectId} scannerName={scannerName}/>
    );
}

export function ReportLoadingPage() {
    return (
        <BasePage title="Report loading...">
            <Skeleton className="w-full h-[400px]"/>
        </BasePage>
    );
}
