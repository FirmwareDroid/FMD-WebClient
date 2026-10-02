import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildPropsCard, BuildPropFileData } from "./build-props-card";

describe("BuildPropsCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockBuildProps: BuildPropFileData[] = [
        {
            id: "prop-1",
            pk: "pk-1",
            properties: JSON.stringify({
                ro_debuggable: "1",
                ro_secure: "0",
                ro_adb_secure: "0",
                ro_build_tags: "test-keys",
                ro_build_type: "userdebug",
                ro_build_version_release: "10",
                ro_build_version_sdk: "29",
                ro_build_version_security_patch: "2023-02-05",
                ro_product_system_brand: "Google",
                ro_product_system_model: "Pixel 4",
                ro_product_cpu_abi: "armeabi-v7a",
                ro_system_build_fingerprint: "google/flame/flame:10/test-keys",
                dalvik_vm_heapsize: "256m",
                persist_sys_usb_config: "mtp,adb",
            }),
            firmwareFileIdReference: {
                id: "file-1",
                name: "build.prop",
                relativePath: "/system/build.prop",
                partitionName: "system",
            },
        },
        {
            id: "prop-2",
            pk: "pk-2",
            properties: JSON.stringify({
                ro_product_model: "VendorModel",
            }),
            firmwareFileIdReference: {
                id: "file-2",
                name: "default.prop",
                relativePath: "default.prop",
                partitionName: "vendor",
            },
        },
    ];

    it("renders empty state when no build properties exist", () => {
        render(<BuildPropsCard buildPropFiles={[]} />);
        expect(screen.getByText("No Build Properties Found")).toBeInTheDocument();
    });

    it("renders loading state when loading is true", () => {
        render(<BuildPropsCard buildPropFiles={[]} loading={true} />);
        expect(screen.getByText("Loading extracted build properties...")).toBeInTheDocument();
    });

    it("renders file switcher, security highlights, and property items", () => {
        render(<BuildPropsCard buildPropFiles={mockBuildProps} />);

        // File tabs
        const fileElements = screen.getAllByText("/system/build.prop");
        expect(fileElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("default.prop")).toBeInTheDocument();

        // Critical security badges
        expect(screen.getByText("Debuggable (ro.debuggable=1)")).toBeInTheDocument();
        expect(screen.getByText("Insecure (ro.secure=0)")).toBeInTheDocument();
        expect(screen.getByText("Unauthenticated ADB (ro.adb.secure=0)")).toBeInTheDocument();
        expect(screen.getByText("Signed with Test-Keys")).toBeInTheDocument();

        // Specs
        const patchElements = screen.getAllByText("2023-02-05");
        expect(patchElements.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Google Pixel 4")).toBeInTheDocument();
        expect(screen.getByText("Android 10 (API 29)")).toBeInTheDocument();

        // Formatted property items
        expect(screen.getByText("ro.build.version.release")).toBeInTheDocument();
        expect(screen.getByText("dalvik.vm.heapsize")).toBeInTheDocument();
    });

    it("filters properties by category and search query", () => {
        render(<BuildPropsCard buildPropFiles={mockBuildProps} />);

        // Filter by runtime category
        const runtimeBtn = screen.getByRole("button", { name: /Runtime/i });
        fireEvent.click(runtimeBtn);

        expect(screen.getByText("dalvik.vm.heapsize")).toBeInTheDocument();
        expect(screen.queryByText("ro.product.system.brand")).not.toBeInTheDocument();

        // Search filter
        const searchInput = screen.getByPlaceholderText("Filter properties...");
        fireEvent.change(searchInput, { target: { value: "heapsize" } });
        expect(screen.getByText("dalvik.vm.heapsize")).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: "nonexistent_prop_xyz" } });
        expect(screen.getByText(/No properties matching/i)).toBeInTheDocument();
    });

    it("switches to raw view and allows copying raw properties", async () => {
        const user = userEvent.setup();
        const writeSpy = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

        render(<BuildPropsCard buildPropFiles={mockBuildProps} />);

        const rawTab = screen.getByRole("tab", { name: /Raw build.prop/i });
        await user.click(rawTab);

        expect(screen.getByText(/Standard build.prop format/i)).toBeInTheDocument();

        const copyBtn = screen.getByTitle("Copy all properties in build.prop format");
        await user.click(copyBtn);

        expect(writeSpy).toHaveBeenCalled();
    });

    it("switches active file when clicking multi-file tabs", async () => {
        const user = userEvent.setup();
        render(<BuildPropsCard buildPropFiles={mockBuildProps} />);

        const file2Tab = screen.getByText("default.prop");
        await user.click(file2Tab);

        expect(screen.getByText("ro.product.model")).toBeInTheDocument();
    });
});
