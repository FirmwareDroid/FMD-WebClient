import { describe, it, expect, beforeEach } from 'vitest';
import { setBackendBaseUrl, setAuthToken, apiClient } from '@/services/adb-streamer/http-client';

const originalBaseURL = apiClient.defaults.baseURL;

beforeEach(() => {
    // restore base URL and remove auth header between tests
    apiClient.defaults.baseURL = originalBaseURL;
    delete (apiClient.defaults.headers as Record<string, unknown>)['Authorization'];
});

describe('setBackendBaseUrl', () => {
    it('sets the base URL with /api suffix', () => {
        setBackendBaseUrl('http://example.com');
        expect(apiClient.defaults.baseURL).toBe('http://example.com/api');
    });

    it('handles a URL with trailing slash', () => {
        setBackendBaseUrl('http://example.com/');
        expect(apiClient.defaults.baseURL).toBe('http://example.com/api');
    });

    it('handles https scheme', () => {
        setBackendBaseUrl('https://secure.host:8443');
        expect(apiClient.defaults.baseURL).toBe('https://secure.host:8443/api');
    });

    it('converts ws:// to http://', () => {
        setBackendBaseUrl('ws://ws-host:1234');
        expect(apiClient.defaults.baseURL).toBe('http://ws-host:1234/api');
    });

    it('converts wss:// to https://', () => {
        setBackendBaseUrl('wss://ws-host:1234');
        expect(apiClient.defaults.baseURL).toBe('https://ws-host:1234/api');
    });

    it('sets Authorization header when credentials are embedded in URL', () => {
        setBackendBaseUrl('http://user:pass@example.com');
        const auth = (apiClient.defaults.headers as Record<string, unknown>)['Authorization'] as string;
        expect(auth).toBe(`Basic ${btoa('user:pass')}`);
    });

    it('does not set Authorization header when no credentials in URL', () => {
        setBackendBaseUrl('http://example.com');
        expect((apiClient.defaults.headers as Record<string, unknown>)['Authorization']).toBeUndefined();
    });

    it('throws on an invalid URL', () => {
        expect(() => setBackendBaseUrl('not-a-url')).toThrow('Invalid URL');
    });

    it('is a no-op for empty string', () => {
        const before = apiClient.defaults.baseURL;
        setBackendBaseUrl('');
        expect(apiClient.defaults.baseURL).toBe(before);
    });
});

describe('setAuthToken', () => {
    it('sets Authorization header when token is provided', () => {
        setAuthToken('Bearer mytoken');
        expect((apiClient.defaults.headers as Record<string, unknown>)['Authorization']).toBe('Bearer mytoken');
    });

    it('removes Authorization header when token is undefined', () => {
        (apiClient.defaults.headers as Record<string, unknown>)['Authorization'] = 'Bearer old';
        setAuthToken(undefined);
        expect((apiClient.defaults.headers as Record<string, unknown>)['Authorization']).toBeUndefined();
    });
});
