import { useEffect, useMemo, useState } from "react";
import { storage } from '@/services/adb-streamer/storage';
import "../ui/styles/emulator.css";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Alert, AlertTitle } from "@/components/ui/alert.tsx";
import { Emulator } from "android-emulator-webrtc/emulator";
import { useEmulatorError, EmulatorErrorBanner } from "./emulator-error";

type Props = {
    emuUrl?: string;
    storageKey?: string;
};

type EmulatorPropsState =
    | {
    uri: string;
    view?: string;
    width?: number | string;
    height?: number | string;
    gps?: any;
    volume?: number;
    muted?: boolean;
    onError?: (e: any) => void;
    onStateChange?: (s: any) => void;
    onAudioStateChange?: (hasAudio: boolean) => void;
    [key: string]: any;
}
    | null;

export default function WebRtcEmulatorView({ emuUrl: propEmuUrl = "", storageKey = "emulatorUri" }: Props) {
    const storedUri = useMemo(() => {
        try {
            const s = storage.getSession(storageKey);
            if (!s) return "";
            return JSON.parse(s) as string;
        } catch {
            return "";
        }
    }, [storageKey]);

    const [emuUrl, setEmuUrl] = useState<string>(() => propEmuUrl || storedUri || "");
    const [showEmulator, setShowEmulator] = useState<boolean>(false);
    const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
    const [hasEmulatorAudio, setHasEmulatorAudio] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // volume percentage (0-100)
    const [volumePct, setVolumePct] = useState<number>(100);
    const [muted, setMuted] = useState<boolean>(false);

    // default view type set to png
    const [viewMode, setViewMode] = useState<string>("png");

    const [emuProps, setEmuProps] = useState<EmulatorPropsState>(null);

    const { hasEmulatorError, emulatorErrorMessage, onEmulatorError: reportEmulatorError, dismiss, retry } =
        useEmulatorError();

    useEffect(() => {
        if (propEmuUrl && propEmuUrl !== emuUrl) {
            setEmuUrl(propEmuUrl);
        } else if (!propEmuUrl && storedUri && storedUri !== emuUrl) {
            setEmuUrl(storedUri);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propEmuUrl, storedUri]);

    useEffect(() => {
        storage.setSession(storageKey, JSON.stringify(emuUrl));
    }, [emuUrl, storageKey]);

    const handleStateChange = (s?: string) => {
        const low = (s ?? "").toLowerCase();
        if (!s) {
            setStatus("idle");
            return;
        }
        if (low.includes("connect") && low.includes("ing")) setStatus("connecting");
        else if (low === "connected" || low.includes("connected")) setStatus("connected");
        else if (low === "error" || low.includes("error")) setStatus("error");
        else setStatus("idle");

        if (low === "connecting") setShowEmulator(true);
        if (low === "disconnected") setShowEmulator(false);
    };

    const handleEmulatorError = (err: any) => {
        const msg = err?.message ?? String(err ?? "Unknown emulator error");
        console.error("Emulator error:", err);
        setErrorMessage(msg);
        reportEmulatorError(err);
        handleStateChange("error");
    };

    const DEFAULT_EMU_HEIGHT = 900;
    const DEFAULT_EMU_MAX_HEIGHT = 1200;

    const connect = () => {
        const url = (emuUrl || "").trim();
        if (!url) {
            setErrorMessage("Missing emulator URL");
            return;
        }

        if (typeof Emulator !== "function" && typeof Emulator !== "object") {
            const msg =
                "Emulator component could not be resolved at runtime (interop issue). Ensure package exports a React component or adjust import.";
            console.error(msg, typeof Emulator, Emulator);
            setErrorMessage(msg);
            reportEmulatorError(new Error(msg));
            setStatus("error");
            return;
        }

        setErrorMessage(null);
        setShowEmulator(true);
        setStatus("connecting");

        const volume = Math.max(0, Math.min(100, volumePct)) / 100;

        const props: any = {
            uri: url,
            view: viewMode,
            width: "100%",
            height: DEFAULT_EMU_HEIGHT,
            gps: undefined,
            volume,
            muted,
            onError: (e: any) => handleEmulatorError(e),
            onStateChange: (s: any) => handleStateChange(s),
            onAudioStateChange: (hasAudio: boolean) => setHasEmulatorAudio(Boolean(hasAudio)),
        };

        setEmuProps(props);
    };

    const disconnect = () => {
        setShowEmulator(false);
        setEmuProps(null);
        setStatus("idle");
        setErrorMessage(null);
        setHasEmulatorAudio(false);
    };

    const reconnect = async () => {
        disconnect();
        setTimeout(() => connect(), 50);
    };

    useEffect(() => {
        if (!emuProps) return;
        const volume = Math.max(0, Math.min(100, volumePct)) / 100;
        setEmuProps((prev) => (prev ? { ...prev, volume, muted } : prev));
    }, [volumePct, muted]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!emuProps) return;
        setEmuProps((prev) => (prev ? { ...prev, view: viewMode } : prev));
    }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

    // mute toggle helper: updates both local state and emulator props if present
    const toggleMuted = () => {
        setMuted((prev) => {
            const next = !prev;
            setEmuProps((p) => (p ? { ...p, muted: next } : p));
            return next;
        });
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pct = Math.max(0, Math.min(100, Number(e.target.value || 0)));
        setVolumePct(pct);
    };

    const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = String(e.target.value || "png");
        setViewMode(v);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="emulator-page">
            <Card className="w-full max-w-5xl">
                <CardContent>
                    <p className="text-body">
                        Connect to an Android emulator instance via WebRTC. Provide the emulator URL and click Connect.
                    </p>

                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                        <button onClick={connect} style={{ padding: "6px 10px" }} aria-label="Connect">
                            Connect
                        </button>
                        <button onClick={disconnect} style={{ padding: "6px 10px" }} aria-label="Disconnect">
                            Disconnect
                        </button>
                        <button onClick={toggleMuted} style={{ padding: "6px 10px" }} aria-label={muted ? "Unmute" : "Mute"}>
                            {muted ? "Unmute" : "Mute"}
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
                        <input
                            className="emulator-input"
                            value={emuUrl}
                            onChange={(e) => {
                                setEmuUrl(e.target.value);
                                storage.setSession(storageKey, JSON.stringify(e.target.value));
                            }}
                            placeholder="Emulator URL (wss://...)"
                            style={{ padding: 8, width: "100%", maxWidth: 560 }}
                        />
                        <button
                            onClick={() => {
                                storage.setSession(storageKey, JSON.stringify(emuUrl));
                            }}
                            style={{ padding: "6px 10px" }}
                        >
                            Save URL
                        </button>

                        {/* Volume control (0-100) */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <label style={{ fontSize: 12, marginBottom: 4 }}>Volume {Math.round(volumePct)}%</label>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={volumePct}
                                onChange={handleVolumeChange}
                                aria-label="Emulator volume"
                            />
                        </div>

                        {/* View mode select */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <label style={{ fontSize: 12, marginBottom: 4 }}>View</label>
                            <select value={viewMode} onChange={handleViewModeChange} aria-label="View mode" style={{ padding: "6px 8px" }}>
                                <option value="png">PNG</option>
                                <option value="webrtc">WebRTC</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {errorMessage && (
                <Alert>
                    <AlertTitle>Error</AlertTitle>
                    <div>{errorMessage}</div>
                </Alert>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ color: "rgba(255,255,255,0.8)" }}>Status: {status}</div>
                <div style={{ color: "rgba(255,255,255,0.7)" }}>Audio: {hasEmulatorAudio ? "available" : "none"}</div>
            </div>

            <div style={{ marginTop: 8 }}>
                <div
                    className="emulator-container"
                    style={{
                        width: "100%",
                        maxWidth: 450,
                        height: DEFAULT_EMU_HEIGHT,
                        maxHeight: DEFAULT_EMU_MAX_HEIGHT,
                        background: "#000",
                        margin: "0 auto",
                        borderRadius: 6,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "stretch",
                        justifyContent: "stretch",
                    }}
                >
                    {showEmulator && emuProps ? (
                        <Emulator {...emuProps} />
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", color: "rgba(255,255,255,0.6)" }}>
                            <div>No emulator running. Click Connect to start.</div>
                        </div>
                    )}
                </div>

                {hasEmulatorError && (
                    <EmulatorErrorBanner message={emulatorErrorMessage} onDismiss={dismiss} onRetry={retry} onReconnect={reconnect} />
                )}
            </div>
        </div>
    );
}
