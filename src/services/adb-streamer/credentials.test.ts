import {beforeEach, describe, expect, it, vi} from "vitest";
import {clearCredentials, getCredentials, setCredentials} from "./credentials.ts";

describe("emulator credentials", () => {
    beforeEach(() => {
        clearCredentials();
    });

    it("keeps credentials in memory only", () => {
        const storageWrite = vi.spyOn(Storage.prototype, "setItem");
        setCredentials("operator", "secret", true);
        expect(getCredentials()?.username).toBe("operator");
        expect(storageWrite).not.toHaveBeenCalled();
    });

    it("clears in-memory credentials", () => {
        setCredentials("operator", "secret");
        clearCredentials();
        expect(getCredentials()).toBeNull();
    });
});
