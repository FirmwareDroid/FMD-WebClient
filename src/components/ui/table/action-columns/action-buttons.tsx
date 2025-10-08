import {TypedDocumentNode} from "@graphql-typed-document-node/core";
import {
    Exact,
    Scalars,
    ScanApksByFirmwareObjectIdsMutation,
    ScanApksByObjectIdsMutation
} from "@/__generated__/graphql.ts";
import {useState} from "react";
import {Scanner, ScannersTable} from "@/components/ui/scanners-table.tsx";
import {useMutation} from "@apollo/client";
import {useNavigate} from "react-router";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {ScanSearchIcon} from "lucide-react";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {convertIdToObjectId} from "@/lib/graphql/graphql-utils.ts";
import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils.ts";

function ActionButton(
    {
        className,
        variant,
        asChild = false,
        ...props
    }: React.ComponentProps<"button"> &
        VariantProps<typeof buttonVariants> & {
        asChild?: boolean
    }) {
    return (
        <Button
            className={cn(className, "p-0 has-[>svg]:p-0 w-9")}
            variant={variant}
            asChild={asChild}
            {...props}
        ></Button>
    );
}

function ScanAppActionButton(
    {
        ids,
        tooltip,
        mutation,
    }: Readonly<{
        ids: string[];
        tooltip: string;
        mutation: TypedDocumentNode<ScanApksByObjectIdsMutation | ScanApksByFirmwareObjectIdsMutation, Exact<{
            objectIds: Array<Scalars["String"]["input"]> | Scalars["String"]["input"]
            scannerName: Scalars["String"]["input"]
        }>>;
    }>
) {
    const [selectedScanners, setSelectedScanners] = useState<Scanner[]>([]);
    const [scanApk] = useMutation(mutation);
    const navigate = useNavigate();

    return (
        <Dialog modal={true}>
            <DialogTrigger>
                <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                        <ActionButton variant="outline" disabled={ids.length <= 0}>
                            <ScanSearchIcon className="size-5"/>
                        </ActionButton>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Select Scanner(s)</DialogTitle>
                </DialogHeader>
                <ScannersTable setSelectedScanners={setSelectedScanners}/>
                <DialogFooter>
                    <Button
                        disabled={selectedScanners.length <= 0}
                        onClick={() => {
                            selectedScanners.forEach((scanner) => void scanApk({
                                variables: {
                                    objectIds: ids.map(id => convertIdToObjectId(id)),
                                    scannerName: scanner.id,
                                }
                            }));
                            void navigate("/scanner");
                        }}>Start Scan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export {
    ActionButton,
    ScanAppActionButton,
}
