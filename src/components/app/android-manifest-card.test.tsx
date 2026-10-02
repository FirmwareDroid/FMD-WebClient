import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AndroidManifestCard } from "./android-manifest-card";
import { ParsedAndroidManifest } from "@/lib/manifest-utils";

const mockManifest: ParsedAndroidManifest = {
    packageName: "com.example.secureapp",
    versionCode: "42",
    versionName: "1.2.3",
    minSdkVersion: "24",
    targetSdkVersion: "34",
    compileSdkVersion: "34",
    sharedUserId: "android.uid.system",
    appLabel: "Secure App",
    appComponentFactory: "androidx.core.app.CoreComponentFactory",
    debuggable: true,
    allowBackup: true,
    usesCleartextTraffic: true,
    extractNativeLibs: false,
    permissions: [
        { name: "android.permission.INTERNET", isDangerous: false },
        { name: "android.permission.RECORD_AUDIO", isDangerous: true },
    ],
    declaredPermissions: [
        { name: "com.example.CUSTOM_PERM", isDangerous: false, protectionLevel: "signature" },
    ],
    activities: [
        {
            name: "com.example.MainActivity",
            exported: true,
            actions: ["android.intent.action.MAIN"],
        },
        {
            name: "com.example.InternalActivity",
            exported: false,
            actions: [],
        },
    ],
    services: [
        {
            name: "com.example.SyncService",
            exported: false,
            permission: "android.permission.BIND_JOB_SERVICE",
            actions: [],
        },
    ],
    receivers: [
        {
            name: "com.example.BootReceiver",
            exported: true,
            actions: ["android.intent.action.BOOT_COMPLETED"],
        },
    ],
    providers: [],
    features: [
        { name: "android.hardware.camera", required: false },
    ],
    rawJson: { manifest: { "@package": "com.example.secureapp" } },
};

describe("AndroidManifestCard", () => {
    it("renders SDK badges and security flags accurately", () => {
        render(<AndroidManifestCard manifest={mockManifest} appName="TestApp" />);

        expect(screen.getByText(/Target SDK 34/i)).toBeInTheDocument();
        expect(screen.getByText(/Min SDK 24/i)).toBeInTheDocument();
        expect(screen.getByText(/v1.2.3/i)).toBeInTheDocument();
        expect(screen.getByText(/Debuggable/i)).toBeInTheDocument();
        expect(screen.getByText(/Cleartext Traffic/i)).toBeInTheDocument();
        expect(screen.getByText(/Shared UID: android.uid.system/i)).toBeInTheDocument();
    });

    it("displays permissions and filters by sensitive/dangerous", () => {
        render(<AndroidManifestCard manifest={mockManifest} appName="TestApp" />);

        expect(screen.getByText("INTERNET")).toBeInTheDocument();
        expect(screen.getByText("RECORD_AUDIO")).toBeInTheDocument();

        // Switch to Sensitive / Dangerous filter
        const dangerousButton = screen.getByRole("button", { name: /Sensitive \/ Dangerous/i });
        fireEvent.click(dangerousButton);

        expect(screen.queryByText("INTERNET")).not.toBeInTheDocument();
        expect(screen.getByText("RECORD_AUDIO")).toBeInTheDocument();
    });

    it("displays component tabs and lists activities with exported badges", async () => {
        const user = userEvent.setup();
        render(<AndroidManifestCard manifest={mockManifest} appName="TestApp" />);

        // Switch to Components tab
        const componentsTab = screen.getByRole("tab", { name: /Components/i });
        await user.click(componentsTab);

        expect(screen.getByText("com.example.MainActivity")).toBeInTheDocument();
        expect(screen.getByText("com.example.InternalActivity")).toBeInTheDocument();
        expect(screen.getByText("Exported")).toBeInTheDocument();
        expect(screen.getByText("Internal")).toBeInTheDocument();
    });
});
