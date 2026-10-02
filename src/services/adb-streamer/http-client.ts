import axios, {AxiosInstance} from "axios";
import {normalizeBackendOrigin} from "./endpoint-security.ts";

export const apiClient: AxiosInstance = axios.create({
    baseURL: `${normalizeBackendOrigin(import.meta.env.VITE_BACKEND_URL || "https://localhost:9001", "http")}/api`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: true,
});

export function setBackendBaseUrl(userUrl: string) {
    if (!userUrl) return;
    apiClient.defaults.baseURL = `${normalizeBackendOrigin(userUrl, "http")}/api`;
}
