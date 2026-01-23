import { apiClient } from "../http-client";
import * as qs from "qs";

export class FileUploadService {
    private readonly endpoint = "file";

    upload(files: FileList | File[], params: Record<string, any> = {}) {
        const formData = new FormData();
        const list = Array.from(files);
        list.forEach((file, idx) => formData.append(`files[${idx}]`, file));
        const querystring = qs.stringify(params, { encode: false });
        const url = `/${this.endpoint}/upload?${querystring}`;
        return apiClient.post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    getUploads(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        const url = `/${this.endpoint}/get-uploads?${q}`;
        return apiClient.get(url);
    }

    getApps(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        const url = `/${this.endpoint}/get-apps?${q}`;
        return apiClient.get(url);
    }
}

export const fileUploadService = new FileUploadService();
