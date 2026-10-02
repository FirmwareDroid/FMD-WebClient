import { describe, expect, it } from "vitest";
import {
    extractApkidFindings,
    extractApkleaksFindings,
    extractExodusFindings,
    extractInterestingFindings,
    extractTruffleHogFindings,
    normalizeSeverity,
    parseReportResults,
    sanitizeExternalUrl,
} from "./report-utils";

describe("report-utils", () => {
    describe("parseReportResults", () => {
        it("handles null, undefined, and empty objects safely", () => {
            expect(parseReportResults(null).isEmpty).toBe(true);
            expect(parseReportResults(undefined).isEmpty).toBe(true);
            expect(parseReportResults("{}").isEmpty).toBe(true);
            expect(parseReportResults("   ").isEmpty).toBe(true);
        });

        it("parses valid JSON strings safely", () => {
            const result = parseReportResults('{"summary": {"verified_secrets": 2}}');
            expect(result.isEmpty).toBe(false);
            expect(result.data.summary.verified_secrets).toBe(2);
        });

        it("handles invalid JSON string as raw output", () => {
            const result = parseReportResults("Scanner finished with code 0");
            expect(result.data.rawOutput).toBe("Scanner finished with code 0");
            expect(result.isError).toBe(false);
        });

        it("detects error fields in scanner output", () => {
            const result = parseReportResults({ error: "Failed to decompile APK" });
            expect(result.isError).toBe(true);
            expect(result.errorMessage).toBe("Failed to decompile APK");
        });
    });

    describe("sanitizeExternalUrl", () => {
        it("allows safe http and https URLs", () => {
            expect(sanitizeExternalUrl("https://example.com/tracker")).toBe("https://example.com/tracker");
            expect(sanitizeExternalUrl("http://tracker.org")).toBe("http://tracker.org/");
        });

        it("rejects javascript: and invalid URLs", () => {
            expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
            expect(sanitizeExternalUrl("data:text/html,malicious")).toBeNull();
            expect(sanitizeExternalUrl("not-a-url")).toBeNull();
            expect(sanitizeExternalUrl(null)).toBeNull();
        });
    });

    describe("normalizeSeverity", () => {
        it("classifies severity levels accurately", () => {
            expect(normalizeSeverity("Critical")).toBe("critical");
            expect(normalizeSeverity("HIGH_SEVERITY")).toBe("high");
            expect(normalizeSeverity("medium")).toBe("medium");
            expect(normalizeSeverity("low")).toBe("low");
            expect(normalizeSeverity("info")).toBe("info");
            expect(normalizeSeverity("anything-else")).toBe("unknown");
        });
    });

    describe("extractTruffleHogFindings", () => {
        it("extracts summary counters and findings correctly", () => {
            const data = {
                summary: {
                    verified_secrets: 1,
                    unverified_secrets: 4,
                    chunks: 10,
                    bytes: 5000,
                    scan_duration: "250ms",
                },
                scan_mode: "lightweight",
                findings: {
                    AWS: [
                        { verified: true, raw: "AKIA1234567890", file: "AndroidManifest.xml", line: 42 },
                    ],
                },
            };
            const extracted = extractTruffleHogFindings(data);
            expect(extracted.summary.verifiedSecrets).toBe(1);
            expect(extracted.summary.unverifiedSecrets).toBe(4);
            expect(extracted.findings).toHaveLength(1);
            expect(extracted.findings[0].detectorType).toBe("AWS");
            expect(extracted.findings[0].verified).toBe(true);
        });
    });

    describe("extractApkleaksFindings", () => {
        it("groups patterns and filters out empty results", () => {
            const data = {
                "Google API Key": ["AIzaSyA...", "AIzaSyB..."],
                "AWS Key": "AKIA...",
                empty: [],
            };
            const extracted = extractApkleaksFindings(data);
            expect(extracted).toHaveLength(2);
            expect(extracted[0].patternName).toBe("Google API Key");
            expect(extracted[0].matches).toHaveLength(2);
            expect(extracted[1].patternName).toBe("AWS Key");
            expect(extracted[1].matches).toHaveLength(1);
        });
    });

    describe("extractExodusFindings", () => {
        it("extracts trackers with sanitized URLs", () => {
            const data = {
                trackers: [
                    {
                        name: "Google CrashLytics",
                        categories: ["Crash reporting"],
                        website: "https://firebase.google.com",
                    },
                    {
                        name: "Malicious Tracker",
                        website: "javascript:alert(1)",
                    },
                ],
                permissions: ["android.permission.INTERNET"],
            };
            const extracted = extractExodusFindings(data);
            expect(extracted.trackers).toHaveLength(2);
            expect(extracted.trackers[0].website).toBe("https://firebase.google.com/");
            expect(extracted.trackers[1].website).toBeUndefined();
            expect(extracted.permissions).toContain("android.permission.INTERNET");
        });
    });

    describe("extractApkidFindings", () => {
        it("extracts protections per file", () => {
            const data = {
                files: {
                    "classes.dex": {
                        compiler: ["dexlib 2.x"],
                        anti_debug: [],
                        anti_vm: [],
                    },
                },
            };
            const extracted = extractApkidFindings(data);
            expect(extracted).toHaveLength(1);
            expect(extracted[0].filename).toBe("classes.dex");
            expect(extracted[0].compilers).toContain("dexlib 2.x");
        });
    });

    describe("extractInterestingFindings", () => {
        it("extracts and prioritizes findings from multiple scanner outputs", () => {
            const reports = [
                {
                    pk: "report-th-1",
                    scannerName: "TruffleHog",
                    results: JSON.stringify({
                        findings: [
                            {
                                detector_type: "AWS",
                                verified: true,
                                raw: "AKIA1234567890",
                                file: "src/config.json",
                                line: 12,
                            },
                            {
                                detector_type: "Slack",
                                verified: false,
                                raw: "xoxb-1234567890",
                                file: "res/values/strings.xml",
                            },
                        ],
                    }),
                    androidAppIdReference: {
                        pk: "app-123",
                        filename: "test-app.apk",
                    },
                },
                {
                    pk: "report-apkleaks-1",
                    scannerName: "APKLeaks",
                    results: JSON.stringify({
                        "Google API Key": ["AIzaSyA1234567890"],
                    }),
                    androidAppIdReference: {
                        pk: "app-123",
                        filename: "test-app.apk",
                    },
                },
                {
                    pk: "report-apkid-1",
                    scannerName: "APKiD",
                    results: JSON.stringify({
                        files: {
                            "classes.dex": {
                                packer: ["SecShell"],
                                anti_debug: ["pids_tracer"],
                            },
                        },
                    }),
                },
                {
                    pk: "report-mobsf-1",
                    scannerName: "MobSFScan",
                    results: JSON.stringify({
                        results: {
                            debuggable: {
                                metadata: {
                                    severity: "high",
                                    description: "App is debuggable",
                                    cwe: "CWE-215",
                                },
                            },
                        },
                    }),
                },
            ];

            const findings = extractInterestingFindings(reports);
            expect(findings.length).toBeGreaterThanOrEqual(4);

            // Verified secret must be critical and ranked first
            expect(findings[0].severity).toBe("critical");
            expect(findings[0].title).toContain("Verified Secret: AWS");
            expect(findings[0].location).toBe("src/config.json:12");

            // High severity items (APKLeaks, APKiD packer, MobSF high)
            const highFindings = findings.filter(f => f.severity === "high");
            expect(highFindings.length).toBeGreaterThanOrEqual(2);
            expect(highFindings.some(f => f.title.includes("Exposed Pattern"))).toBe(true);
            expect(highFindings.some(f => f.title.includes("Packer Detected"))).toBe(true);

            // Medium severity items (unverified secrets, anti-debug)
            const medFindings = findings.filter(f => f.severity === "medium");
            expect(medFindings.some(f => f.title.includes("Unverified Secret"))).toBe(true);
            expect(medFindings.some(f => f.title.includes("Anti-Debug"))).toBe(true);
        });

        it("handles empty or null reports gracefully", () => {
            expect(extractInterestingFindings(null)).toEqual([]);
            expect(extractInterestingFindings([])).toEqual([]);
            expect(extractInterestingFindings([{ results: "{}" }])).toEqual([]);
        });
    });

});
