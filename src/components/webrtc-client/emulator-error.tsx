// File: src/components/webrtc-client/emulator-error.tsx
import React, { useCallback, useState } from "react";

export function useEmulatorError() {
    const [hasEmulatorError, setHasEmulatorError] = useState(false);
    const [emulatorErrorMessage, setEmulatorErrorMessage] = useState<string>("");

    const onEmulatorError = useCallback((err: any) => {
        const msg = err?.message ?? (typeof err === "string" ? err : JSON.stringify(err));
        console.error("Emulator error:", err);
        setEmulatorErrorMessage(msg);
        setHasEmulatorError(true);
    }, []);

    const dismiss = useCallback(() => {
        setHasEmulatorError(false);
        setEmulatorErrorMessage("");
    }, []);

    // Default retry simply triggers a reconnect flow in the view (consumer can override)
    const retry = useCallback(() => {
        // no-op default: consumer should pass a reconnect function to banner
        // keep this available for consumers that want window reload fallback
        window.location.reload();
    }, []);

    return { hasEmulatorError, emulatorErrorMessage, onEmulatorError, dismiss, retry };
}

type BannerProps = {
    message?: string;
    onDismiss: () => void;
    onRetry?: () => void;
    onReconnect?: () => void;
};

export const EmulatorErrorBanner: React.FC<BannerProps> = ({ message, onDismiss, onRetry, onReconnect }) => {
    return (
        <div
            role="alert"
            aria-live="assertive"
            style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
                background: "#2b1a1a",
                color: "#ffd7d7",
                padding: "8px 12px",
                borderRadius: 6,
                marginBottom: 8,
            }}
        >
            <div style={{ flex: 1, marginRight: 12 }}>
                <div style={{ fontWeight: 600 }}>Emulator connection error</div>
                <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>{message ?? "Unknown error"}</div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                {onReconnect && (
                    <button
                        onClick={onReconnect}
                        style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                        aria-label="Reconnect"
                    >
                        Reconnect
                    </button>
                )}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                        aria-label="Retry (reload)"
                    >
                        Retry
                    </button>
                )}
                <button
                    onClick={onDismiss}
                    style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                    aria-label="Dismiss error"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};
