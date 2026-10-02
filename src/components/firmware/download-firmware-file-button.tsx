import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { DownloadIcon, FileArchiveIcon, Loader2Icon } from "lucide-react";
import { useToastStore } from "@/stores/toast.ts";
import { convertIdToObjectId } from "@/lib/graphql/graphql-utils.ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

export interface DownloadFirmwareFileButtonProps {
    fileId: string;
    isOnDisk?: boolean | null;
    fileName?: string | null;
    text?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export function DownloadFirmwareFileButton({
    fileId,
    isOnDisk = false,
    fileName,
    text,
    variant = "outline",
    size = text ? "sm" : "icon",
    className,
}: DownloadFirmwareFileButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const toast = useToastStore();

    const handleDownload = async () => {
        if (!fileId || !isOnDisk || isDownloading) return;
        setIsDownloading(true);
        try {
            const resolvedId = convertIdToObjectId(fileId) || fileId;
            const response = await fetch(`/download/firmware_file/${encodeURIComponent(resolvedId)}/`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                let errorMsg = `Download failed (HTTP ${response.status})`;
                try {
                    const errData = await response.json();
                    if (errData?.error) {
                        errorMsg = errData.error;
                    }
                } catch {
                    // Ignore JSON parsing failure
                }
                toast.error(errorMsg);
                return;
            }

            const blob = await response.blob();
            let safeFilename = fileName || `firmware_file_${resolvedId}.bin`;

            const disposition = response.headers.get("content-disposition");
            if (disposition && disposition.includes("filename=")) {
                const matches = /filename\*?=(?:UTF-8''|"?)([^";\r\n]*)/i.exec(disposition);
                if (matches && matches[1]) {
                    safeFilename = decodeURIComponent(matches[1].replace(/['"]/g, "").trim());
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = safeFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Downloaded ${safeFilename}`);
        } catch (err) {
            console.error("Failed to download firmware file:", err);
            toast.error("Network error while downloading file.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOnDisk) {
        return (
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-block cursor-not-allowed">
                        <Button
                            variant={variant}
                            size={size}
                            className={`opacity-50 pointer-events-none ${className || ""}`}
                            disabled
                            aria-label="File not extracted to disk"
                        >
                            <DownloadIcon className="size-4 shrink-0" aria-hidden="true" />
                            {text && <span className="ml-1.5">{text}</span>}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <p>File not extracted to disk. Run &quot;Extract All Files&quot; first.</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    const buttonElement = (
        <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isDownloading}
            onClick={() => void handleDownload()}
            aria-label={text || `Download ${fileName || "file"}`}
        >
            {isDownloading ? (
                <Loader2Icon className="size-4 animate-spin shrink-0" aria-hidden="true" />
            ) : (
                <DownloadIcon className="size-4 shrink-0" aria-hidden="true" />
            )}
            {text && <span className="ml-1.5">{isDownloading ? "Downloading..." : text}</span>}
        </Button>
    );

    if (text) {
        return buttonElement;
    }

    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                {buttonElement}
            </TooltipTrigger>
            <TooltipContent>
                <p>Download file</p>
            </TooltipContent>
        </Tooltip>
    );
}

export interface DownloadExtractedArchiveButtonProps {
    firmwareId: string;
    firmwareName?: string | null;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    text?: string;
}

export function DownloadExtractedArchiveButton({
    firmwareId,
    firmwareName,
    variant = "outline",
    size = "sm",
    className,
    text = "Download Archive (ZIP)",
}: DownloadExtractedArchiveButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const toast = useToastStore();

    const handleDownload = async () => {
        if (!firmwareId || isDownloading) return;
        setIsDownloading(true);
        try {
            const resolvedId = convertIdToObjectId(firmwareId) || firmwareId;
            const response = await fetch(`/download/firmware/${encodeURIComponent(resolvedId)}/files/archive/`, {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                let errorMsg = `Download failed (HTTP ${response.status})`;
                try {
                    const errData = await response.json();
                    if (errData?.error) {
                        errorMsg = errData.error;
                    }
                } catch {
                    // Ignore JSON parsing failure
                }
                toast.error(errorMsg);
                return;
            }

            const blob = await response.blob();
            let safeFilename = `${firmwareName || resolvedId}_extracted_files.zip`;

            const disposition = response.headers.get("content-disposition");
            if (disposition && disposition.includes("filename=")) {
                const matches = /filename\*?=(?:UTF-8''|"?)([^";\r\n]*)/i.exec(disposition);
                if (matches && matches[1]) {
                    safeFilename = decodeURIComponent(matches[1].replace(/['"]/g, "").trim());
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = safeFilename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Downloaded ${safeFilename}`);
        } catch (err) {
            console.error("Failed to download extracted files archive:", err);
            toast.error("Network error while downloading archive.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isDownloading}
            onClick={() => void handleDownload()}
            title="Download all extracted files as a ZIP archive"
        >
            {isDownloading ? (
                <Loader2Icon className="size-4 animate-spin shrink-0" aria-hidden="true" />
            ) : (
                <FileArchiveIcon className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span className="ml-1.5">{isDownloading ? "Creating Archive..." : text}</span>
        </Button>
    );
}
