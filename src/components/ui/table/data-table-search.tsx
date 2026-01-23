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
        <div className="flex items-center gap-2">
            <Search className="text-muted-foreground" />
            <Input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder={placeholder}
                className="max-w-xs"
            />
        </div>
    );
}

export default DataTableSearch;