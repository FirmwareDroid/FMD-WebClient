import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {useDropzone} from "react-dropzone";
import {Card} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import {Progress} from "@/components/ui/progress.tsx";
import {
    CircleCheckBigIcon,
    CloudAlertIcon,
    LoaderCircleIcon,
    ShieldEllipsisIcon,
    XIcon
} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import { useMutation } from "@/lib/apollo-hooks";
import {
    CREATE_FIRMWARE_EXTRACTOR_JOB,
} from "@/components/graphql/firmware.graphql.ts";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CREATE_APP_IMPORT_JOB} from "@/components/graphql/app.graphql.ts";
import {RqJobsTable} from "@/components/rq-jobs-table.tsx";
import {RqJobQueuesDropdownMenu} from "@/components/rq-jobs/rq-job-queues-dropdown-menu.tsx";
import {getCsrf} from "@/lib/graphql/apolloClient.ts";

type DropzoneProps = {
    className?: string;
    message?: string;
    storageIndex?: number;
}

type UploadType = "firmware" | "apk";

type FileUpload = {
    id: string;
    file: File;
    type: UploadType;
    percentComplete: number;
    serverResponded: boolean;
    error?: string;
    xhr?: XMLHttpRequest;
    importStarted?: boolean;
}

const MIME_TYPE_ZIP = "application/zip";
const MIME_TYPE_ZIP_COMPRESSED = "application/x-zip-compressed";
const MIME_TYPE_APK = "application/vnd.android.package-archive";

const FIRMWARE_IMPORT_JOB_FUNC_NAME = "firmware_handler.firmware_importer.start_firmware_mass_import";
const APP_IMPORT_JOB_FUNC_NAME = "android_app_importer.standalone_importer.start_android_app_standalone_importer";

const makeUploadId = (file: File) => `${file.name}:${file.size.toString()}:${file.lastModified.toString()}`;

const getUploadType = (file: File): UploadType => file.type === MIME_TYPE_APK ? "apk" : "firmware";

