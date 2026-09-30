import {storage} from "./storage.ts";
import {accessToken} from "./utils/constants.js";

let inMemory: { username?: string; password?: string; token?: string } = {};

function clearLegacyCredentialStorage(): void {
    [accessToken, "adb:auth_token", "adb:username", "adbBackendUser", "adbBackendPass"].forEach(key => {
        storage.removeSession(key);
        storage.removeLocal(key);
    });
}

clearLegacyCredentialStorage();

export function setCredentials(username?: string, password?: string, _persist = false): string | undefined {
    if (!username && !password) {
        clearCredentials();
        return undefined;
    }
    const u = username ?? '';
    const p = password ?? '';
    const token = typeof window !== 'undefined' ? btoa(`${u}:${p}`) : Buffer.from(`${u}:${p}`).toString('base64');
    inMemory = { username: u, password: p, token };

    return token;
}

export function getCredentials(): { username?: string; password?: string; token?: string } | null {
    if (inMemory && (inMemory.token || inMemory.username)) return inMemory;
    return null;
}

export function getAuthToken(): string | undefined {
    if (inMemory && inMemory.token) return inMemory.token;
    const cred = getCredentials();
    return cred?.token;
}

export function clearCredentials() {
    inMemory = {};
    clearLegacyCredentialStorage();
}
