import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input.tsx";
import { Search } from "lucide-react";

type DataTableSearchProps = {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
};

export function DataTableSearch({
                                    value = "",
                                    onChange,
                                    placeholder = "Search...",
                                    debounceMs = 250,
                                }: Readonly<DataTableSearchProps>) {
    const [local, setLocal] = useState<string>(value);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    useEffect(() => {
        const t = setTimeout(() => {
            onChange(local);
        }, debounceMs);
        return () => clearTimeout(t);
    }, [local, onChange, debounceMs]);

    return (
        <label className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="text-muted-foreground" />
            <span className="sr-only">Search table</span>
            <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder={placeholder}
                className="w-full max-w-xs"
                aria-label="Search table"
            />
        </label>
    );
}

export default DataTableSearch;
