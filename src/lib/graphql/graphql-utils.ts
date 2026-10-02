export const convertIdToObjectId = (id: string): string => {
    if (!id || typeof id !== "string") {
        return "";
    }
    const trimmed = id.trim();
    if (/^[a-f\d]{24}$/i.test(trimmed)) {
        return trimmed;
    }
    try {
        const objectId = atob(trimmed).split(":").at(1) ?? "";
        return /^[a-f\d]{24}$/i.test(objectId) ? objectId : "";
    } catch {
        return "";
    }
};

export const isNonNullish = <T>(v: T | null | undefined): v is T => v != null;
