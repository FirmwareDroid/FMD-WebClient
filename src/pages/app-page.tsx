import {useNavigate, useParams} from "react-router";
import {BasePage} from "@/pages/base-page.tsx";
import {useQuery} from "@apollo/client";
import {isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {APP_ALL, GET_APP_BY_ID, SCAN_APKS_BY_OBJECT_IDS} from "@/components/graphql/app.graphql.ts";
import {useFragment} from "@/__generated__";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, FileIcon} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {AppAllFragment} from "@/__generated__/graphql.ts";
import {EntityTable} from "@/components/ui/entity-table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScanAppActionButton} from "@/components/ui/table/action-columns/action-buttons.tsx";

export function AppPage() {
    const {appId} = useParams<{ appId: string }>();
    const navigate = useNavigate();

    const {
        loading: appsLoading,
        data: appsData,
    } = useQuery(GET_APP_BY_ID, {
        variables: {id: appId as string},
        skip: !appId,
    });

    if (!appId) {
        return (
            <BasePage title={"App (missing ID)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing App ID.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (appsLoading) {
        return (
            <BasePage title="App">
                <Skeleton className="w-full h-[400px]"/>
            </BasePage>
        );
    }

    const apps = (appsData?.android_firmware_connection?.edges ?? [])
        .flatMap(firmwareEdge => (firmwareEdge?.node?.androidAppIdList?.edges ?? []))
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(APP_ALL, edge?.node))
        .filter(isNonNullish)

    if (apps.length === 1) {
        const app: AppAllFragment = apps[0];

        return (
            <BasePage title="App">
                <div className="w-full flex gap-4 flex-wrap">
                    <Button
                        hidden={!app.firmwareIdReference?.id || !app.firmwareFileReference?.id}
                        size="sm"
                        onClick={() => {
                            void navigate(`/firmwares/${app.firmwareIdReference?.id ?? ""}/files/${app.firmwareFileReference?.id ?? ""}`);
                        }}
                    >
                        <FileIcon/> File ({app.filename})
                    </Button>
                    <ScanAppActionButton
                        ids={[appId]}
                        tooltip={"Scan app"}
                        mutation={SCAN_APKS_BY_OBJECT_IDS}
                    />
                </div>
                <EntityTable entity={app}/>
            </BasePage>
        );
    }

    if (apps.length < 1) {
        return (
            <BasePage title={"App (no match)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Could not find an app with ID '{appId}'.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (apps.length > 1) {
        return (
            <BasePage title={"App (multiple matches)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Found multiple apps with ID '{appId}'.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }
}