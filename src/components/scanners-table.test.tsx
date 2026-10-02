import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ScannersTable } from "./scanners-table";
import { MockedProvider } from "@apollo/client/testing/react";
import { GET_SCANNER_MODULE_NAMES } from "@/components/graphql/app.graphql";
import { useScannerConfigStore } from "@/stores/scanner-config-store";

const mockScannerModules = [
    {
        request: {
            query: GET_SCANNER_MODULE_NAMES,
        },
        result: {
            data: {
                scanner_module_name_list: ["MANIFEST", "APKID", "VIRUSTOTAL"],
            },
        },
    },
];

describe("ScannersTable", () => {
    beforeEach(() => {
        useScannerConfigStore.setState({
            configs: {
                VIRUSTOTAL: { apiKey: "" },
                TRUFFLEHOG: { scanMode: "lightweight" },
            },
        });
        localStorage.clear();
    });

    it("renders scanners list and does not render an Export button", async () => {
        render(
            <MockedProvider mocks={mockScannerModules} >
                <ScannersTable setSelectedScanners={vi.fn()} />
            </MockedProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("MANIFEST")).toBeInTheDocument();
            expect(screen.getByText("APKID")).toBeInTheDocument();
            expect(screen.getByText("VIRUSTOTAL")).toBeInTheDocument();
        });

        // Verify Export button is NOT present in the scan selection table
        expect(screen.queryByRole("button", { name: /export/i })).not.toBeInTheDocument();
    });

    it("allows selecting multiple scanners simultaneously and passes them to setSelectedScanners", async () => {
        const setSelectedScanners = vi.fn();

        render(
            <MockedProvider mocks={mockScannerModules} >
                <ScannersTable setSelectedScanners={setSelectedScanners} />
            </MockedProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("MANIFEST")).toBeInTheDocument();
        });

        // The checkboxes: first one in header is 'Select all', row checkboxes follow
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThanOrEqual(4); // 1 header + 3 rows

        // Select first row (MANIFEST)
        fireEvent.click(checkboxes[1]);

        await waitFor(() => {
            expect(setSelectedScanners).toHaveBeenCalled();
        });

        // Select second row (APKID)
        fireEvent.click(checkboxes[2]);

        await waitFor(() => {
            const lastCallArgs = setSelectedScanners.mock.calls.at(-1)?.[0];
            expect(lastCallArgs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: "MANIFEST" }),
                    expect.objectContaining({ id: "APKID" }),
                ])
            );
            expect(lastCallArgs.length).toBe(2);
        });
    });
});
