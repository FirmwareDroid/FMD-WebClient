import {BasePage} from "@/pages/base-page.tsx";
import {useNavigate, useParams} from "react-router";
import {useQuery} from "@apollo/client";
import {
    FIRMWARE_ALL,
    GET_FIRMWARES_BY_OBJECT_IDS,
    SCAN_APKS_BY_FIRMWARE_OBJECT_IDS
} from "@/components/graphql/firmware.graphql.ts";
import {FirmwareAllFragment} from "@/__generated__/graphql.ts";
import {useFragment} from "@/__generated__";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon, FilesIcon, SquareIcon} from "lucide-react";
import {convertIdToObjectId, isNonNullish} from "@/lib/graphql/graphql-utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {EntityTable} from "@/components/entity-table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ScanAppActionButton} from "@/components/data-table-action-columns/action-buttons.tsx";
import {APPS_URL, FILES_URL, FIRMWARES_URL} from "@/components/ui/sidebar/app-sidebar.tsx";

export function FirmwarePage() {
    const {firmwareId} = useParams<{ firmwareId: string }>();
    const navigate = useNavigate();

    const {
        loading: firmwaresLoading,
        data: firmwaresData,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        variables: {objectIds: convertIdToObjectId(firmwareId as string)},
        skip: !firmwareId,
    });

    if (!firmwareId) {
        return (
            <BasePage title={"Firmware (missing ID)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Missing firmware ID.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (firmwaresLoading) {
        return (
            <BasePage title="Firmware">
                <Skeleton className="w-full h-[400px]"/>
            </BasePage>
        );
    }

    const firmwares = (firmwaresData?.android_firmware_connection?.edges ?? [])
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .map(edge => useFragment(FIRMWARE_ALL, edge?.node))
        .filter(isNonNullish)

    if (firmwares.length === 1) {
        const firmware: FirmwareAllFragment = firmwares[0];

        return (
            <BasePage title="Firmware">
                <div className="w-full flex gap-4 flex-wrap">
                    <Button
                        size="sm"
                        onClick={() => {
                            void navigate(`${FIRMWARES_URL}/${firmwareId}${APPS_URL}`);
                        }}
                    >
                        <SquareIcon/> Apps
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            void navigate(`${FIRMWARES_URL}/${firmwareId}${FILES_URL}`);
                        }}
                    >
                        <FilesIcon/> Files
                    </Button>
                    <ScanAppActionButton
                        ids={[firmwareId]}
                        tooltip={"Scan all apps of this firmware"}
                        mutation={SCAN_APKS_BY_FIRMWARE_OBJECT_IDS}
                    />
                </div>
                <EntityTable entity={firmware}/>
            </BasePage>
        );
    }

    if (firmwares.length > 1) {
        return (
            <BasePage title={"Firmware (multiple matches)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Found multiple firmwares with the same ID.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }

    if (firmwares.length < 1) {
        return (
            <BasePage title={"Firmware (no match)"}>
                <Alert variant="destructive">
                    <AlertCircleIcon/>
                    <AlertTitle>Could not find a firmware with ID '{firmwareId}'.</AlertTitle>
                </Alert>
            </BasePage>
        );
    }
}
