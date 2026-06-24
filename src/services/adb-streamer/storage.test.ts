import { describe, it, expect, beforeEach } from 'vitest';
import { Storage } from '@/services/adb-streamer/storage';

describe('Storage (in-memory fallback, no window)', () => {
    let store: Storage;

    beforeEach(() => {
        store = new Storage();
        // Clear jsdom storage between tests (Storage constructor uses real
        // localStorage/sessionStorage when window is defined)
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('local storage', () => {
        it('setLocal / getLocal round-trips a value', () => {
            store.setLocal('myKey', 'myValue');
            expect(store.getLocal('myKey')).toBe('myValue');
        });

        it('getLocal returns null for unknown key', () => {
            expect(store.getLocal('missing')).toBeNull();
        });

        it('removeLocal deletes the key', () => {
            store.setLocal('k', 'v');
            store.removeLocal('k');
            expect(store.getLocal('k')).toBeNull();
        });
    });

    describe('session storage', () => {
        it('setSession / getSession round-trips a value', () => {
            store.setSession('sk', 'sv');
            expect(store.getSession('sk')).toBe('sv');
        });

        it('getSession returns null for unknown key', () => {
            expect(store.getSession('unknown')).toBeNull();
        });

        it('removeSession deletes the key', () => {
            store.setSession('sk', 'sv');
            store.removeSession('sk');
            expect(store.getSession('sk')).toBeNull();
        });
    });

    describe('get() priority: cookie > session > local', () => {
        it('returns session value when no cookie is set', () => {
            store.setSession('key', 'session-val');
            store.setLocal('key', 'local-val');
            expect(store.get('key')).toBe('session-val');
        });

        it('returns local value when neither cookie nor session has the key', () => {
            store.setLocal('key', 'local-only');
            expect(store.get('key')).toBe('local-only');
        });

        it('returns null when no storage has the key', () => {
            expect(store.get('no-such-key')).toBeNull();
        });
    });

    describe('cookie operations (no document)', () => {
        it('getCookie returns null when no cookie source is available', () => {
            // In the in-memory fallback, cookieSource is undefined so no cookies
            expect(store.getCookie('anything')).toBeNull();
        });

        it('setCookie is a no-op when no cookie source is available', () => {
            // Should not throw
            expect(() => store.setCookie('key', 'val', 7)).not.toThrow();
        });
    });
});

describe('Storage with real localStorage/sessionStorage (jsdom)', () => {
    let store: Storage;

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        store = new Storage();
    });

    it('setLocal persists to window.localStorage', () => {
        store.setLocal('lkey', 'lval');
        expect(localStorage.getItem('lkey')).toBe('lval');
    });

    it('getLocal reads from window.localStorage', () => {
        localStorage.setItem('lkey2', 'lval2');
        expect(store.getLocal('lkey2')).toBe('lval2');
    });

    it('removeLocal removes from window.localStorage', () => {
        localStorage.setItem('rmKey', 'rmVal');
        store.removeLocal('rmKey');
        expect(localStorage.getItem('rmKey')).toBeNull();
    });

    it('setSession persists to window.sessionStorage', () => {
        store.setSession('skey', 'sval');
        expect(sessionStorage.getItem('skey')).toBe('sval');
    });

    it('getSession reads from window.sessionStorage', () => {
        sessionStorage.setItem('skey2', 'sval2');
        expect(store.getSession('skey2')).toBe('sval2');
    });

    it('removeSession removes from window.sessionStorage', () => {
        sessionStorage.setItem('rmS', 'v');
        store.removeSession('rmS');
        expect(sessionStorage.getItem('rmS')).toBeNull();
    });
});
