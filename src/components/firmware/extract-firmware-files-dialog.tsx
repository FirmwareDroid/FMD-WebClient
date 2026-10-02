import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
    CheckCircle2Icon,
    HardDriveDownloadIcon,
    Loader2Icon,
    ShieldAlertIcon,
} from "lucide-react";
import { useToastStore } from "@/stores/toast.ts";
import { convertIdToObjectId } from "@/lib/graphql/graphql-utils.ts";
import { useMutation } from "@/lib/apollo-hooks";
import { EXPORT_FIRMWARE_FILES } from "@/components/graphql/file.graphql.ts";

export interface ExtractFirmwareFilesDialogProps {
    firmwareId: string;
    firmwareName?: string | null;
    trigger?: React.ReactNode;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    buttonText?: string;
    onExtractionStarted?: (jobId?: string) => void;
}

export function ExtractFirmwareFilesDialog({
    firmwareId,
    firmwareName,
    trigger,
    variant = "outline",
    size = "sm",
    buttonText = "Extract All Files",
    onExtractionStarted,
}: ExtractFirmwareFilesDialogProps) {
    const [open, setOpen] = useState(false);
    const toast = useToastStore();

    const [exportFirmwareFiles, { loading }] = useMutation(EXPORT_FIRMWARE_FILES);

    const handleExtract = async () => {
        const resolvedId = convertIdToObjectId(firmwareId) || firmwareId;
        if (!resolvedId) {
            toast.error("Invalid firmware ID.");
            return;
        }

        try {
            const result = await exportFirmwareFiles({
                variables: {
                    firmwareIdList: [resolvedId],
                    filenameRegex: ".*",
                    queueName: "extractor",
                },
            });

            const jobId = result.data?.exportFirmwareFile?.jobId;
            toast.success(
                `Extraction queued successfully${jobId ? ` (Job ID: ${jobId})` : ""}. Files will be unpacked to disk in the background.`
            );
            if (onExtractionStarted) {
                onExtractionStarted(jobId || undefined);
            }
            setOpen(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to queue firmware extraction.";
            console.error("Extraction error:", err);
            toast.error(msg);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={variant}
                        size={size}
                        title="Extract all files from this firmware to disk storage"
                        className="gap-1.5"
                    >
                        <HardDriveDownloadIcon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{buttonText}</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HardDriveDownloadIcon className="size-5 text-primary" aria-hidden="true" />
                        Extract Firmware Files to Disk
                    </DialogTitle>
                    <DialogDescription>
                        {firmwareName
                            ? `Extract all files from "${firmwareName}" to persistent server storage.`
                            : "Extract all files from this firmware to persistent server storage."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-sm">
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-2">
                        <div className="flex items-start gap-2.5">
                            <ShieldAlertIcon className="size-5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="space-y-1">
                                <p className="font-medium text-foreground text-xs">Resource Intensive Task</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Firmware decompression, partition carving, and filesystem unpacking are computationally costly and may take several minutes depending on the firmware archive size.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-2">
                        <div className="flex items-start gap-2.5">
                            <CheckCircle2Icon className="size-5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <div className="space-y-1">
                                <p className="font-medium text-foreground text-xs">What happens next?</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    The extraction task will run asynchronously in the background via the extractor queue. Once completed, individual files and full ZIP archives will be available for direct secure download.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => void handleExtract()}
                        disabled={loading}
                        className="gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                                <span>Queueing Extraction...</span>
                            </>
                        ) : (
                            <>
                                <HardDriveDownloadIcon className="size-4" aria-hidden="true" />
                                <span>Start Extraction</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
