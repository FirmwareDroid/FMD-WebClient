import { ColumnDef } from "@tanstack/react-table";
import { StateHandlingScrollableDataTable } from "@/components/ui/table/data-table.tsx";
import { buildSelectEntityColumn } from "@/components/data-table-action-columns/entity-action-columns.tsx";
import React, { useMemo, useState } from "react";
import { useQuery } from "@/lib/apollo-hooks";
import { GET_SCANNER_MODULE_NAMES } from "@/components/graphql/app.graphql.ts";
import { useScannerConfigStore } from "@/stores/scanner-config-store.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    AlertCircleIcon,
    CheckCircle2Icon,
    Settings2Icon,
} from "lucide-react";
import { ScannerConfigDialog } from "@/components/scanners/scanner-config-dialog.tsx";

export type Scanner = {
    id: string;
    requiresConfiguration?: boolean;
    isConfigured?: boolean;
    description?: string;
};

const SCANNER_DESCRIPTIONS: Record<string, string> = {
    MANIFEST: "Parses AndroidManifest.xml for permissions, activities, services, receivers, and SDK target",
    APKID: "Scans for compilers, obfuscators, packers, protectors, and anti-analysis mechanisms",
    EXODUS: "Extracts known tracking libraries and embedded user analytics frameworks",
    TRUFFLEHOG: "Scans decompiled resources and code for API keys, secret credentials, and tokens",
    APKLEAKS: "Extracts sensitive endpoints, regexes, secrets, and URLs from APK decompilation",
    MOBSF: "Runs Mobile Security Framework (MobSF) SAST rules against Android codebase",
    QUARKENGINE: "Analyzes APK behavioral call trees to detect malware signatures and security CWEs",
    SUPER: "Analyzes APK vulnerabilities against modern security hygiene baselines",
    TRUESEEING: "Fast vulnerability scanner performing data validation and security flaw checks",
    ANDROGUARD: "Decompiles DEX bytecode into control flow graphs, classes, methods, and strings",
    APKSCAN: "Performs full decompilation of APK assets and class files",
    VIRUSTOTAL: "Queries VirusTotal multi-engine AV scanners (requires valid API key)",
    FLOWDROID: "Performs taint tracking analysis on potential data leakage paths",
    ANDROWARN: "Identifies potentially harmful behaviors in Android bytecode",
    QARK: "Quick Android Review Kit (QARK) static code analysis",
};

type ScannersTableProps = {
    setSelectedScanners: React.Dispatch<React.SetStateAction<Scanner[]>>;
    onConfigureClick?: (scannerId: "VIRUSTOTAL" | "TRUFFLEHOG") => void;
};

export function ScannersTable({
    setSelectedScanners,
    onConfigureClick,
}: Readonly<ScannersTableProps>) {
    const { data } = useQuery(GET_SCANNER_MODULE_NAMES);
    const { isScannerConfigured, scannerRequiresConfiguration } = useScannerConfigStore();
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [configTargetScanner, setConfigTargetScanner] = useState<"VIRUSTOTAL" | "TRUFFLEHOG">("VIRUSTOTAL");

    const handleOpenConfigure = (scannerId: "VIRUSTOTAL" | "TRUFFLEHOG") => {
        if (onConfigureClick) {
            onConfigureClick(scannerId);
        } else {
            setConfigTargetScanner(scannerId);
            setConfigDialogOpen(true);
        }
    };

    const columns: ColumnDef<Scanner>[] = useMemo(() => [
        buildSelectEntityColumn<Scanner>(),
        {
            id: "id",
            accessorKey: "id",
            header: "Module",
            enableHiding: false,
            cell: ({ row }) => {
                const scanner = row.original;
                return (
                    <div className="flex flex-col gap-0.5 py-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground font-mono">
                                {scanner.id}
                            </span>
                            {scanner.requiresConfiguration && !scanner.isConfigured && (
                                <Badge
                                    variant="destructive"
                                    className="text-[10px] py-0 h-4 px-1.5 flex items-center gap-1 font-normal"
                                >
                                    <AlertCircleIcon className="size-2.5" />
                                    Config Required
                                </Badge>
                            )}
                            {scanner.requiresConfiguration && scanner.isConfigured && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] py-0 h-4 px-1.5 flex items-center gap-1 font-normal text-emerald-400 border-emerald-500/30"
                                >
                                    <CheckCircle2Icon className="size-2.5" />
                                    Ready
                                </Badge>
                            )}
                        </div>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                            {scanner.description}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Settings",
            enableHiding: false,
            cell: ({ row }) => {
                const scanner = row.original;
                if (scanner.id === "VIRUSTOTAL" || scanner.id === "TRUFFLEHOG") {
                    const isVt = scanner.id === "VIRUSTOTAL";
                    const needsAttention = isVt && !scanner.isConfigured;

                    return (
                        <div className="flex items-center justify-end pr-2">
                            <Button
                                type="button"
                                variant={needsAttention ? "destructive" : "ghost"}
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConfigure(scanner.id as "VIRUSTOTAL" | "TRUFFLEHOG");
                                }}
                                className="h-7 text-xs px-2 gap-1.5"
                            >
                                {needsAttention ? (
                                    <>
                                        <AlertCircleIcon className="size-3" />
                                        Configure Key
                                    </>
                                ) : (
                                    <>
                                        <Settings2Icon className="size-3 text-muted-foreground" />
                                        Options
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                }
                return null;
            },
        },
    ], [isScannerConfigured, scannerRequiresConfiguration, onConfigureClick]);

    const scanners: Scanner[] = useMemo(() => {
        const rawList = (
            data?.scanner_module_name_list?.filter((moduleName: any): moduleName is string => moduleName != null) ?? []
        );

        return rawList.map((moduleName: string) => {
            const reqConfig = scannerRequiresConfiguration(moduleName);
            const configured = isScannerConfigured(moduleName);
            return {
                id: moduleName,
                requiresConfiguration: reqConfig,
                isConfigured: configured,
                description: SCANNER_DESCRIPTIONS[moduleName] || "Static analysis scanner module",
            };
        });
    }, [data, scannerRequiresConfiguration, isScannerConfigured]);

    return (
        <>
            <StateHandlingScrollableDataTable
                columns={columns}
                data={scanners}
                getRowId={(row) => row.id}
                showExport={false}
                onRowSelectionChange={(selectedRows: Scanner[]) => {
                    setSelectedScanners(selectedRows);
                }}
                dataTablePagination={false}
            />

            <ScannerConfigDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                initialScanner={configTargetScanner}
            />
        </>
    );
}
