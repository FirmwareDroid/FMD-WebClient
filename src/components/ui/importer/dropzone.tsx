import {Dispatch, SetStateAction, useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import {Card} from "@/components/ui/card.tsx";
import {cn} from "@/lib/utils.ts";
import {useAuth} from "@/lib/auth.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {
    CircleAlertIcon,
    CircleCheckBigIcon,
    CloudAlertIcon,
    LoaderCircleIcon,
    ShieldEllipsisIcon,
    XIcon
} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {ApolloQueryResult, useMutation, useQuery} from "@apollo/client";
import {
    CREATE_FIRMWARE_EXTRACTOR_JOB,
} from "@/components/graphql/firmware.graphql.ts";
import {Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Exact, GetRqJobListQuery} from "@/__generated__/graphql.ts";
import {GET_RQ_JOB_LIST} from "@/components/graphql/rq-job.graphql.ts";
import {CREATE_APP_IMPORT_JOB} from "@/components/graphql/app.graphql.ts";

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

function UploadDialog({storageIndex, fileUploads, setFileUploads, removeUpload, refetchRqJobList}: Readonly<{
    storageIndex: number;
    fileUploads: FileUpload[];
    setFileUploads: Dispatch<SetStateAction<FileUpload[]>>;
    removeUpload: (id: string) => void;
    refetchRqJobList: (variables?: (Partial<Exact<{
        [p: string]: never
    }>>)) => Promise<ApolloQueryResult<GetRqJobListQuery>>;
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
                                                        <XIcon
                                                            onClick={() => {
                                                                cancelUpload(upload);
                                                            }}
                                                            className="cursor-pointer"
                                                        />
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
                    <Button
                        disabled={
                            !fileUploads.every(upload => upload.serverResponded) ||
                            fileUploads.every(upload => upload.error)
                        }
                        onClick={() => {
                            if (fileUploads.some(upload => upload.type === "firmware")) {
                                void createFirmwareExtractorJob({variables: {storageIndex}});
                            }

                            if (fileUploads.some(upload => upload.type === "apk")) {
                                void createAppImportJob({variables: {storageIndex}});
                            }

                            setFileUploads(prev => prev.map(upload => ({...upload, importStarted: true})))
                            void refetchRqJobList();
                        }}>
                        Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function JobStatus({status, isFinished, isFailed}: Readonly<{
    status: string;
    isFinished?: boolean | null;
    isFailed?: boolean | null;
}>) {
    if (isFinished) {
        return (
            <CircleCheckBigIcon color="green"/>
        );
    }

    if (isFailed) {
        return (
            <CircleAlertIcon color="red"/>
        );
    }

    return (
        <>
            <LoaderCircleIcon className="animate-spin mr-2"/>
            <span>{status}</span>
        </>
    );
}

export function Dropzone(
    {
        className = "",
        message = "Drag 'n' drop files here, or click to select files",
        storageIndex = 0,
    }: Readonly<DropzoneProps>
) {
    const {getToken} = useAuth();
    const [fileUploads, setFileUploads] = useState<FileUpload[]>([]);
    const {data: rqJobListData, refetch: refetchRqJobList} = useQuery(GET_RQ_JOB_LIST, {
        fetchPolicy: "cache-and-network",
        pollInterval: 10000,
    });

    const importJobs = rqJobListData?.rq_job_list
        ?.filter(job =>
            job?.funcName === FIRMWARE_IMPORT_JOB_FUNC_NAME ||
            job?.funcName === APP_IMPORT_JOB_FUNC_NAME
        )
        .sort((a, b) => new Date(b?.startedAt).getTime() - new Date(a?.startedAt).getTime());


    const updateUpload = useCallback((id: string, patch: Partial<FileUpload>) => {
        setFileUploads(prev => prev.map(upload => (upload.id === id ? {...upload, ...patch} : upload)));
    }, []);

    const removeUpload = useCallback((id: string) => {
        setFileUploads(prev => prev.filter(upload => upload.id !== id));
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const token = getToken();
        if (!token) {
            console.error("No auth token available.");
            return;
        }

        setFileUploads(acceptedFiles.map(file => ({
            id: makeUploadId(file),
            file: file,
            type: getUploadType(file),
            percentComplete: 0,
            serverResponded: false,
        })));

        acceptedFiles.forEach((file) => {
            const id = makeUploadId(file);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", getUploadType(file));
            formData.append("storage_index", storageIndex.toString());

            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/upload/file");
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    updateUpload(id, {percentComplete});
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    updateUpload(id, {serverResponded: true});
                    return;
                }

                updateUpload(id, {serverResponded: true, error: xhr.responseText})
            };

            xhr.onerror = () => {
                updateUpload(id, {serverResponded: true, error: xhr.statusText});
            };

            xhr.onabort = () => {
                removeUpload(id);
            };

            updateUpload(id, {xhr});
            xhr.send(formData);
        });
    }, [getToken, storageIndex, updateUpload, removeUpload]);

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
    });

    return (
        <div className={cn(className)}>
            <div {...getRootProps({className: "dropzone rounded-xl cursor-pointer"})}>
                <Card className="flex justify-center text-center min-h-48 p-4 border-2 border-dashed">
                    <input {...getInputProps()} />
                    <p>{message}</p>
                </Card>
            </div>
            <UploadDialog
                storageIndex={storageIndex}
                fileUploads={fileUploads}
                setFileUploads={setFileUploads}
                removeUpload={removeUpload}
                refetchRqJobList={refetchRqJobList}
            />
            {importJobs && importJobs.length > 0 && (
                <Table className="w-full mt-2">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job ID</TableHead>
                            <TableHead>Started At</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {importJobs.map((job) => {
                            if (job) {
                                return (
                                    <TableRow key={job.id}>
                                        <TableCell>
                                            <span>{job.id}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span>{job.startedAt}</span>
                                        </TableCell>
                                        <TableCell>
                                            {job.funcName === FIRMWARE_IMPORT_JOB_FUNC_NAME && (
                                                <span>Firmware</span>
                                            )}
                                            {job.funcName === APP_IMPORT_JOB_FUNC_NAME && (
                                                <span>APK</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {job.status ? (
                                                    <JobStatus status={job.status} isFinished={job.isFinished}
                                                               isFailed={job.isFailed}/>
                                                ) : (
                                                    <>
                                                        <CircleAlertIcon color="red"/>
                                                        <span>Unknown status</span>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}