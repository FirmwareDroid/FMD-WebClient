import {describe, expect, it} from "vitest";
import {formatBreadcrumbSegment, safeDecodeRelayId} from "./breadcrumb-utils";

describe("safeDecodeRelayId", () => {
    it("should safely decode valid Relay IDs", () => {
        // btoa("AndroidFirmwareType:6abe0f0e2054afddb74d8fb7")
        const firmwareRelay = "QW5kcm9pZEZpcm13YXJlVHlwZTo2YWJlMGYwZTIwNTRhZmRkYjc0ZDhmYjc=";
        const result = safeDecodeRelayId(firmwareRelay);
        expect(result).not.toBeNull();
        expect(result?.friendlyType).toBe("Firmware");
        expect(result?.id).toBe("6abe0f0e2054afddb74d8fb7");
        expect(result?.shortLabel).toBe("Firmware #6abe0f");
    });

    it("should safely decode App Relay IDs", () => {
        // btoa("AndroidAppType:6abe0e1b2054afddb74d3cc9")
        const appRelay = "QW5kcm9pZEFwcFR5cGU6NmFiZTBlMWIyMDU0YWZkZGI3NGQzY2M5";
        const result = safeDecodeRelayId(appRelay);
        expect(result).not.toBeNull();
        expect(result?.friendlyType).toBe("App");
        expect(result?.id).toBe("6abe0e1b2054afddb74d3cc9");
        expect(result?.shortLabel).toBe("App #6abe0e");
    });

    it("should safely decode FirmwareFile Relay IDs", () => {
        // btoa("FirmwareFileType:6abe0de72054afddb74d312c")
        const fileRelay = "RmlybXdhcmVGaWxlVHlwZTo2YWJlMGRlNzIwNTRhZmRkYjc0ZDMxMmM=";
        const result = safeDecodeRelayId(fileRelay);
        expect(result).not.toBeNull();
        expect(result?.friendlyType).toBe("File");
        expect(result?.id).toBe("6abe0de72054afddb74d312c");
        expect(result?.shortLabel).toBe("File #6abe0d");
    });

    it("should handle raw 24-char hex ObjectIds", () => {
        const hexId = "6abe0de72054afddb74d312c";
        const result = safeDecodeRelayId(hexId);
        expect(result).not.toBeNull();
        expect(result?.id).toBe(hexId);
        expect(result?.shortLabel).toBe("#6abe0d");
    });

    it("should return null on invalid strings without throwing", () => {
        expect(safeDecodeRelayId("")).toBeNull();
        expect(safeDecodeRelayId("not-base64")).toBeNull();
        expect(safeDecodeRelayId("!!###")).toBeNull();
        // Valid base64 but not Relay format
        expect(safeDecodeRelayId(btoa("hello world"))).toBeNull();
    });
});

describe("formatBreadcrumbSegment", () => {
    it("should prioritize custom registered entity titles", () => {
        const titles = {
            "QW5kcm9pZEZpcm13YXJlVHlwZTo2YWJlMGYwZTIwNTRhZmRkYjc0ZDhmYjc=": "Pixel 6 Pro",
            "6abe0e1b2054afddb74d3cc9": "GoogleExtShared.apk",
        };

        const res1 = formatBreadcrumbSegment("QW5kcm9pZEZpcm13YXJlVHlwZTo2YWJlMGYwZTIwNTRhZmRkYjc0ZDhmYjc=", titles);
        expect(res1.label).toBe("Pixel 6 Pro");

        const res2 = formatBreadcrumbSegment("QW5kcm9pZEFwcFR5cGU6NmFiZTBlMWIyMDU0YWZkZGI3NGQzY2M5", titles);
        expect(res2.label).toBe("GoogleExtShared.apk");
    });

    it("should fall back to short label when no custom title is found", () => {
        const fileRelay = "RmlybXdhcmVGaWxlVHlwZTo2YWJlMGRlNzIwNTRhZmRkYjc0ZDMxMmM=";
        const res = formatBreadcrumbSegment(fileRelay, {});
        expect(res.label).toBe("File #6abe0d");
        expect(res.tooltip).toContain("File ID: 6abe0de72054afddb74d312c");
    });

    it("should format standard route names", () => {
        expect(formatBreadcrumbSegment("firmware", {}).label).toBe("Firmwares");
        expect(formatBreadcrumbSegment("apps", {}).label).toBe("Apps");
        expect(formatBreadcrumbSegment("files", {}).label).toBe("Files");
        expect(formatBreadcrumbSegment("reports", {}).label).toBe("Reports");
        expect(formatBreadcrumbSegment("scan-jobs", {}).label).toBe("Scan Jobs");
    });
});
