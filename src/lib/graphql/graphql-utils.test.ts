import {describe, expect, it} from "vitest";
import {convertIdToObjectId} from "./graphql-utils.ts";

describe("convertIdToObjectId", () => {
    it("extracts a valid MongoDB object id from a GraphQL global id", () => {
        expect(convertIdToObjectId(btoa("AndroidFirmware:68d2c1f78773bc31564c1dab"))).toBe("68d2c1f78773bc31564c1dab");
    });

    it("rejects malformed and unexpected ids", () => {
        expect(convertIdToObjectId("not-base64%%%" )).toBe("");
        expect(convertIdToObjectId(btoa("AndroidFirmware:../../etc/passwd"))).toBe("");
    });
    it("preserves directly passed 24-character hexadecimal MongoDB ObjectIds", () => {
        const rawHex = "68d2c1f78773bc31564c1dab";
        expect(convertIdToObjectId(rawHex)).toBe(rawHex);
    });
});
