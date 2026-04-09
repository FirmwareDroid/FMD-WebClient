import { describe, it, expect, beforeEach } from 'vitest';
import {
    setCredentials,
    getCredentials,
    getAuthToken,
    clearCredentials,
} from '@/services/adb-streamer/credentials';

// Clear module-level in-memory state and session storage before each test
beforeEach(() => {
    clearCredentials();
    sessionStorage.clear();
    localStorage.clear();
});

describe('setCredentials', () => {
    it('returns a Base64 encoded token for provided username/password', () => {
        const token = setCredentials('user', 'pass');
        expect(token).toBe(btoa('user:pass'));
    });

    it('stores token in session storage by default', () => {
        setCredentials('alice', 'secret');
        // After setting, getAuthToken should return the in-memory token
        expect(getAuthToken()).toBe(btoa('alice:secret'));
    });

    it('calls clearCredentials when both username and password are absent', () => {
        setCredentials('user', 'pass');
        const result = setCredentials(undefined, undefined);
        expect(result).toBeUndefined();
        expect(getCredentials()).toBeNull();
    });

    it('returns undefined when both username and password are empty strings (treated as absent)', () => {
        const result = setCredentials('', '');
        expect(result).toBeUndefined();
    });
});

describe('getCredentials', () => {
    it('returns null when nothing has been stored', () => {
        expect(getCredentials()).toBeNull();
    });

    it('returns in-memory credentials after setCredentials', () => {
        setCredentials('bob', 'pw123');
        const creds = getCredentials();
        expect(creds).not.toBeNull();
        expect(creds!.username).toBe('bob');
        expect(creds!.token).toBe(btoa('bob:pw123'));
    });
});

describe('getAuthToken', () => {
    it('returns undefined when no credentials are set', () => {
        expect(getAuthToken()).toBeUndefined();
    });

    it('returns the token from in-memory storage', () => {
        setCredentials('carol', 'p@ssw0rd');
        expect(getAuthToken()).toBe(btoa('carol:p@ssw0rd'));
    });
});

describe('clearCredentials', () => {
    it('clears in-memory credentials', () => {
        setCredentials('dave', 'xyz');
        clearCredentials();
        expect(getCredentials()).toBeNull();
    });

    it('clears session storage entries', () => {
        setCredentials('eve', 'abc');
        clearCredentials();
        // After clearing, getCredentials should return null even if session is checked
        expect(getCredentials()).toBeNull();
    });
});
