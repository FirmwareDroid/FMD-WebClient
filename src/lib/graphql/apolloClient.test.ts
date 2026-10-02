import {beforeEach, describe, expect, it, vi} from "vitest";
import {clearCachedCsrf, customFetch, getCsrf} from "./apolloClient.ts";

const csrfResponse = () => new Response(JSON.stringify({csrfToken: "secure-token"}), {
    status: 200,
    headers: {"Content-Type": "application/json"},
});

describe("Apollo request security", () => {
    beforeEach(() => clearCachedCsrf());

    it("rejects invalid CSRF responses", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", {
            status: 200,
            headers: {"Content-Type": "application/json"},
        })));
        await expect(getCsrf()).rejects.toThrow(/invalid security token/i);
    });

    it("does not retry unrelated authorization failures", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(csrfResponse())
            .mockResolvedValueOnce(new Response("Permission denied", {status: 403}));
        vi.stubGlobal("fetch", fetchMock);

        const response = await customFetch("https://fmd.localhost/graphql/", {method: "POST"});
        expect(response.status).toBe(403);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("refreshes the token and retries one confirmed CSRF rejection", async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(csrfResponse())
            .mockResolvedValueOnce(new Response("CSRF verification failed", {status: 403}))
            .mockResolvedValueOnce(csrfResponse())
            .mockResolvedValueOnce(new Response("ok", {status: 200}));
        vi.stubGlobal("fetch", fetchMock);

        const response = await customFetch("https://fmd.localhost/graphql/", {method: "POST"});
        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(4);
    });
});
