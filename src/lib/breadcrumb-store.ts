import {create} from "zustand";
import {useEffect} from "react";

interface BreadcrumbState {
    titles: Record<string, string>;
    setTitle: (id: string, title: string) => void;
    setTitles: (map: Record<string, string>) => void;
    getTitle: (id: string) => string | undefined;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set, get) => ({
    titles: {},
    setTitle: (id, title) => {
        if (!id || !title || get().titles[id] === title) return;
        set((state) => ({
            titles: {...state.titles, [id]: title},
        }));
    },
    setTitles: (map) => {
        set((state) => ({
            titles: {...state.titles, ...map},
        }));
    },
    getTitle: (id) => get().titles[id],
}));

/**
 * Hook to register a friendly title for a given entity ID (Relay ID, hex ID, or route slug).
 */
export function useSetBreadcrumbTitle(
    id: string | null | undefined,
    title: string | null | undefined
) {
    const setTitle = useBreadcrumbStore((state) => state.setTitle);
    useEffect(() => {
        if (id && title) {
            setTitle(id, title);
        }
    }, [id, title, setTitle]);
}
