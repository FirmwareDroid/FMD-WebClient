import {BasePage} from "@/pages/base-page.tsx";
import {useParams} from "react-router";
import {useQuery} from "@apollo/client";
import {FIRMWARE_TABLE_ROW, GET_FIRMWARES_BY_OBJECT_IDS} from "@/components/graphql/firmware.graphql.ts";
import {FirmwareTableRowFragment} from "@/__generated__/graphql.ts";
import {useMemo} from "react";
import {nonNullable} from "@/lib/non-nullable.ts";
import {useFragment} from "@/__generated__";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";
import {AlertCircleIcon} from "lucide-react";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";

export function FirmwarePage() {
    const {firmwareId} = useParams<{ firmwareId: string }>();

    const {
        loading: firmwaresLoading,
        // error: firmwaresError,
        data: firmwaresData,
    } = useQuery(GET_FIRMWARES_BY_OBJECT_IDS, {
        variables: {objectIds: convertIdToObjectId(firmwareId as string)},
        skip: !firmwareId,
    });

    const firmwares: FirmwareTableRowFragment[] = useMemo(
        () =>
            ((firmwaresData?.android_firmware_list ?? [])
                    .filter(nonNullable)
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    .map((item) => useFragment(FIRMWARE_TABLE_ROW, item))
                    .filter(nonNullable)
            ),
        [firmwaresData]
    );

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

    if (firmwares.length === 1) {
        const firmware: FirmwareTableRowFragment = firmwares[0];

        return (
            <BasePage title="Firmware">
                <Table>
                    <TableBody>
                        {Object.entries(firmware).map(([key, value]) => (
                            <TableRow key={key}>
                                <TableCell className="font-medium">{key}</TableCell>
                                <TableCell className="text-muted-foreground whitespace-pre-wrap">
                                    {(() => {
                                        let displayValue = String(value);

                                        try {
                                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument
                                            const parsed = JSON.parse(value);
                                            displayValue = JSON.stringify(parsed, null, 2);
                                        } catch {
                                            // ignore, we leave it as string if parsing fails
                                        }

                                        return displayValue;
                                    })()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
