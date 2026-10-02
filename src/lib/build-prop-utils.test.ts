import { describe, expect, it } from "vitest";
import {
    normalizePropKey,
    categorizeProperty,
    extractBuildPropHighlights,
    formatRawBuildProps,
    parseBuildPropDictionary,
} from "./build-prop-utils";

describe("build-prop-utils", () => {
    it("normalizes underscore keys back to standard Android dot notation", () => {
        expect(normalizePropKey("ro_build_version_release")).toBe("ro.build.version.release");
        expect(normalizePropKey("ro_product_system_model")).toBe("ro.product.system.model");
        expect(normalizePropKey("dalvik_vm_heapsize")).toBe("dalvik.vm.heapsize");
        expect(normalizePropKey("persist_sys_usb_config")).toBe("persist.sys.usb.config");
    });

    it("identifies critical security risks correctly", () => {
        const debuggable = categorizeProperty("ro_debuggable", "1");
        expect(debuggable.category).toBe("security");
        expect(debuggable.isSecuritySensitive).toBe(true);
        expect(debuggable.securitySeverity).toBe("critical");

        const insecure = categorizeProperty("ro_secure", "0");
        expect(insecure.securitySeverity).toBe("critical");

        const unauthAdb = categorizeProperty("ro_adb_secure", "0");
        expect(unauthAdb.securitySeverity).toBe("critical");

        const testKeys = categorizeProperty("ro_build_tags", "test-keys");
        expect(testKeys.securitySeverity).toBe("warning");

        const secureBuild = categorizeProperty("ro_debuggable", "0");
        expect(secureBuild.securitySeverity).toBe("info");
    });

    it("categorizes properties by domain", () => {
        expect(categorizeProperty("ro_product_brand", "Google").category).toBe("device");
        expect(categorizeProperty("ro_sys_cputype", "QuadCore-H313").category).toBe("device");
        expect(categorizeProperty("ro_build_version_sdk", "29").category).toBe("os_build");
        expect(categorizeProperty("dalvik_vm_heapgrowthlimit", "128m").category).toBe("runtime");
        expect(categorizeProperty("persist_sys_timezone", "UTC").category).toBe("system");
    });

    it("extracts highlights from a properties dictionary", () => {
        const props = {
            ro_debuggable: "1",
            ro_secure: "1",
            ro_adb_secure: "0",
            ro_build_tags: "test-keys",
            ro_build_type: "userdebug",
            ro_build_version_security_patch: "2023-02-05",
            ro_build_version_release: "10",
            ro_build_version_sdk: "29",
            ro_product_system_brand: "Google",
            ro_product_system_model: "Pixel 4",
            ro_product_cpu_abi: "armeabi-v7a",
            ro_system_build_fingerprint: "google/flame/flame:10/QP1A.../test-keys",
            ro_build_date: "Tue Jan 27 09:31:44 CST 2026",
        };

        const highlights = extractBuildPropHighlights(props);
        expect(highlights.debuggable?.isRisk).toBe(true);
        expect(highlights.secure?.isRisk).toBe(false);
        expect(highlights.adbSecure?.isRisk).toBe(true);
        expect(highlights.buildTags?.isTestKeys).toBe(true);
        expect(highlights.buildType).toBe("userdebug");
        expect(highlights.securityPatch).toBe("2023-02-05");
        expect(highlights.androidVersion).toBe("10");
        expect(highlights.sdkVersion).toBe("29");
        expect(highlights.brand).toBe("Google");
        expect(highlights.model).toBe("Pixel 4");
        expect(highlights.cpuAbi).toBe("armeabi-v7a");
        expect(highlights.fingerprint).toContain("flame");
    });

    it("formats raw build.prop text with comments and sorted keys", () => {
        const props = {
            ro_build_id: "QP1A.191105.004",
            dalvik_vm_heapsize: "256m",
            net_bt_name: "Android",
        };

        const raw = formatRawBuildProps(props, "/system/build.prop");
        expect(raw).toContain("# /system/build.prop");
        expect(raw).toContain("dalvik.vm.heapsize=256m");
        expect(raw).toContain("net.bt.name=Android");
        expect(raw).toContain("ro.build.id=QP1A.191105.004");

        // Verify alphabetical order
        const dalvikIdx = raw.indexOf("dalvik.vm.heapsize");
        const netIdx = raw.indexOf("net.bt.name");
        const roIdx = raw.indexOf("ro.build.id");
        expect(dalvikIdx).toBeLessThan(netIdx);
        expect(netIdx).toBeLessThan(roIdx);
    });

    it("parses and sorts dictionary into ParsedPropItem objects", () => {
        const props = {
            ro_debuggable: "1",
            ro_product_model: "Demo",
        };

        const items = parseBuildPropDictionary(props);
        expect(items.length).toBe(2);
        expect(items[0].displayKey).toBe("ro.debuggable");
        expect(items[0].category).toBe("security");
        expect(items[1].displayKey).toBe("ro.product.model");
        expect(items[1].category).toBe("device");
    });
});
