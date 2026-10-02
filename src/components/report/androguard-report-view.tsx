import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {
    ActivityIcon,
    CheckCircle2Icon,
    KeyIcon,
    RadioIcon,
    ServerIcon,
    ShieldCheckIcon,
    XCircleIcon,
} from "lucide-react";

interface AndroGuardReportViewProps {
    data: Record<string, any>;
}

export function AndroGuardReportView({ data }: AndroGuardReportViewProps) {
    const activities = useMemo(() => (Array.isArray(data.activities) ? data.activities : []), [data.activities]);
    const services = useMemo(() => (Array.isArray(data.services) ? data.services : []), [data.services]);
    const receivers = useMemo(() => (Array.isArray(data.receivers) ? data.receivers : []), [data.receivers]);
    const providers = useMemo(() => (Array.isArray(data.providers) ? data.providers : []), [data.providers]);
    const permissions = useMemo(() => (Array.isArray(data.permissions) ? data.permissions : []), [data.permissions]);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Activities
                            </span>
                            <ActivityIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {activities.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Main: {data.mainActivity ? "Defined" : "None"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Services
                            </span>
                            <ServerIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {services.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Background services
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Receivers / Providers
                            </span>
                            <RadioIcon className="size-4 text-primary" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {receivers.length + providers.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            {receivers.length} broadcast, {providers.length} content
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/60">
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Permissions
                            </span>
                            <KeyIcon className="size-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-bold mt-1 text-foreground">
                            {permissions.length}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                            Requested permissions
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Signature Schemes & APK Verification */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <ShieldCheckIcon className="size-4 text-primary" />
                        APK Signature & SDK Compatibility
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                            APK Validity
                        </span>
                        <div className="flex items-center gap-1.5 font-medium">
                            {data.isValidApk ? (
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2Icon className="size-3 mr-1" /> Valid APK
                                </Badge>
                            ) : (
                                <Badge variant="destructive">
                                    <XCircleIcon className="size-3 mr-1" /> Invalid
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                            Signature Schemes
                        </span>
                        <div className="flex flex-wrap gap-1">
                            <Badge variant={data.isSignedV1 ? "secondary" : "outline"}>
                                V1: {data.isSignedV1 ? "Signed" : "No"}
                            </Badge>
                            <Badge variant={data.isSignedV2 ? "secondary" : "outline"}>
                                V2: {data.isSignedV2 ? "Signed" : "No"}
                            </Badge>
                            <Badge variant={data.isSignedV3 ? "secondary" : "outline"}>
                                V3: {data.isSignedV3 ? "Signed" : "No"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                            Min SDK Version
                        </span>
                        <div className="font-mono font-medium text-foreground">
                            {data.minSdkVersion ?? "\u2014"}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                            Target SDK Version
                        </span>
                        <div className="font-mono font-medium text-foreground">
                            {data.targetSdkVersion ?? "\u2014"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Components & Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <KeyIcon className="size-4 text-primary" />
                            Declared Permissions ({permissions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-72 overflow-y-auto space-y-1.5">
                        {permissions.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No permissions declared</p>
                        ) : (
                            permissions.map((p: string, idx: number) => (
                                <div key={idx} className="p-1.5 rounded bg-muted/50 border border-border/40 font-mono text-xs text-foreground break-all">
                                    {p}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <ActivityIcon className="size-4 text-primary" />
                            Activities ({activities.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 max-h-72 overflow-y-auto space-y-1.5">
                        {activities.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No activities registered</p>
                        ) : (
                            activities.map((a: string, idx: number) => (
                                <div key={idx} className="p-1.5 rounded bg-muted/50 border border-border/40 font-mono text-xs text-foreground break-all">
                                    {a}
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
