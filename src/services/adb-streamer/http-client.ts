import axios, {AxiosInstance} from "axios";
import {accessToken} from "@/services/adb-streamer/utils/constants";
import {storage} from "./storage.ts";


// Read token: prefer stored accessToken, then credential helper token
const storedToken = storage.getLocal(accessToken) || storage.getSession(accessToken) || undefined;
// note: token is read from storage; credentials.setCredentials persists token to session so we can read it here
const rawToken = storedToken ?? undefined;
const normalizeAuthHeader = (t?: string | undefined) => {
    if (!t) return undefined;
    const s = String(t);
    if (s.trim().toLowerCase().startsWith('basic ')) return s;
    return `Basic ${s}`;
};
const initialAuth = normalizeAuthHeader(rawToken);

export const apiClient: AxiosInstance = axios.create({
    baseURL: `${(process.env.VITE_BACKEND_URL as string) || import.meta.env?.VITE_BACKEND_URL || "https://localhost:9001"}/api`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: initialAuth,
    },
});

export function setBackendBaseUrl(userUrl: string) {
    if (!userUrl) return;
    let u: URL;
    try {
        u = new URL(String(userUrl).trim());
    } catch (e) {
        throw new Error("Invalid URL");
    }

    // If ws/wss provided, convert to http/https and strip credentials (we'll apply them to headers)
    let username = u.username || '';
    let password = u.password || '';

    // strip credentials from host by rebuilding URL without username/password
    const proto = (u.protocol === 'ws:' ? 'http:' : u.protocol === 'wss:' ? 'https:' : u.protocol);
    const host = u.host; // host already excludes credentials in modern URL impl, but ensure
    const base = `${proto}//${host}`.replace(/\/+$/, '');

    // If username/password were present, apply Authorization header
    if (username || password) {
        try {
            const token = typeof btoa === 'function' ? btoa(`${username}:${password}`) : Buffer.from(`${username}:${password}`).toString('base64');
            const header = normalizeAuthHeader(token);
            if (header) apiClient.defaults.headers!['Authorization'] = header;
            // also persist token to session storage for helper recovery
            try { storage.setSession(accessToken, token); } catch {}
        } catch (e) {
            // ignore
        }
    }

    apiClient.defaults.baseURL = `${base}/api`;
}

export function setAuthToken(tokenValue?: string) {
    if (tokenValue) apiClient.defaults.headers!['Authorization'] = tokenValue;
    else delete apiClient.defaults.headers!['Authorization'];
}
