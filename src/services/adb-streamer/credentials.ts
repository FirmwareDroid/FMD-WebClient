import { storage } from './storage';
import { accessToken } from '@/services/adb-streamer/utils/constants';

const CRED_TOKEN_KEY = accessToken || 'adb:auth_token';
const CRED_USER_KEY = 'adb:username';

let inMemory: { username?: string; password?: string; token?: string } = {};

export function setCredentials(username?: string, password?: string, persist = true): string | undefined {
    if (!username && !password) {
        clearCredentials();
        return undefined;
    }
    const u = username ?? '';
    const p = password ?? '';
    const token = typeof window !== 'undefined' ? btoa(`${u}:${p}`) : Buffer.from(`${u}:${p}`).toString('base64');
    inMemory = { username: u, password: p, token };

    // optional persistence: store token and username in session storage
    if (persist) {
        try {
            storage.setSession(CRED_TOKEN_KEY, token);
            if (u) storage.setSession(CRED_USER_KEY, u);
        } catch (e) {
            // ignore
        }
    }
    return token;
}

export function getCredentials(): { username?: string; password?: string; token?: string } | null {
    if (inMemory && (inMemory.token || inMemory.username)) return inMemory;
    try {
        const token = storage.getSession(CRED_TOKEN_KEY) || storage.getLocal(CRED_TOKEN_KEY);
        const username = storage.getSession(CRED_USER_KEY) || storage.getLocal(CRED_USER_KEY);
        if (token) {
            inMemory = { username: username ?? undefined, token };
            return inMemory;
        }
    } catch (e) {
        // ignore
    }
    return null;
}

export function getAuthToken(): string | undefined {
    if (inMemory && inMemory.token) return inMemory.token;
    const cred = getCredentials();
    return cred?.token;
}

export function clearCredentials() {
    inMemory = {};
    try {
        storage.removeSession(CRED_TOKEN_KEY);
        storage.removeSession(CRED_USER_KEY);
    } catch (e) {}
}
