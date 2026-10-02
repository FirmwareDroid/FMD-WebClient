import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TruffleHogReportView } from "./trufflehog-report-view";
import { ApkleaksReportView } from "./apkleaks-report-view";
import { ApkidReportView } from "./apkid-report-view";
import { ExodusReportView } from "./exodus-report-view";
import { VulnerabilitiesReportView } from "./vulnerabilities-report-view";

describe("Report Views Components", () => {
    describe("TruffleHogReportView", () => {
        const mockTruffleHogData = {
            summary: {
                verified_secrets: 1,
                unverified_secrets: 2,
                chunks: 50,
                bytes: 1048576,
                scan_duration: "1.2s",
            },
            scan_mode: "deep",
            findings: {
                AWS: [
                    {
                        verified: true,
                        raw: "AKIA1234567890EXAMPLE",
                        file: "AndroidManifest.xml",
                        line: 12,
                    },
                ],
                Slack: [
                    {
                        verified: false,
                        raw: "xoxb-1234567890-abcdef",
                        file: "res/values/strings.xml",
                        line: 45,
                    },
                ],
            },
        };

        it("renders KPI cards and findings accurately", () => {
            render(<TruffleHogReportView data={mockTruffleHogData} />);

            expect(screen.getByText("Verified Secrets")).toBeInTheDocument();
            expect(screen.getByText("1")).toBeInTheDocument();
            expect(screen.getByText("Unverified")).toBeInTheDocument();
            expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText("AWS")).toBeInTheDocument();
            expect(screen.getByText("Slack")).toBeInTheDocument();
            expect(screen.getByText("Verified Live Secret")).toBeInTheDocument();
            expect(screen.getByText("Unverified Pattern Match")).toBeInTheDocument();
        });

        it("filters findings when clicking 'Verified Only'", () => {
            render(<TruffleHogReportView data={mockTruffleHogData} />);

            expect(screen.getByText("Slack")).toBeInTheDocument();

            const verifiedOnlyBtn = screen.getByRole("button", { name: /Verified Only/i });
            fireEvent.click(verifiedOnlyBtn);

            expect(screen.getByText("AWS")).toBeInTheDocument();
            expect(screen.queryByText("Slack")).not.toBeInTheDocument();
        });
    });

    describe("ApkleaksReportView", () => {
        const mockApkleaksData = {
            "Google API Key": ["AIzaSyD-mock-key-1", "AIzaSyD-mock-key-2"],
            "Stripe Secret Key": ["sk_live_mock12345"],
        };

        it("renders pattern cards and secret counts", () => {
            render(<ApkleaksReportView data={mockApkleaksData} />);

            expect(screen.getByText("Google API Key")).toBeInTheDocument();
            expect(screen.getByText("Stripe Secret Key")).toBeInTheDocument();
            expect(screen.getByText("AIzaSyD-mock-key-1")).toBeInTheDocument();
            expect(screen.getByText("sk_live_mock12345")).toBeInTheDocument();
        });
    });

    describe("ApkidReportView", () => {
        const mockApkidData = {
            files: {
                "classes.dex": {
                    compiler: ["dexlib 2.x"],
                    packer: ["SecShell"],
                    obfuscator: ["ProGuard"],
                    anti_debug: [],
                    anti_vm: [],
                },
            },
        };

        it("renders detected compilers and packers", () => {
            render(<ApkidReportView data={mockApkidData} />);

            expect(screen.getByText("classes.dex")).toBeInTheDocument();
            expect(screen.getByText("dexlib 2.x")).toBeInTheDocument();
            expect(screen.getByText("SecShell")).toBeInTheDocument();
            expect(screen.getByText("ProGuard")).toBeInTheDocument();
        });
    });

    describe("ExodusReportView", () => {
        const mockExodusData = {
            trackers: [
                {
                    name: "Google Firebase Analytics",
                    categories: ["Analytics"],
                    website: "https://firebase.google.com",
                },
            ],
            permissions: ["android.permission.INTERNET", "android.permission.CAMERA"],
        };

        it("renders trackers and permissions correctly", () => {
            render(<ExodusReportView data={mockExodusData} />);

            expect(screen.getByText("Google Firebase Analytics")).toBeInTheDocument();
            expect(screen.getByText("Analytics")).toBeInTheDocument();
            expect(screen.getByText("android.permission.INTERNET")).toBeInTheDocument();
            expect(screen.getByText("android.permission.CAMERA")).toBeInTheDocument();
        });
    });

    describe("VulnerabilitiesReportView", () => {
        const mockMobSfData = {
            results: {
                android_debuggable: {
                    metadata: {
                        description: "Application is debuggable in production",
                        severity: "high",
                        cwe: "CWE-215",
                    },
                    files: [
                        {
                            file_path: "AndroidManifest.xml",
                            match_lines: [10],
                            match_string: 'android:debuggable="true"',
                        },
                    ],
                },
            },
        };

        it("renders vulnerabilities with severity badges and CWE tags", () => {
            render(<VulnerabilitiesReportView data={mockMobSfData} scannerName="MobSF" />);

            expect(screen.getAllByText("Application is debuggable in production").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText("CWE-215")).toBeInTheDocument();
            expect(screen.getAllByText("High").length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText("AndroidManifest.xml")).toBeInTheDocument();
        });
    });
});
