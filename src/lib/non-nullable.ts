export function nonNullable<T>(v: T | null | undefined): v is T {
    return v != null;
}