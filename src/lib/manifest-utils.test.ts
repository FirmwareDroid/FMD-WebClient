import { describe, expect, it } from "vitest";
import {
    getAndroidCodename,
    getXmlAttr,
    parseAndroidManifest,
    toSafeArray,
} from "./manifest-utils";

describe("manifest-utils", () => {
    describe("getAndroidCodename", () => {
        it("returns the correct version string for known SDK levels", () => {
            expect(getAndroidCodename(35)).toBe("Android 15 (Vanilla Ice Cream)");
            expect(getAndroidCodename("34")).toBe("Android 14 (Upside Down Cake)");
            expect(getAndroidCodename("28")).toBe("Android 9 (Pie)");
            expect(getAndroidCodename("14")).toBe("Android 4.0 (Ice Cream Sandwich)");
        });

        it("returns null for unknown, invalid, or missing SDK levels", () => {
            expect(getAndroidCodename(undefined)).toBeNull();
            expect(getAndroidCodename(null)).toBeNull();
            expect(getAndroidCodename("invalid")).toBeNull();
            expect(getAndroidCodename(999)).toBeNull();
        });
    });

    describe("getXmlAttr", () => {
        it("extracts attribute from various XML namespace prefixes", () => {
            expect(getXmlAttr({ "@ns0:package": "com.test.app" }, "package")).toBe("com.test.app");
            expect(getXmlAttr({ "@android:versionCode": "100" }, "versionCode")).toBe("100");
            expect(getXmlAttr({ "@targetSdkVersion": "33" }, "targetSdkVersion")).toBe("33");
            expect(getXmlAttr({ name: "plain" }, "name")).toBe("plain");
        });

        it("handles null or non-object values gracefully", () => {
            expect(getXmlAttr(null, "package")).toBeUndefined();
            expect(getXmlAttr(undefined, "package")).toBeUndefined();
            expect(getXmlAttr("string", "package")).toBeUndefined();
            expect(getXmlAttr([], "package")).toBeUndefined();
        });
    });

    describe("toSafeArray", () => {
        it("wraps single objects and preserves existing arrays", () => {
            expect(toSafeArray(null)).toEqual([]);
            expect(toSafeArray(undefined)).toEqual([]);
            expect(toSafeArray({ a: 1 })).toEqual([{ a: 1 }]);
            expect(toSafeArray([1, 2, 3])).toEqual([1, 2, 3]);
        });
    });

    describe("parseAndroidManifest", () => {
        it("returns null for empty, null, or invalid input", () => {
            expect(parseAndroidManifest(null)).toBeNull();
            expect(parseAndroidManifest(undefined)).toBeNull();
            expect(parseAndroidManifest("")).toBeNull();
            expect(parseAndroidManifest("{}")).toBeNull();
            expect(parseAndroidManifest({})).toBeNull();
            expect(parseAndroidManifest("invalid json")).toBeNull();
        });

        it("correctly parses a complex AndroidManifest structure", () => {
            const rawManifest = {
                manifest: {
                    "@package": "com.example.secureapp",
                    "@ns0:versionCode": "42",
                    "@ns0:versionName": "1.2.3",
                    "@ns0:sharedUserId": "android.uid.system",
                    "uses-sdk": {
                        "@ns0:minSdkVersion": "24",
                        "@ns0:targetSdkVersion": "34",
                    },
                    "uses-permission": [
                        { "@ns0:name": "android.permission.INTERNET" },
                        { "@ns0:name": "android.permission.RECORD_AUDIO" },
                    ],
                    permission: {
                        "@ns0:name": "com.example.CUSTOM_PERMISSION",
                        "@ns0:protectionLevel": "signature",
                    },
                    "uses-feature": [
                        { "@ns0:name": "android.hardware.camera", "@ns0:required": "false" },
                        { "@ns0:name": "android.hardware.touchscreen", "@ns0:required": "true" },
                    ],
                    application: {
                        "@ns0:label": "Secure App",
                        "@ns0:debuggable": "false",
                        "@ns0:allowBackup": "true",
                        "@ns0:usesCleartextTraffic": "false",
                        activity: [
                            {
                                "@ns0:name": "com.example.MainActivity",
                                "@ns0:exported": "true",
                                "intent-filter": {
                                    action: { "@ns0:name": "android.intent.action.MAIN" },
                                },
                            },
                            {
                                "@ns0:name": "com.example.InternalActivity",
                                "@ns0:exported": "false",
                            },
                        ],
                        service: {
                            "@ns0:name": "com.example.BackgroundService",
                            "@ns0:exported": "false",
                            "@ns0:permission": "android.permission.BIND_JOB_SERVICE",
                        },
                        receiver: [
                            {
                                "@ns0:name": "com.example.BootReceiver",
                                "@ns0:exported": "true",
                                "intent-filter": {
                                    action: [{ "@ns0:name": "android.intent.action.BOOT_COMPLETED" }],
                                },
                            },
                        ],
                        provider: {
                            "@ns0:name": "com.example.MyProvider",
                            "@ns0:authorities": "com.example.provider",
                            "@ns0:exported": "false",
                        },
                    },
                },
            };

            const parsed = parseAndroidManifest(rawManifest);
            expect(parsed).not.toBeNull();
            if (!parsed) return;

            expect(parsed.packageName).toBe("com.example.secureapp");
            expect(parsed.versionCode).toBe("42");
            expect(parsed.versionName).toBe("1.2.3");
            expect(parsed.minSdkVersion).toBe("24");
            expect(parsed.targetSdkVersion).toBe("34");
            expect(parsed.sharedUserId).toBe("android.uid.system");
            expect(parsed.appLabel).toBe("Secure App");
            expect(parsed.debuggable).toBe(false);
            expect(parsed.allowBackup).toBe(true);
            expect(parsed.usesCleartextTraffic).toBe(false);

            // Permissions
            expect(parsed.permissions).toHaveLength(2);
            expect(parsed.permissions[0]).toEqual({
                name: "android.permission.INTERNET",
                isDangerous: false,
                maxSdkVersion: undefined,
            });
            expect(parsed.permissions[1]).toEqual({
                name: "android.permission.RECORD_AUDIO",
                isDangerous: true,
                maxSdkVersion: undefined,
            });

            // Declared custom permission
            expect(parsed.declaredPermissions).toHaveLength(1);
            expect(parsed.declaredPermissions[0].name).toBe("com.example.CUSTOM_PERMISSION");
            expect(parsed.declaredPermissions[0].protectionLevel).toBe("signature");

            // Features
            expect(parsed.features).toHaveLength(2);
            expect(parsed.features[0]).toEqual({ name: "android.hardware.camera", required: false });
            expect(parsed.features[1]).toEqual({ name: "android.hardware.touchscreen", required: true });

            // Activities
            expect(parsed.activities).toHaveLength(2);
            expect(parsed.activities[0].name).toBe("com.example.MainActivity");
            expect(parsed.activities[0].exported).toBe(true);
            expect(parsed.activities[0].actions).toContain("android.intent.action.MAIN");
            expect(parsed.activities[1].exported).toBe(false);

            // Services
            expect(parsed.services).toHaveLength(1);
            expect(parsed.services[0].name).toBe("com.example.BackgroundService");
            expect(parsed.services[0].permission).toBe("android.permission.BIND_JOB_SERVICE");

            // Receivers
            expect(parsed.receivers).toHaveLength(1);
            expect(parsed.receivers[0].name).toBe("com.example.BootReceiver");
            expect(parsed.receivers[0].exported).toBe(true);
            expect(parsed.receivers[0].actions).toContain("android.intent.action.BOOT_COMPLETED");

            // Providers
            expect(parsed.providers).toHaveLength(1);
            expect(parsed.providers[0].name).toBe("com.example.MyProvider");
            expect(parsed.providers[0].authorities).toBe("com.example.provider");
        });

        it("parses JSON stringified input correctly", () => {
            const jsonString = JSON.stringify({
                manifest: {
                    "@package": "com.json.string.app",
                    "@ns0:versionName": "2.0.0",
                },
            });

            const parsed = parseAndroidManifest(jsonString);
            expect(parsed?.packageName).toBe("com.json.string.app");
            expect(parsed?.versionName).toBe("2.0.0");
        });
    });
});
