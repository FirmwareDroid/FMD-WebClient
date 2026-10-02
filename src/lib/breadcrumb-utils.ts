/**
 * Safe Relay ID and URL segment parsing utilities for Top Navigation Breadcrumbs.
 */

export interface DecodedRelayId {
    rawType: string;
    friendlyType: string;
    id: string;
    shortLabel: string;
}

const ROUTE_LABELS: Record<string, string> = {
    firmware: "Firmwares",
    apps: "Apps",
    files: "Files",
    reports: "Reports",
    "scan-jobs": "Scan Jobs",
    importer: "Importer",
    emulator: "Device Streaming",
    login: "Sign In",
};

const RELAY_TYPE_LABELS: Record<string, string> = {
    AndroidFirmwareType: "Firmware",
    AndroidAppType: "App",
    FirmwareFileType: "File",
    ApkScannerReport: "Report",
    AndrowarnReport: "Report",
    AndroGuardReport: "Report",
    ApkidReport: "Report",
    QarkReport: "Report",
    ExodusReport: "Report",
    ApkleaksReport: "Report",
    MobSFScanReport: "Report",
    VirusTotalReport: "Report",
    SuperReport: "Report",
    QuarkEngineReport: "Report",
    FlowDroidReport: "Report",
    TrueseeingReport: "Report",
};

/**
 * Safely decodes base64 string without throwing DOMException.
 * Validates against Relay format `<TypeName>:<hex24>`.
 */
export function safeDecodeRelayId(segment: string): DecodedRelayId | null {
    if (!segment || typeof segment !== "string" || segment.length < 10) {
        return null;
    }

    try {
        const decoded = atob(segment);
        const match = decoded.match(/^([A-Za-z0-9_]+):([a-f0-9]{24})$/);
        if (match) {
            const rawType = match[1];
            const id = match[2];
            const friendlyType = RELAY_TYPE_LABELS[rawType] || rawType.replace(/Type$/, "");
            const shortHex = id.slice(0, 6);
            return {
                rawType,
                friendlyType,
                id,
                shortLabel: `${friendlyType} #${shortHex}`,
            };
        }
    } catch {
        // Not valid base64, return null safely
    }

    // Check if segment itself is a raw 24-char hex ObjectId
    if (/^[a-f0-9]{24}$/i.test(segment)) {
        return {
            rawType: "ObjectId",
            friendlyType: "ID",
            id: segment,
            shortLabel: `#${segment.slice(0, 6)}`,
        };
    }

    return null;
}

/**
 * Format a breadcrumb segment for display, resolving registered entity titles,
 * decoded short labels, or prettified route names.
 */
export function formatBreadcrumbSegment(
    segment: string,
    titles: Record<string, string>
): { label: string; tooltip?: string } {
    // 1. Check direct match in registered titles
    if (titles[segment]) {
        return {
            label: titles[segment],
            tooltip: segment,
        };
    }

    // 2. Try decoding as Relay ID
    const decoded = safeDecodeRelayId(segment);
    if (decoded) {
        // Check if title registered under hex ID
        if (titles[decoded.id]) {
            return {
                label: titles[decoded.id],
                tooltip: `${decoded.friendlyType}: ${decoded.id}`,
            };
        }
        return {
            label: decoded.shortLabel,
            tooltip: `${decoded.friendlyType} ID: ${decoded.id}`,
        };
    }

    // 3. Known route dictionary
    const lower = segment.toLowerCase();
    if (ROUTE_LABELS[lower]) {
        return {label: ROUTE_LABELS[lower]};
    }

    // 4. Default: sanitize and capitalize
    const cleaned = segment.replace(/[-_]/g, " ").replace(/[^\w\s]/g, "");
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return {label: capitalized};
}
