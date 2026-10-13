import { useMemo } from "react";
import { extractApkidFindings } from "@/lib/report-utils.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    BinaryIcon,
    CheckCircle2Icon,
    FileCodeIcon,
    LockIcon,
    ShieldAlertIcon,
    ShieldCheckIcon,
} from "lucide-react";

interface ApkidReportViewProps {
    data: Record<string, any>;
}

export function ApkidReportView({ data }: ApkidReportViewProps) {
    const files = useMemo(() => extractApkidFindings(data), [data]);

    const apkidVersion = data?.apkid_version ? String(data.apkid_version) : null;
    const rulesSha256 = data?.rules_sha256 ? String(data.rules_sha256) : null;

    const stats = useMemo(() => {
        let totalCompilers = 0;
        let totalPackers = 0;
        let totalObfuscators = 0;
        let totalAntiAnalysis = 0;

        for (const file of files) {
            totalCompilers += file.compilers.length;
            totalPackers += file.packers.length;
            totalObfuscators += file.obfuscators.length;
            totalAntiAnalysis +=
                file.antiDebug.length +
                file.antiVm.length +
                file.antiDisassembly.length;
        }

        return {
            totalCompilers,
            totalPackers,
            totalObfuscators,
            totalAntiAnalysis,
        };
    }, [files]);

    return (
        <div className="space-y-6">
            {/* Metadata bar if available */}
            {(apkidVersion || rulesSha256) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground bg-muted/40 border border-border/60 rounded-lg px-3.5 py-2.5">
                    {apkidVersion && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">APKiD Version:</span>
                            <Badge variant="outline" className="font-mono text-[11px] py-0">
                                {apkidVersion}
                            </Badge>
                        </div>
                    )}
                    {rulesSha256 && (
                        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                            <span className="font-medium text-foreground shrink-0">Rules SHA256:</span>
                            <span
                                className="font-mono text-[11px] truncate text-muted-foreground"
                                title={rulesSha256}
                            >
                                {rulesSha256}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Packers
                            </span>
                            <LockIcon
                                className={`size-4 ${stats.totalPackers > 0 ? "text-red-500" : "text-muted-foreground"}`}
                            />
                        </div>
                        <div
                            className={`text-2xl font-bold mt-1 ${
                                stats.totalPackers > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-foreground"
                            }`}
                        >
                            {stats.totalPackers}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Binary packing detected
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Obfuscators
                            </span>
                            <ShieldAlertIcon
                                className={`size-4 ${stats.totalObfuscators > 0 ? "text-amber-500" : "text-muted-foreground"}`}
                            />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {stats.totalObfuscators}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Code obfuscation signatures
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Anti-Analysis
                            </span>
                            <ShieldCheckIcon
                                className={`size-4 ${stats.totalAntiAnalysis > 0 ? "text-amber-500" : "text-muted-foreground"}`}
                            />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {stats.totalAntiAnalysis}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Anti-VM & Anti-Debug tricks
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Compilers
                            </span>
                            <BinaryIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {stats.totalCompilers}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Identified compiler tools
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Files List */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <FileCodeIcon className="size-4 text-primary" />
                        Analyzed Dex & Native Binaries
                        <Badge variant="secondary" className="font-mono text-xs">
                            {files.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Breakdown of compiler identification, packers, and protections by file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    {files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2Icon className="size-8" />
                            </div>
                            <h3 className="font-semibold text-base text-foreground">
                                No Signatures Detected
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                APKiD did not detect any known packers, obfuscators, or special compilers in this package.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {files.map((file, idx) => {
                                const hasFindings =
                                    file.compilers.length > 0 ||
                                    file.packers.length > 0 ||
                                    file.obfuscators.length > 0 ||
                                    file.antiDebug.length > 0 ||
                                    file.antiVm.length > 0 ||
                                    file.antiDisassembly.length > 0 ||
                                    file.manipulators.length > 0 ||
                                    file.droppers.length > 0;

                                const fileTypes = file.other?.file_type ?? [];

                                return (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-lg border border-border/70 bg-card space-y-3"
                                    >
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                <BinaryIcon className="size-4 text-muted-foreground shrink-0" />
                                                <span
                                                    className="font-mono text-xs font-semibold text-foreground break-all"
                                                    title={file.filename}
                                                >
                                                    {file.filename}
                                                </span>
                                                {fileTypes.map((ft, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="font-mono text-[10px] py-0 px-1.5"
                                                    >
                                                        {ft}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {!hasFindings ? (
                                            <p className="text-xs text-muted-foreground italic">
                                                No packer, obfuscator, or anti-analysis signatures detected in this file.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                {file.compilers.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Compiler
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.compilers.map((c, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="outline"
                                                                    className="font-mono"
                                                                >
                                                                    {c}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {file.packers.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Packer
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.packers.map((p, i) => (
                                                                <Badge key={i} variant="destructive">
                                                                    {p}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {file.obfuscators.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Obfuscator
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.obfuscators.map((o, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                                                >
                                                                    {o}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(file.antiDebug.length > 0 ||
                                                    file.antiVm.length > 0 ||
                                                    file.antiDisassembly.length > 0) && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Anti-Analysis
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.antiDebug.map((ad, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="bg-rose-500/15 text-rose-700 dark:text-rose-400"
                                                                >
                                                                    Anti-Debug: {ad}
                                                                </Badge>
                                                            ))}
                                                            {file.antiVm.map((av, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="bg-rose-500/15 text-rose-700 dark:text-rose-400"
                                                                >
                                                                    Anti-VM: {av}
                                                                </Badge>
                                                            ))}
                                                            {file.antiDisassembly.map((ad, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                    className="bg-rose-500/15 text-rose-700 dark:text-rose-400"
                                                                >
                                                                    Anti-Disassembly: {ad}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {file.manipulators.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Manipulator
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.manipulators.map((m, i) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="outline"
                                                                    className="font-mono"
                                                                >
                                                                    {m}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {file.droppers.length > 0 && (
                                                    <div className="space-y-1">
                                                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                                                            Dropper
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {file.droppers.map((d, i) => (
                                                                <Badge key={i} variant="destructive">
                                                                    {d}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
