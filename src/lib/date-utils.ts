/**
 * Checks whether a string conforms to ISO 8601 extended date-time format.
 * Examples: "2026-10-01T07:35:38.989349+00:00", "2026-10-01T07:35:38Z"
 */
export const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;

export function isIsoDateTimeString(value: unknown): value is string {
    return typeof value === "string" && ISO_DATETIME_REGEX.test(value.trim());
}

/**
 * Formats a date/time into a consistent, readable format: `YYYY-MM-DD HH:mm:ss`.
 * Converted to the user's local timezone.
 */
export function formatDateTime(
    value: unknown,
    fallback: string = "—"
): string {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) {
        return typeof value === "string" ? value : fallback;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
