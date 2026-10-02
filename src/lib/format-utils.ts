/**
 * Formats a raw byte count into a human-readable string (e.g. 12695 -> "12.4 KB").
 */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
    if (bytes === null || bytes === undefined || Number.isNaN(bytes) || bytes < 0) {
        return "—";
    }
    if (bytes === 0) return "0 B";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const safeIndex = Math.min(i, sizes.length - 1);
    const value = parseFloat((bytes / Math.pow(k, safeIndex)).toFixed(dm));

    return `${value} ${sizes[safeIndex]}`;
}

/**
 * Sanitizes a filename string to prevent path traversal or injection characters.
 */
export function sanitizeFilename(filename: string, fallback = "download.json"): string {
    if (!filename || typeof filename !== "string") {
        return fallback;
    }
    // Strip paths, null bytes, and non-safe filename characters
    const base = filename.replace(/^.*[/\\]/, "").replace(/[^a-zA-Z0-9._-]/g, "_").trim();
    if (!base || base === "." || base === "..") {
        return fallback;
    }
    return base.slice(0, 120);
}

/**
 * Safely downloads an arbitrary data object as a formatted JSON file in the browser.
 */
export function downloadJsonFile(filename: string, data: unknown): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }

    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = sanitizeFilename(filename, "app-metadata.json");
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error("Failed to serialize or download JSON data:", err);
    }
}
