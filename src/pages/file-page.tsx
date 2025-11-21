import {BasePage} from "@/pages/base-page.tsx";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "@apollo/client";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, FileIcon} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {useFragment} from "@/__generated__";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {FileAllFragment} from "@/__generated__/graphql.ts";
import {EntityTable} from "@/components/entity-table.tsx";
import {FILE_ALL, GET_FILE_BY_ID} from "@/components/graphql/file.graphql.ts";
import {Button} from "@/components/ui/button.tsx";
import {APPS_URL, FIRMWARE_URL} from "@/components/ui/sidebar/app-sidebar.tsx";

export function FilePage() {
    const {fileId} = useParams<{ fileId: string }>();
    const navigate = useNavigate();

    const {
        loading: filesLoading,
        data: filesData,
    } = useQuery(GET_FILE_BY_ID, {
        variables: {id: fileId as string},
        skip: !fileId,
    });

    if (!fileId) {
        return (
            <BasePage title={"File (missing ID)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing File ID.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (filesLoading) {
        return (
            <BasePage title="File">
                <Skeleton className="w-full h-[400px]"/>
            </BasePage>
        );
    }

    const files = (filesData?.android_firmware_connection?.edges ?? [])
        .flatMap(firmwareEdge => (firmwareEdge?.node?.firmwareFileIdList?.edges ?? []))
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(FILE_ALL, edge?.node))
        .filter(isNonNullish)

    if (files.length === 1) {
        const file: FileAllFragment = files[0];

        return (
            <BasePage title={`File (${file.name})`}>
                <div className="w-full flex gap-4 flex-wrap">
                    <Button
                        hidden={!file.firmwareIdReference?.id || !file.androidAppReference?.id}
                        size="sm"
                        onClick={() => {
                            void navigate(`${FIRMWARE_URL}/${file.firmwareIdReference?.id ?? ""}${APPS_URL}/${file.androidAppReference?.id ?? ""}`);
                        }}
                    >
                        <FileIcon/> App
                    </Button>
                </div>
                <EntityTable entity={file}/>
            </BasePage>
        );
    }

    if (files.length < 1) {
        return (
            <BasePage title={"File (no match)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Could not find an file with ID '{fileId}'.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (files.length > 1) {
        return (
            <BasePage title={"File (multiple matches)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Found multiple files with ID '{fileId}'.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }
}