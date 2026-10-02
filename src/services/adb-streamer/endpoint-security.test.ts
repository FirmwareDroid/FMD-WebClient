import {describe, expect, it} from "vitest";
import {normalizeBackendOrigin} from "./endpoint-security.ts";

describe("normalizeBackendOrigin", () => {
    it("normalizes secure HTTP and WebSocket origins", () => {
        expect(normalizeBackendOrigin("https://example.test/path", "http")).toBe("https://example.test");
        expect(normalizeBackendOrigin("https://example.test/path", "websocket")).toBe("wss://example.test");
    });

    it("allows insecure transports only on localhost", () => {
        expect(normalizeBackendOrigin("http://localhost:9001", "websocket")).toBe("ws://localhost:9001");
        expect(() => normalizeBackendOrigin("http://example.test", "http")).toThrow(/HTTPS/);
    });

    it("rejects embedded credentials and unsafe protocols", () => {
        expect(() => normalizeBackendOrigin("https://user:secret@example.test", "http")).toThrow(/Credentials/);
        expect(() => normalizeBackendOrigin("javascript:alert(1)", "websocket")).toThrow(/WSS/);
    });
});
