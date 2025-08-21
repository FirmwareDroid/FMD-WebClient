export function convertIdToObjectId(id: string): string {
    const decoded = atob(id);
    return decoded.split(":").at(1) ?? "";
}