import {v4 as uuid} from "uuid";

export type StreamInitOptions = {
    device?: string;
    audio?: boolean;
    audioCodec?: string | undefined;
    audioEncoder?: string | undefined;
    video?: boolean;
    videoCodec?: string | undefined;
    videoEncoder?: string | undefined;
    videoBitRate?: number | undefined;
    maxFps?: number | undefined;
    onopen?: (ws: WebSocket, id: string, evt: Event) => void;
    onclose?: (ws: WebSocket, id: string, evt: CloseEvent) => void;
    onmessage?: (ws: WebSocket, id: string, evt: MessageEvent) => void;
    onerror?: (ws: WebSocket, id: string, evt: Event) => void;
    backendBaseUrl?: string;
    // optional credentials for basic auth — may be included in URL userinfo or used to build an `auth` query param
    username?: string;
    password?: string;
};

export class StreamingService {
    private ws?: WebSocket;
    private defaultBackendBase: string;

    constructor(defaultBase?: string) {
        this.defaultBackendBase = defaultBase || (import.meta.env?.VITE_BACKEND_WS_URL as string) || "https://localhost:9001";
    }

    private normalizeToWsBase(base: string): string {
        if (!base) throw new Error("Missing backend base");
        let u: URL;
        try {
            u = new URL(String(base).trim());
        } catch {
            throw new Error("Invalid backend base URL");
        }
        // If http(s) convert to ws(s)
        if (u.protocol === "http:") u.protocol = "ws:";
        if (u.protocol === "https:") u.protocol = "wss:";
        if (!["ws:", "wss:"].includes(u.protocol)) {
            throw new Error("Unsupported protocol for streaming (must be http/https/ws/wss)");
        }
        return `${u.protocol}//${u.host}`.replace(/\/+$/, "");
    }

    async init(opts: StreamInitOptions = {}): Promise<WebSocket> {
        const id = uuid();
        return this.initWs(opts, id.toString());
    }

    private async initWs(opts: StreamInitOptions, id: string): Promise<WebSocket> {
        const backendCandidate = opts.backendBaseUrl || this.defaultBackendBase || "http://localhost:9001";
        const wsBase = this.normalizeToWsBase(backendCandidate);

        const params: string[] = [`id=${encodeURIComponent(id)}`];
        // Ensure device param is a proper string. If an object is passed (accidentally), try to extract a sensible identifier.
        const deviceParam = (() => {
            const d = opts.device as any;
            if (d === null || d === undefined) return '';
            if (typeof d === 'string') return d;
            if (typeof d === 'object') {
                try {
                    return d.name ?? d.serverKey ?? d.serial ?? (d.id ?? JSON.stringify(d));
                } catch (e) {
                    try { return JSON.stringify(d); } catch { return String(d); }
                }
            }
            return String(d);
        })();
        params.push(`device=${encodeURIComponent(String(deviceParam))}`);
        params.push(`audio=${encodeURIComponent(String(Boolean(opts.audio)))}`);
        if (opts.audio) {
            params.push(`audioCodec=${encodeURIComponent(opts.audioCodec ?? "")}`);
            params.push(`audioEncoder=${encodeURIComponent(opts.audioEncoder ?? "")}`);
        }
        params.push(`video=${encodeURIComponent(String(Boolean(opts.video)))}`);
        if (opts.video) {
            params.push(`videoCodec=${encodeURIComponent(opts.videoCodec ?? "")}`);
            params.push(`videoEncoder=${encodeURIComponent(opts.videoEncoder ?? "")}`);
            params.push(`maxFps=${encodeURIComponent(String(opts.maxFps ?? ""))}`);
            params.push(`videoBitRate=${encodeURIComponent(String(opts.videoBitRate ?? ""))}`);
        }

        // If credentials were passed, expose them also as an `auth` query parameter containing
        // the Basic auth header value (Basic <base64(user:pass)>). This helps servers that
        // rely on the Authorization header but can't get it from URL userinfo due to browser
        // restrictions; server-side can accept this param as a fallback.
        try {
            const user = (opts.username ?? (import.meta.env?.VITE_WS_USERNAME as string) ?? "").toString();
            const pass = (opts.password ?? (import.meta.env?.VITE_WS_PASSWORD as string) ?? "").toString();
            if (user || pass) {
                // compute Basic <base64>
                let token = "";
                try {
                    // btoa available in browsers; fall back to Buffer on Node (defensive)
                    token = typeof btoa === 'function'
                        ? btoa(`${user}:${pass}`)
                        : (typeof Buffer !== 'undefined' ? Buffer.from(`${user}:${pass}`).toString('base64') : '');
                } catch (e) {
                    try { token = Buffer.from(`${user}:${pass}`).toString('base64'); } catch { token = ''; }
                }
                if (token) {
                    params.push(`auth=${encodeURIComponent(`Basic ${token}`)}`);
                }
            }
        } catch (e) {
            // ignore
        }

        // Build the websocket origin. If username/password are provided, add them
        // into the authority part (user:pass@host). Use the URL API to avoid
        // manual string surgery and ensure encoding. Also support fallback to
        // environment variables VITE_WS_USERNAME / VITE_WS_PASSWORD when opts don't provide them.
        let wsOrigin = wsBase; // default (e.g. wss://host:port)
        const usernameFromEnv = (import.meta.env?.VITE_WS_USERNAME as string) ?? undefined;
        const passwordFromEnv = (import.meta.env?.VITE_WS_PASSWORD as string) ?? undefined;
        const usernameToUse = opts.username ?? usernameFromEnv ?? "";
        const passwordToUse = opts.password ?? passwordFromEnv ?? "";
        if (usernameToUse || passwordToUse) {
            try {
                const u = new URL(wsBase);
                // assign raw values; URL will handle encoding when we construct the authority
                u.username = usernameToUse;
                u.password = passwordToUse;
                // build origin with userinfo if present
                const userinfo = (u.username || u.password)
                    ? `${encodeURIComponent(u.username)}${u.password ? `:${encodeURIComponent(u.password)}` : ''}@`
                    : '';
                wsOrigin = `${u.protocol}//${userinfo}${u.host}`;
            } catch {
                // fall back to plain wsBase if URL parsing/assignment fails
                wsOrigin = wsBase;
            }
        }

        const wsUri = `${wsOrigin}/?${params.filter(Boolean).join("&")}`;
        const ws = new WebSocket(wsUri);
        ws.binaryType = "arraybuffer";
        this.ws = ws;

        const result = await new Promise<WebSocket>((resolve, reject) => {
            ws.onopen = (evt) => {
                try {
                    opts.onopen?.(ws, id, evt);
                    resolve(ws);
                } catch (e) {
                    reject(e);
                }
            };
            ws.onclose = (evt) => {
                try {
                    opts.onclose?.(ws, id, evt);
                } catch {
                    // ignore
                }
            };
            ws.onmessage = (evt) => {
                opts.onmessage?.(ws, id, evt);
            };
            ws.onerror = (evt) => {
                try {
                    opts.onerror?.(ws, id, evt);
                } catch {
                    // ignore
                }
            };
        });

        return result;
    }

    close() {
        try {
            this.ws?.close();
        } finally {
            this.ws = undefined;
        }
    }
}

export const streamingService = new StreamingService();
