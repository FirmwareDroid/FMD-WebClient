import {v4 as uuid} from "uuid";
import {normalizeBackendOrigin} from "../endpoint-security.ts";

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
};

export class StreamingService {
    private ws?: WebSocket;
    private defaultBackendBase: string;

    constructor(defaultBase?: string) {
        this.defaultBackendBase = defaultBase || (import.meta.env?.VITE_BACKEND_WS_URL as string) || "https://localhost:9001";
    }

    private normalizeToWsBase(base: string): string {
        if (!base) throw new Error("Missing backend base URL.");
        return normalizeBackendOrigin(base, "websocket");
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

        const wsUri = `${wsBase}/?${params.filter(Boolean).join("&")}`;
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
