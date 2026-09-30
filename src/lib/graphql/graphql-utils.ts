export const convertIdToObjectId = (id: string): string => {
    try {
        const objectId = atob(id).split(":").at(1) ?? "";
        return /^[a-f\d]{24}$/i.test(objectId) ? objectId : "";
    } catch {
        return "";
    }
};

export const isNonNullish = <T>(v: T | null | undefined): v is T => v != null;
