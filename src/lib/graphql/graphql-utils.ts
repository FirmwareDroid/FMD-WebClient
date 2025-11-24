export const convertIdToObjectId = (id: string) => atob(id).split(":").at(1) ?? "";

export const isNonNullish = <T>(v: T | null | undefined): v is T => v != null;
