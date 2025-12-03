import { useEffect, useRef, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { LazyLog, ScrollFollow } from "@melloware/react-logviewer";

const GET_APK_SCANNER_LOGS = gql`
    query GetApkScannerLogs {
        apk_scanner_log_list {
            id
            level
            message
            timestamp
        }
    }
`;

type ApkLog = {
    id: string;
    level?: string;
    message?: string;
    timestamp?: string;
};

export function ApkScannerLogView() {
    const { data } = useQuery(GET_APK_SCANNER_LOGS, {
        fetchPolicy: "cache-and-network",
        pollInterval: 1000,
    });

    const lazyLogRef = useRef<any>(null); // LazyLog instance
    const lastLogIdRef = useRef<string | null>(null);

    // initialText used only for the first render via the `text` prop
    const [initialText, setInitialText] = useState<string>("");
    const [initialized, setInitialized] = useState(false);

    const logs: ApkLog[] = data?.apk_scanner_log_list ?? [];

    const formatLogLine = (l: ApkLog): string => {
        const ts = l.timestamp ?? "";
        const localTime = ts ? new Date(ts).toLocaleString() : "";
        const lvl = l.level ?? "INFO";
        return `${localTime} - ${lvl}: ${l.message ?? ""}`;
    };

    useEffect(() => {
        if (!logs || logs.length === 0) return;

        // 1) First-time initialization: set initial text (one big string)
        if (!initialized) {
            const fullText = logs.map(formatLogLine).join("\n");
            setInitialText(fullText); // pass to LazyLog via text prop on next render
            lastLogIdRef.current = logs[logs.length - 1].id;
            setInitialized(true);
            return;
        }

        // 2) After initialization: append only new log lines
        const lastId = lastLogIdRef.current;
        const lastIndex = lastId ? logs.findIndex((l) => l.id === lastId) : -1;
        const newLogs = lastIndex >= 0 ? logs.slice(lastIndex + 1) : logs;

        if (newLogs.length === 0) return;
        const newLines = newLogs.map(formatLogLine);

        // ensure the LazyLog ref is ready
        if (lazyLogRef.current && typeof lazyLogRef.current.appendLines === "function") {
            lazyLogRef.current.appendLines(newLines);
            lastLogIdRef.current = newLogs[newLogs.length - 1].id;
        }
    }, [logs, initialized]);

    return (
        <div style={{ height: "600px", width: "100%" }}>
            <ScrollFollow
                startFollowing={true}
                render={({ follow, onScroll }) => (
                    <LazyLog
                        ref={lazyLogRef}
                        follow={follow}
                        onScroll={onScroll}
                        // only provide `text` for the very first load — omit it afterwards
                        text={initialized ? undefined : initialText}
                        enableSearch
                        enableSearchNavigation
                        enableLineNumbers
                        wrapLines
                        external
                        height={520}
                        loadingComponent={<div>Loading logs…</div>}
                    />
                )}
            />
        </div>
    );
}
