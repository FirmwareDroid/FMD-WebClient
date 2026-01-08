export class Storage {
    private localStorageImpl: globalThis.Storage | Record<string, string>;
    private sessionStorageImpl: globalThis.Storage | Record<string, string>;
    private cookieSource: { cookie?: string } | undefined;

    constructor() {
        // default in-memory fallbacks for SSR / unit tests
        this.localStorageImpl = {};
        this.sessionStorageImpl = {};
        this.cookieSource = undefined;

        if (typeof window !== "undefined" && window.localStorage) {
            this.localStorageImpl = window.localStorage;
            this.sessionStorageImpl = window.sessionStorage;
        }

        if (typeof document !== "undefined") {
            // document implements cookie as string
            // keep a minimal accessor shape to allow .cookie reads/writes
            this.cookieSource = document;
        }
    }

    private readFromStorage(store: globalThis.Storage | Record<string, string>, key: string): string | null {
        if (!store) return null;
        if (typeof (store as globalThis.Storage).getItem === "function") {
            return (store as globalThis.Storage).getItem(key);
        }
        return (store as Record<string, string>)[key] ?? null;
    }

    private writeToStorage(store: globalThis.Storage | Record<string, string>, key: string, value: string): void {
        if (!store) return;
        if (typeof (store as globalThis.Storage).setItem === "function") {
            (store as globalThis.Storage).setItem(key, value);
            return;
        }
        (store as Record<string, string>)[key] = value;
    }

    private removeFromStorage(store: globalThis.Storage | Record<string, string>, key: string): void {
        if (!store) return;
        if (typeof (store as globalThis.Storage).removeItem === "function") {
            (store as globalThis.Storage).removeItem(key);
            return;
        }
        delete (store as Record<string, string>)[key];
    }

    private parseCookieValue(key: string): string | null {
        const cookieStr = this.cookieSource?.cookie ?? "";
        if (!cookieStr) return null;
        const parts = cookieStr.split(";").map((p) => p.trim());
        for (const part of parts) {
            if (part.startsWith(`${key}=`)) {
                return part.replace(`${key}=`, "");
            }
        }
        return null;
    }

    get(key: string): string | null {
        const cookieVal = this.parseCookieValue(key);
        if (cookieVal) return cookieVal;
        const sessionVal = this.readFromStorage(this.sessionStorageImpl, key);
        if (sessionVal) return sessionVal;
        return this.readFromStorage(this.localStorageImpl, key);
    }

    getSession(key: string): string | null {
        return this.readFromStorage(this.sessionStorageImpl, key);
    }

    getLocal(key: string): string | null {
        return this.readFromStorage(this.localStorageImpl, key);
    }

    setSession(key: string, value: string): void {
        this.writeToStorage(this.sessionStorageImpl, key, value);
    }

    setLocal(key: string, value: string): void {
        this.writeToStorage(this.localStorageImpl, key, value);
    }

    removeSession(key: string): void {
        this.removeFromStorage(this.sessionStorageImpl, key);
    }

    removeLocal(key: string): void {
        this.removeFromStorage(this.localStorageImpl, key);
    }

    getCookie(key: string): string | null {
        return this.parseCookieValue(key);
    }

    // simple cookie setter (optional expiresDays)
    setCookie(key: string, value: string, days?: number): void {
        if (!this.cookieSource) return;
        let cookie = `${key}=${value}; path=/;`;
        if (typeof days === "number") {
            const expires = new Date();
            expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
            cookie += ` expires=${expires.toUTCString()};`;
        }
        // write to document.cookie if available
        try {
            (this.cookieSource as any).cookie = cookie;
        } catch {
            // ignore
        }
    }
}

export const storage = new Storage();