function UploadDialog({storageIndex, fileUploads, setFileUploads, removeUpload}: Readonly<{
    storageIndex: number;
    fileUploads: FileUpload[];
    setFileUploads: Dispatch<SetStateAction<FileUpload[]>>;
    removeUpload: (id: string) => void;
}>) {
    const cancelUpload = (upload: FileUpload) => {
        if (upload.xhr) {
            const readyStateBefore = upload.xhr.readyState;
            upload.xhr.abort();
            if (readyStateBefore === XMLHttpRequest.DONE || readyStateBefore === XMLHttpRequest.UNSENT) {
                removeUpload(upload.id);
            }
        } else {
            removeUpload(upload.id);
        }
    }

    const [createFirmwareExtractorJob] = useMutation(CREATE_FIRMWARE_EXTRACTOR_JOB);
    const [createAppImportJob] = useMutation(CREATE_APP_IMPORT_JOB);

    const [selectedQueue, setSelectedQueue] = useState<string>("");
    const [importStarting, setImportStarting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);

    return (
        <Dialog open={fileUploads.length > 0 && !fileUploads.every(u => u.importStarted)} modal={true}>
            <DialogContent className="sm:max-w-5xl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Uploading and validating...</DialogTitle>
                </DialogHeader>
                <Table className="w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Filename</TableHead>
                            <TableHead className="text-center">1. Upload to Server</TableHead>
                            <TableHead className="text-center">2. Server Validation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fileUploads.map((upload) => {
                            if (!upload.error) {
                                return (
                                    <TableRow key={upload.id}>
                                        <TableCell>
                                            <div>
                                                <span>{upload.file.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2 w-full">
                                                {upload.percentComplete < 100 && (
                                                    <>
                                                        <LoaderCircleIcon className="animate-spin"/>
                                                        <Progress value={upload.percentComplete}/>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => cancelUpload(upload)}
                                                            aria-label={`Cancel upload of ${upload.file.name}`}
                                                        >
                                                            <XIcon/>
                                                        </Button>
                                                    </>
                                                )}
                                                {upload.percentComplete >= 100 &&
                                                    <CircleCheckBigIcon color="green"/>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {upload.percentComplete < 100 && (
                                                    <ShieldEllipsisIcon/>
                                                )}
                                                {upload.percentComplete >= 100 && !upload.serverResponded && (
                                                    <LoaderCircleIcon className="animate-spin"/>
                                                )}
                                                {upload.percentComplete >= 100 && upload.serverResponded && (
                                                    <CircleCheckBigIcon color="green"/>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }

                            return (
                                <TableRow key={upload.id}>
                                    <TableCell colSpan={3}>
                                        <Alert variant="destructive">
                                            <CloudAlertIcon/>
                                            <AlertTitle>Error while uploading {upload.file.name}</AlertTitle>
                                            <AlertDescription>{upload.error}</AlertDescription>
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {importError && (
                    <Alert variant="destructive" role="alert">
                        <CloudAlertIcon/>
                        <AlertTitle>Unable to start import</AlertTitle>
                        <AlertDescription>{importError}</AlertDescription>
                    </Alert>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="destructive" onClick={() => {
                            fileUploads.forEach((upload: FileUpload) => {
                                cancelUpload(upload);
                            })
                        }}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <RqJobQueuesDropdownMenu
                        filterQueue={"extractor"}
                        onSelect={(queue) => {
                            setSelectedQueue(queue);
                        }}
                    />
                    <Button
                        disabled={
                            !selectedQueue ||
                            importStarting ||
                            !fileUploads.every(upload => upload.serverResponded) ||
                            fileUploads.every(upload => upload.error)
                        }
                        aria-busy={importStarting}
                        onClick={() => {
                            setImportStarting(true);
                            setImportError(null);
                            const jobs: Promise<unknown>[] = [];
                            if (fileUploads.some(upload => upload.type === "firmware")) {
                                jobs.push(createFirmwareExtractorJob({variables: {queueName: selectedQueue, storageIndex}}));
                            }
                            if (fileUploads.some(upload => upload.type === "apk")) {
                                jobs.push(createAppImportJob({variables: {queueName: selectedQueue, storageIndex}}));
                            }
                            void Promise.all(jobs)
                                .then(() => setFileUploads(prev => prev.map(upload => ({...upload, importStarted: true}))))
                                .catch(() => setImportError("The server could not start the selected import jobs. Please try again."))
                                .finally(() => setImportStarting(false));
                        }}>
                        {importStarting ? "Starting import…" : "Import"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function Dropzone(
    {
        className = "",
        message = "Drag 'n' drop files here, or click to select files",
        storageIndex = 0,
    }: Readonly<DropzoneProps>
) {
    const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
    const [dropError, setDropError] = useState<string | null>(null);
    const activeRequests = useRef(new Map<string, XMLHttpRequest>());

    useEffect(() => () => {
        activeRequests.current.forEach(request => request.abort());
        activeRequests.current.clear();
    }, []);

    const updateUpload = useCallback((id: string, patch: Partial<FileUpload>) => {
        setFileUploads(prev => prev.map(upload => (upload.id === id ? {...upload, ...patch} : upload)));
    }, []);

    const removeUpload = useCallback((id: string) => {
        activeRequests.current.delete(id);
        setFileUploads(prev => prev.filter(upload => upload.id !== id));
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setDropError(null);
        const uniqueFiles = acceptedFiles.filter((file, index, files) =>
            files.findIndex(candidate => makeUploadId(candidate) === makeUploadId(file)) === index
        );

        setFileUploads(uniqueFiles.map(file => ({
            id: makeUploadId(file),
            file: file,
            type: getUploadType(file),
            percentComplete: 0,
            serverResponded: false,
        })));

        void getCsrf().then(csrfToken => uniqueFiles.forEach((file) => {
            const id = makeUploadId(file);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", getUploadType(file));
            formData.append("storage_index", storageIndex.toString());

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/upload/file");
            xhr.withCredentials = true;
            xhr.setRequestHeader("X-CSRFToken", csrfToken);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    updateUpload(id, {percentComplete});
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    updateUpload(id, {serverResponded: true});
                    activeRequests.current.delete(id);
                    return;
                }

                updateUpload(id, {serverResponded: true, error: "The server could not accept this file."});
                activeRequests.current.delete(id);
            };

            xhr.onerror = () => {
                updateUpload(id, {serverResponded: true, error: "The upload failed because of a network error."});
                activeRequests.current.delete(id);
            };

            xhr.onabort = () => {
                removeUpload(id);
            };

            updateUpload(id, {xhr});
            activeRequests.current.set(id, xhr);
            xhr.send(formData);
        })).catch(() => {
            setDropError("Unable to initialize a secure upload. Refresh the page and try again.");
        });
    }, [storageIndex, updateUpload, removeUpload]);

    const {
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: {
            [MIME_TYPE_ZIP]: ['.zip'],
            [MIME_TYPE_ZIP_COMPRESSED]: ['.zip'],
            [MIME_TYPE_APK]: ['.apk'],
        },
        multiple: true,
        onDrop,
        onDropRejected: () => setDropError("Choose ZIP firmware packages or APK files only."),
    });

    return (
        <div className={cn(className, "flex flex-col gap-4 items-center")}>
            {dropError && (
                <Alert variant="destructive" role="alert" className="w-full">
                    <CloudAlertIcon/>
                    <AlertTitle>Upload unavailable</AlertTitle>
                    <AlertDescription>{dropError}</AlertDescription>
                </Alert>
            )}
            <div {...getRootProps({className: "dropzone w-full rounded-xl cursor-pointer"})}>
                <Card className="flex min-h-48 justify-center border-2 border-dashed p-4 text-center transition-colors focus-within:ring-2 focus-within:ring-ring">
                    <input {...getInputProps()} />
                    <p>{message}</p>
                </Card>
            </div>
            <UploadDialog
                storageIndex={storageIndex}
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
                removeUpload={removeUpload}
            />
            <RqJobsTable funcNames={[FIRMWARE_IMPORT_JOB_FUNC_NAME, APP_IMPORT_JOB_FUNC_NAME]}/>
        </div>
    );
}
