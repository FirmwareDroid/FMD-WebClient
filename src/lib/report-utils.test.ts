import { describe, expect, it } from "vitest";
import {
    aggregateFirmwareAppRisks,
    classifyFindingCategory,
    extractApkidFindings,
    extractApkleaksFindings,
    extractExodusFindings,
    extractInterestingFindings,
    extractTruffleHogFindings,
    getFindingCategoryMeta,
    isSafeInternalReturnPath,
    isSafeRouteId,
    isSafeScannerName,
    normalizeSeverity,
    parseReportResults,
    sanitizeExternalUrl,
    resolveFindingDescription,
    sortFindingsBySeverity,
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

    describe("resolveFindingDescription", () => {
        it("returns direct description when present", () => {
            const desc = resolveFindingDescription({
                description: "Application is debuggable",
                synopsis: "Debug flag set",
                sig: "security-log",
            });
            expect(desc).toBe("Application is debuggable");
        });

        it("falls back to synopsis when description is null or empty", () => {
            const desc = resolveFindingDescription({
                description: null,
                synopsis: "Application data can be backed up and restored.",
                sig: "manifest-manip-backup",
            });
            expect(desc).toBe("Application data can be backed up and restored.");
        });

        it("falls back to curated knowledge base for known TrueSeeing signatures", () => {
            expect(
                resolveFindingDescription({
                    description: null,
                    synopsis: null,
                    sig: "privacy-device-id",
                })
            ).toContain("Potential privacy concern");

            expect(
                resolveFindingDescription({
                    description: null,
                    synopsis: null,
                    sig: "detect-obfuscator",
                })
            ).toContain("Lack of code obfuscation");

            expect(
                resolveFindingDescription({
                    description: null,
                    synopsis: null,
                    sig: "security-log",
                })
            ).toContain("Diagnostic and debug logging detected");
        });

        it("falls back to instances sample when signature is unknown", () => {
            const desc = resolveFindingDescription({
                description: null,
                synopsis: null,
                sig: "custom-sig-xyz",
                summary: "Custom Check",
                instances: [
                    { info: "found matching pattern at row 42", source: "com/example/Test.java" },
                    { info: "found matching pattern at row 88", source: "com/example/Test2.java" },
                ],
            });
            expect(desc).toContain("Custom Check: 2 instance(s) detected");
            expect(desc).toContain("found matching pattern at row 42");
        });

        it("falls back to solution when only solution is available", () => {
            const desc = resolveFindingDescription({
                description: null,
                synopsis: null,
                solution: "Set android:allowBackup to false in manifest.\nDetails here...",
            });
            expect(desc).toBe("Recommended remediation: Set android:allowBackup to false in manifest.");
        });

        it("falls back to summary and signature when nothing else is present", () => {
            expect(
                resolveFindingDescription({
                    description: null,
                    summary: "Unusual Export",
                })
            ).toBe("Unusual Export detected during static analysis.");

            expect(
                resolveFindingDescription({
                    description: null,
                    sig: "unknown-sig-999",
                })
            ).toBe("Issue identified by rule signature: unknown-sig-999");

            expect(resolveFindingDescription({})).toBe("No description provided by scanner.");
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
        it("extracts protections per file (legacy dictionary format)", () => {
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

        it("extracts protections from standard APKiD array format with matches", () => {
            const data = {
                apkid_version: "3.1.0",
                rules_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                files: [
                    {
                        filename: "/var/www/.../FT313.apk",
                        matches: {
                            file_type: ["APK"],
                        },
                    },
                    {
                        filename: "/var/www/.../FT313.apk!classes.dex",
                        matches: {
                            file_type: ["DEX"],
                            anti_vm: ["Build.MANUFACTURER check", "Build.BOARD check"],
                            anti_disassembly: ["illegal class name"],
                            compiler: ["r8"],
                            packer: ["SecShell"],
                            manipulator: ["dx"],
                            dropper: ["Dropper.A"],
                        },
                    },
                    {
                        filename: "/var/www/.../FT313.apk!resources.arsc",
                        matches: {
                            file_type: ["RES"],
                        },
                    },
                ],
            };

            const extracted = extractApkidFindings(data);
            expect(extracted).toHaveLength(3);

            // File 0: APK
            expect(extracted[0].filename).toBe("/var/www/.../FT313.apk");
            expect(extracted[0].compilers).toEqual([]);
            expect(extracted[0].antiVm).toEqual([]);
            expect(extracted[0].other.file_type).toEqual(["APK"]);

            // File 1: DEX with compiler and anti_vm
            expect(extracted[1].filename).toBe("/var/www/.../FT313.apk!classes.dex");
            expect(extracted[1].compilers).toEqual(["r8"]);
            expect(extracted[1].antiVm).toEqual(["Build.MANUFACTURER check", "Build.BOARD check"]);
            expect(extracted[1].antiDisassembly).toEqual(["illegal class name"]);
            expect(extracted[1].packers).toEqual(["SecShell"]);
            expect(extracted[1].manipulators).toEqual(["dx"]);
            expect(extracted[1].droppers).toEqual(["Dropper.A"]);
            expect(extracted[1].other.file_type).toEqual(["DEX"]);

            // File 2: RES
            expect(extracted[2].filename).toBe("/var/www/.../FT313.apk!resources.arsc");
            expect(extracted[2].other.file_type).toEqual(["RES"]);
        });
    });

    describe("extractInterestingFindings", () => {
        it("extracts and prioritizes findings from multiple scanner outputs", () => {
            const reports = [
                {
                    pk: "report-apkid-1",
                    scannerName: "APKiD",
                    results: JSON.stringify({
                        files: [
                            {
                                filename: "app.apk!classes.dex",
                                matches: {
                                    anti_vm: ["Build.MANUFACTURER check", "Build.BOARD check"],
                                    anti_disassembly: ["invalid instruction"],
                                    compiler: ["r8"],
                                },
                            },
                        ],
                    }),
                },
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

            // Verified secret must be high severity and ranked among high items
            expect(findings[0].severity).toBe("high");
            expect(findings.some(f => f.title.includes("Verified Secret: AWS") && f.location === "src/config.json:12")).toBe(true);

            // High severity items (TruffleHog verified secret, APKLeaks, APKiD packer, MobSF high)
            const highFindings = findings.filter(f => f.severity === "high");
            expect(highFindings.length).toBeGreaterThanOrEqual(3);
            expect(highFindings.some(f => f.title.includes("Exposed Pattern"))).toBe(true);
            expect(highFindings.some(f => f.title.includes("Packer Detected"))).toBe(true);

            // Medium severity items (unverified secrets, anti-debug)
            const medFindings = findings.filter(f => f.severity === "medium");
            expect(medFindings.some(f => f.title.includes("Unverified Secret"))).toBe(true);
            expect(medFindings.some(f => f.title.includes("Anti-Debug"))).toBe(true);
        });

        it("extracts findings from TrueSeeing reports with description fallbacks", () => {
            const trueseeingReport = [
                {
                    pk: "report-ts-1",
                    scannerName: "Trueseeing",
                    results: JSON.stringify({
                        app: { package: "com.example.app" },
                        issues: [
                            {
                                no: 0,
                                sig: "manifest-manip-backup",
                                summary: "Manipulatable Backups",
                                synopsis: "Application data can be backed up.",
                                description: "Auto Backup feature makes app data subject to backup attack.",
                                severity: "High",
                                instances: [{ source: "AndroidManifest.xml" }],
                            },
                            {
                                no: 1,
                                sig: "privacy-device-id",
                                summary: "Privacy Concerns",
                                synopsis: null,
                                description: null,
                                severity: "Low",
                                instances: [
                                    {
                                        info: "getting L2 address (Bluetooth)",
                                        source: "Lcom/example/Adapter;->getAddress()Ljava/lang/String;",
                                    },
                                ],
                            },
                        ],
                    }),
                    androidAppIdReference: {
                        pk: "app-ts-1",
                        filename: "app.apk",
                    },
                },
            ];

            const findings = extractInterestingFindings(trueseeingReport);
            expect(findings).toHaveLength(2);

            // High severity issue
            const highFinding = findings.find(f => f.severity === "high");
            expect(highFinding).toBeDefined();
            expect(highFinding?.title).toBe("Manipulatable Backups");
            expect(highFinding?.description).toContain("Auto Backup feature");
            expect(highFinding?.location).toBe("AndroidManifest.xml");
            expect(highFinding?.category).toBe("m8-security-misconfiguration");
            expect(highFinding?.cwe).toBe("CWE-16");
            expect(highFinding?.masvs).toBe("MASVS-PLATFORM");

            // Low severity issue with fallback description
            const lowFinding = findings.find(f => f.severity === "low");
            expect(lowFinding).toBeDefined();
            expect(lowFinding?.title).toBe("Privacy Concerns");
            expect(lowFinding?.description).toContain("Potential privacy concern");
            expect(lowFinding?.location).toContain("Lcom/example/Adapter");
            expect(lowFinding?.category).toBe("m6-privacy-controls");
            expect(lowFinding?.cwe).toBe("CWE-359");
            expect(lowFinding?.masvs).toBe("MASVS-PRIVACY");
        });

        it("classifies security finding categories across OWASP Mobile Top 10 (2024), MITRE CWE, and MASVS", () => {
            expect(classifyFindingCategory({ scannerName: "build.prop" })).toBe("m8-security-misconfiguration");
            expect(
                classifyFindingCategory({ scannerName: "build.prop", title: "Unauthenticated ADB (ro.adb.secure=0)" })
            ).toBe("m3-authn-authz");
            expect(classifyFindingCategory({ scannerName: "TruffleHog" })).toBe("m1-credential-usage");
            expect(classifyFindingCategory({ scannerName: "APKLeaks" })).toBe("m1-credential-usage");
            expect(classifyFindingCategory({ scannerName: "APKiD" })).toBe("m7-binary-protections");
            expect(classifyFindingCategory({ scannerName: "Exodus" })).toBe("m6-privacy-controls");
            expect(classifyFindingCategory({ scannerName: "VirusTotal" })).toBe("m2-supply-chain");
            expect(classifyFindingCategory({ scannerName: "QuarkEngine" })).toBe("m2-supply-chain");

            // Explicit MITRE CWE and OWASP MASVS mapping
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    cwe: "CWE-327: Use of a Broken or Risky Cryptographic Algorithm",
                })
            ).toBe("m10-insufficient-cryptography");
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    cwe: "CWE-319: Cleartext Transmission of Sensitive Information",
                })
            ).toBe("m5-insecure-communication");
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    masvs: "MASVS-STORAGE",
                })
            ).toBe("m9-insecure-data-storage");
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    owaspMobile: "M5: Insufficient Cryptography",
                })
            ).toBe("m10-insufficient-cryptography");

            // Rule/title-based classification for static scanners
            expect(
                classifyFindingCategory({
                    scannerName: "Trueseeing",
                    ruleId: "detect-obfuscator",
                    title: "Lack of obfuscation",
                })
            ).toBe("m7-binary-protections");
            expect(
                classifyFindingCategory({
                    scannerName: "Trueseeing",
                    ruleId: "manifest-manip-activity",
                    title: "Exported Activity",
                })
            ).toBe("m3-authn-authz");
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    ruleId: "hardcoded_api_key",
                    title: "Hardcoded API key in source",
                })
            ).toBe("m1-credential-usage");
            expect(
                classifyFindingCategory({
                    scannerName: "MobSFScan",
                    ruleId: "sql_injection",
                    title: "Raw SQL query execution",
                })
            ).toBe("m4-input-output-validation");

            expect(getFindingCategoryMeta("m8-security-misconfiguration").label).toBe(
                "M8: Security Misconfiguration"
            );
            expect(getFindingCategoryMeta("m7-binary-protections").label).toBe(
                "M7: Insufficient Binary Protections"
            );
            expect(getFindingCategoryMeta(undefined).label).toBe(
                "M4: Insufficient Input/Output Validation"
            );
        });

        it("handles empty or null reports gracefully", () => {
            expect(extractInterestingFindings(null)).toEqual([]);
            expect(extractInterestingFindings([])).toEqual([]);
            expect(extractInterestingFindings([{ results: "{}" }])).toEqual([]);
        });
    });

    describe("route and scanner validation helpers", () => {
        it("validates route IDs against path traversal and script payloads", () => {
            expect(isSafeRouteId("64b0f1a9c8e12a3456789abc")).toBe(true);
            expect(isSafeRouteId("QW5kcm9pZEFwcFR5cGU6NjRiMGYxYTljOGUxMmEzNDU2Nzg5YWJj")).toBe(true);
            expect(isSafeRouteId("../admin")).toBe(false);
            expect(isSafeRouteId("id/with/slash")).toBe(false);
            expect(isSafeRouteId("javascript:alert(1)")).toBe(false);
            expect(isSafeRouteId("<script>alert(1)</script>")).toBe(false);
            expect(isSafeRouteId("")).toBe(false);
            expect(isSafeRouteId(null)).toBe(false);
        });

        it("validates scanner names strictly", () => {
            expect(isSafeScannerName("TruffleHog")).toBe(true);
            expect(isSafeScannerName("MobSFScan")).toBe(true);
            expect(isSafeScannerName("build.prop")).toBe(true);
            expect(isSafeScannerName("../etc/passwd")).toBe(false);
            expect(isSafeScannerName("Scanner<script>")).toBe(false);
            expect(isSafeScannerName("")).toBe(false);
            expect(isSafeScannerName(undefined)).toBe(false);
        });
    });

    describe("sortFindingsBySeverity and aggregateFirmwareAppRisks", () => {
        it("sorts findings deterministically by severity and scanner name", () => {
            const sorted = sortFindingsBySeverity([
                {
                    id: "1",
                    reportId: "r1",
                    scannerName: "MobSFScan",
                    reportPk: "r1",
                    severity: "low",
                    title: "Low issue",
                    description: "desc",
                },
                {
                    id: "2",
                    reportId: "r2",
                    scannerName: "build.prop",
                    reportPk: "r2",
                    severity: "critical",
                    title: "Critical issue",
                    description: "desc",
                },
                {
                    id: "3",
                    reportId: "r3",
                    scannerName: "APKLeaks",
                    reportPk: "r3",
                    severity: "high",
                    title: "High issue",
                    description: "desc",
                },
            ]);
            expect(sorted.map(f => f.id)).toEqual(["2", "3", "1"]);
        });

        it("aggregates per-app risk summaries and resists prototype pollution keys", () => {
            const reports = [
                {
                    pk: "r1",
                    scannerName: "TruffleHog",
                    androidAppIdReference: {
                        pk: "app1",
                        filename: "SystemUI.apk",
                        packagename: "com.android.systemui",
                    },
                },
                {
                    pk: "r2",
                    scannerName: "MobSFScan",
                    androidAppIdReference: {
                        pk: "app2",
                        filename: "Settings.apk",
                        packagename: "com.android.settings",
                    },
                },
                {
                    pk: "r-proto",
                    scannerName: "__proto__",
                    androidAppIdReference: {
                        pk: "__proto__",
                        filename: "Proto.apk",
                    },
                },
            ];

            const findings = [
                {
                    id: "f1",
                    reportId: "r1",
                    scannerName: "TruffleHog",
                    reportPk: "r1",
                    appId: "app1",
                    appFilename: "SystemUI.apk",
                    appPackagename: "com.android.systemui",
                    partitionName: "system",
                    severity: "critical" as const,
                    title: "Verified Secret",
                    description: "Secret exposed",
                },
                {
                    id: "f2",
                    reportId: "r2",
                    scannerName: "MobSFScan",
                    reportPk: "r2",
                    appId: "app2",
                    appFilename: "Settings.apk",
                    appPackagename: "com.android.settings",
                    partitionName: "product",
                    severity: "medium" as const,
                    title: "Exported Activity",
                    description: "Activity exported",
                },
                {
                    id: "f-buildprop",
                    reportId: "",
                    scannerName: "build.prop",
                    reportPk: "bp1",
                    severity: "critical" as const,
                    title: "ro.debuggable=1",
                    description: "System-wide debuggable",
                    category: "m8-security-misconfiguration" as const,
                },
            ];

            const risks = aggregateFirmwareAppRisks(reports, findings);
            expect(risks.length).toBe(3);
            expect(risks[0].appId).toBe("app1");
            expect(risks[0].highCount).toBe(1);
            expect(risks[0].totalFindings).toBe(1);
            expect(risks[1].appId).toBe("app2");
            expect(risks[1].mediumCount).toBe(1);
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });

        it("validates internal SPA return paths and rejects open redirects or traversal", () => {
            expect(isSafeInternalReturnPath("/firmwares/fw-123?tab=security")).toBe(true);
            expect(isSafeInternalReturnPath("/firmwares/fw-123/apps/app-456")).toBe(true);
            expect(isSafeInternalReturnPath("/firmwares/fw-123?tab=metadata")).toBe(true);
            expect(isSafeInternalReturnPath("//evil.example.com/phish")).toBe(false);
            expect(isSafeInternalReturnPath("/\\evil.example.com")).toBe(false);
            expect(isSafeInternalReturnPath("/firmwares/../admin")).toBe(false);
            expect(isSafeInternalReturnPath("https://evil.example.com")).toBe(false);
            expect(isSafeInternalReturnPath("javascript:alert(1)")).toBe(false);
            expect(isSafeInternalReturnPath(null)).toBe(false);
            expect(isSafeInternalReturnPath(undefined)).toBe(false);
        });
    });
});
