const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export type BackendTransport = "http" | "websocket";

export function normalizeBackendOrigin(value: string, transport: BackendTransport): string {
    let url: URL;
    try {
        url = new URL(value.trim());
    } catch {
        throw new Error("Enter a valid absolute backend URL.");
    }

    if (url.username || url.password) {
        throw new Error("Credentials must not be included in backend URLs.");
    }

    const isLocal = LOCAL_HOSTS.has(url.hostname);
    if (transport === "http") {
        if (url.protocol === "wss:") url.protocol = "https:";
        if (url.protocol === "ws:" && isLocal) url.protocol = "http:";
        if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
            throw new Error("Backend connections require HTTPS (HTTP is allowed only for localhost).");
        }
    } else {
        if (url.protocol === "https:") url.protocol = "wss:";
        if (url.protocol === "http:" && isLocal) url.protocol = "ws:";
        if (url.protocol !== "wss:" && !(isLocal && url.protocol === "ws:")) {
            throw new Error("Streaming connections require WSS (WS is allowed only for localhost).");
        }
    }

    return url.origin;
}
