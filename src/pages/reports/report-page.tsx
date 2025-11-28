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

    const [scannerName, reportId] = scannerNameAndReportId.split("-");


    const objectId = convertIdToObjectId(reportId);

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