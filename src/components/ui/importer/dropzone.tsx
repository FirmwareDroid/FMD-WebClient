import {useCallback, useMemo, useState} from "react";
import {useDropzone} from "react-dropzone";
import {Card} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import {Alert, AlertTitle} from "@/components/ui/alert.tsx";

type FileState =
    | { status: "queued"; file: File }
    | { status: "uploading"; file: File; progress: number }
    | { status: "done"; file: File; uploadId: string | null }
    | { status: "error"; file: File; error: string };

async function uploadInChunks(
    file: File,
    opts: {
        endpoint?: string;
        storageIndex?: number;
        chunkSize?: number; // bytes
        onProgress?: (received: number, total: number, uploadId: string | null) => void;
    } = {},
): Promise<{ uploadId: string | null }> {
    const endpoint = opts.endpoint ?? "/upload/firmware/";
    const storageIndex = opts.storageIndex ?? 0;
    const chunkSize = opts.chunkSize ?? 1024;

    let offset = 0;
    let uploadId: string | null = null;

    while (offset < file.size) {
        const end = Math.min(offset + chunkSize, file.size);
        const blob = file.slice(offset, end);
        const body = await blob.arrayBuffer();

        const res: Response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Range": `bytes ${offset}-${end - 1}/${file.size}`,
                "X-File-Name": file.name,
                "X-Upload-Id": uploadId ?? "",
                "X-Storage-Index": String(storageIndex),
            },
            body,
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`Chunk upload failed: ${res.status}`);
        }

        const data = await res.json() as { uploadId?: string | null; received?: number; total?: number };
        uploadId = data.uploadId ?? uploadId;

        if (opts.onProgress) {
            opts.onProgress(data.received ?? end, data.total ?? file.size, uploadId);
        }

        offset = end;
    }

    return {uploadId};
}

export function Dropzone(
    {
        className = "",
        message = "Drag 'n' drop some files here, or click to select files",
    }
) {
    const [fileStates, setFileStates] = useState<FileState[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const queuedItems: FileState[] = acceptedFiles.map(file => ({status: "queued" as const, file}));
        setFileStates(prev => [...prev, ...queuedItems]);

        for (const file of acceptedFiles) {
            setFileStates(prev => prev.map(it => (it.file === file ? {
                status: "uploading" as const,
                file,
                progress: 0
            } : it)));
            try {
                const {uploadId} = await uploadInChunks(file, {
                    endpoint: "/upload/firmware/",
                    storageIndex: 0,
                    chunkSize: 1024,
                    onProgress: (received, total) => {
                        const progress = Math.max(0, Math.min(100, Math.round((received / total) * 100)));
                        setFileStates(prev => prev.map(it => (it.file === file && it.status === "uploading" ? {
                            ...it,
                            progress
                        } : it)));
                    },
                });
                setFileStates(prev => prev.map(it => (it.file === file ? {
                    status: "done" as const,
                    file,
                    uploadId
                } : it)));
            } catch (e: any) {
                setFileStates(prev =>
                    prev.map(it =>
                        it.file === file
                            ? {status: "error" as const, file, error: e?.message ?? "Upload failed"}
                            : it,
                    ),
                );
            }
        }
    }, []);

    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: {
            // See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
            'application/zip': ['.zip'],
            'application/x-zip-compressed': ['.zip'],
            // TODO: Accept 7-zip (.7z)? Ask suth
        },
        multiple: true,
        onDrop,
        disabled: true, // TODO: Enable the dropzone
    });

    const hasFileStates = useMemo(() => fileStates.length > 0, [fileStates]);

    return (
        <div className={cn(className)}>
            <div {...getRootProps({className: "dropzone rounded-xl cursor-pointer"})}>
                <Card
                    className="flex justify-center text-center min-h-48 p-4 border-2 border-dashed"
                >
                    <input {...getInputProps()} />
                    <Alert variant="destructive" className="text-center border-none">
                        <AlertTitle>(CURRENTLY DISABLED)</AlertTitle>
                    </Alert>
                    <p>{message}</p>
                </Card>
            </div>

            {hasFileStates && (
                <div className="w-full">
                    {fileStates.map((state, idx) => (
                        <Card key={idx} className="p-4 my-2">
                            <div className="flex justify-between items-center gap-4">
                                <div className="truncate">{state.file.name}</div>
                                <div className="text-sm opacity-70">
                                    {state.status === "queued" && "Queued"}
                                    {state.status === "uploading" && `Uploading… ${state.progress.toString()}%`}
                                    {state.status === "done" && (state.uploadId ? `Uploaded (id: ${state.uploadId})` : "Uploaded")}
                                    {state.status === "error" && `Error: ${state.error}`}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}