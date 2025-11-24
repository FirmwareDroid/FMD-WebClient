// file: `src/pages/EmulatorPage.tsx`
import "../components/ui/styles/emulator.css";
import { useEffect, useState } from "react";
import {
    Button,
    ButtonGroup,
    Form,
    InputGroup,
    Spinner,
    ToggleButton,
} from "react-bootstrap";
import {
    MapPin,
    Play,
    X,
    Video,
    Image as ImgIcon,
    Volume2,
    VolumeX,
} from "lucide-react";
import { BasePage } from "@/pages/base-page.tsx";
import { Emulator } from "android-emulator-webrtc/emulator";
import {Card, CardContent} from "@/components/ui/card.tsx";

type Radio = {
    name: string;
    value: string;
    icon: React.ComponentType<any>;
};

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    gap?: number;
    style?: React.CSSProperties;
    align?: string;
    flex?: number;
}

/* Small layout primitives (flex wrappers) */
function Stack({ children, gap = 12, style = {}, ...props }: FlexProps) {
    return (
        <div
            style={{ display: "flex", flexDirection: "column", gap, width: "100%", ...style }}
            {...props}
        >
            {children}
        </div>
    );
}

function RowLayout({ children, gap = 12, align = "center", style = {}, ...props }: FlexProps) {
    return (
        <div
            style={{ display: "flex", flexDirection: "row", gap, alignItems: align, width: "100%", ...style }}
            {...props}
        >
            {children}
        </div>
    );
}

function Col({ children, flex = 1, style = {}, ...props }: FlexProps) {
    return (
        <div style={{ flex, minWidth: 0, ...style }} {...props}>
            {children}
        </div>
    );
}

interface EmuUrlInputProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export function EmuUrlInput({ id = "emulator-url", value, onChange, placeholder = "Emulator URL", className = "" }: EmuUrlInputProps) {
    return (
        <Form.Group controlId={id} className={`emu-url-group ${className}`} style={{ marginTop: 12, marginBottom: 12 }}>
            <Form.Label className="visually-hidden">Emulator gRPC URL: </Form.Label>
            <Form.Control
                type="url"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                aria-label="Emulator URL: "
                className="emulator-input"
            />
        </Form.Group>
    );
}

type EmulatorConnectionState = { emuState?: string };
type VolumeState = { volume: number; muted: boolean };

interface EmulatorViewState {
    emulatorConnectionState: EmulatorConnectionState;
    hasEmulatorAudio: { hasAudio: boolean };
    longitudeValue: number;
    latitudeValue: number;
    hasEmulatorError: boolean;
    emulatorErrorMessage: string | null;
    gpsLocation: any;
    volumeState: VolumeState;
    radioEmulatorViewValue: string;
    emulatorUri: string;
    radiosEmulatorView: Radio[];
}

export function EmulatorPage() {
    const storedUri = (() => {
        const s = sessionStorage.getItem("emulatorUri");
        try {
            return s ? (JSON.parse(s) as string) : null;
        } catch {
            return s;
        }
    })();

    const radiosEmulatorView: Radio[] = [
        { name: "WebRTC", value: "webrtc", icon: Video },
        { name: "PNG", value: "png", icon: ImgIcon },
    ];

    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === "undefined" || !window.matchMedia) return true;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        if (!window.matchMedia) return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsDark(Boolean((e as any).matches));
        mq.addEventListener?.("change", handler as EventListener);
        if (!mq.addEventListener) (mq as any).addListener(handler);
        return () => {
            mq.removeEventListener?.("change", handler as EventListener);
            if (!mq.removeEventListener) (mq as any).removeListener(handler);
        };
    }, []);

    // theme-aware colors (tweak as needed)
    const buttonBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
    const buttonHoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    const buttonHoverColor = isDark ? "white" : "black";
    const containerBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

    const [emulatorView, setEmulatorView] = useState<EmulatorViewState>({
        emulatorConnectionState: { emuState: "" },
        hasEmulatorAudio: { hasAudio: false },
        longitudeValue: 8.72932,
        latitudeValue: 47.4974,
        hasEmulatorError: false,
        emulatorErrorMessage: null,
        gpsLocation: { gps: { latitude: 47.4974, longitude: 8.72932 } },
        volumeState: { volume: 0, muted: true },
        radioEmulatorViewValue: "png",
        emulatorUri: (storedUri as string) || "https://fmd.localhost:4443/",
        radiosEmulatorView: radiosEmulatorView,
    });

    const updateEmulatorView = (key: string, value: any) =>
        setEmulatorView((prev) => ({ ...prev, [key]: value }));

    const connectEmulator = () =>
        updateEmulatorView("emulatorConnectionState", { emuState: "connecting" });

    const disconnectEmulator = () => {
        updateEmulatorView("emulatorConnectionState", { emuState: "disconnected" });
        updateEmulatorView("hasEmulatorError", false);
        updateEmulatorView("emulatorErrorMessage", null);
    };

    useEffect(() => {
        sessionStorage.setItem("emulatorUri", JSON.stringify(emulatorView.emulatorUri));
    }, [emulatorView.emulatorUri]);

    // derived connection flags
    const isConnecting = String(emulatorView.emulatorConnectionState?.emuState) === "connecting";

    const buttonInlineStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 10,
        paddingRight: 10,
        whiteSpace: "nowrap",
    };

    return (
        <BasePage title="Emulator (experimental gRPC)">
            {/* inject theme variables on the container and a small scoped stylesheet */}
            <Stack
                className="emulator-page"
                style={{
                    padding: 16,
                    maxWidth: 900,
                    margin: "0 auto",
                    // CSS custom properties for scoped rules
                    ["--button-border" as any]: buttonBorder,
                    ["--button-hover-bg" as any]: buttonHoverBg,
                    ["--button-hover-color" as any]: buttonHoverColor,
                    ["--container-border" as any]: containerBorder,
                }}
            >
                <style>{`
                    /* scoped styles for emulator-page */
                    .emulator-page .emulator-button {
                        border: 1px solid var(--button-border);
                        background: transparent;
                        color: inherit;
                        transition: background 120ms ease, color 120ms ease, transform 80ms ease;
                    }
                    .emulator-page .emulator-button:hover {
                        background: var(--button-hover-bg);
                        color: var(--button-hover-color);
                        transform: translateY(-1px);
                    }
                    .emulator-page .emulator-container {
                        border-radius: 6px;
                        overflow: hidden;
                        border: 1px solid var(--container-border);
                    }
                    /* ensure ToggleButton internal layout doesn't stack icon/text */
                    .emulator-page .emulator-button > svg {
                        flex-shrink: 0;
                    }
                `}</style>

                <Card className="w-full max-w-5xl">
                    <CardContent>
                        <p className="text-body">
                            On this page, you can connect to an Android emulator instance via gRPC.
                            Make sure your emulator is started with WebRTC support
                            enabled and that the gRPC server is reachable from
                            this application.
                        </p>
                    </CardContent>
                </Card>

                <RowLayout style={{ marginBottom: 12 }}>
                    <RowLayout gap={8} style={{ maxWidth: 360 }}>
                        <Button
                            variant="outline-light"
                            onClick={connectEmulator}
                            aria-label={isConnecting ? "Connecting - please wait" : "Connect emulator"}
                            style={buttonInlineStyle}
                            className="emulator-button"
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={16} /> <span>Connect</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline-light"
                            onClick={disconnectEmulator}
                            aria-label="Disconnect emulator"
                            style={buttonInlineStyle}
                            className="emulator-button"
                        >
                            <X size={16} /> <span>Disconnect</span>
                        </Button>
                    </RowLayout>
                </RowLayout>

                <Stack style={{ marginTop: 12, marginBottom: 12 }}>
                    <SingleEmulatorView
                        emulatorConnectionState={emulatorView.emulatorConnectionState}
                        setEmulatorConnectionState={(v: EmulatorConnectionState) => updateEmulatorView("emulatorConnectionState", v)}
                        setHasEmulatorAudio={(v: { hasAudio: boolean }) => updateEmulatorView("hasEmulatorAudio", v)}
                        longitudeValue={emulatorView.longitudeValue}
                        setLongitudeValue={(v: number) => updateEmulatorView("longitudeValue", v)}
                        latitudeValue={emulatorView.latitudeValue}
                        setLatitudeValue={(v: number) => updateEmulatorView("latitudeValue", v)}
                        hasEmulatorError={emulatorView.hasEmulatorError}
                        setHasEmulatorError={(v: boolean) => updateEmulatorView("hasEmulatorError", v)}
                        setEmulatorErrorMessage={(v: string | null) => updateEmulatorView("emulatorErrorMessage", v)}
                        gpsLocation={emulatorView.gpsLocation}
                        setGpsLocation={(v: any) => updateEmulatorView("gpsLocation", v)}
                        volumeState={emulatorView.volumeState}
                        setVolumeState={(v: VolumeState) => updateEmulatorView("volumeState", v)}
                        radioEmulatorViewValue={emulatorView.radioEmulatorViewValue}
                        setRadioEmulatorViewValue={(v: string) => updateEmulatorView("radioEmulatorViewValue", v)}
                        emulatorUri={emulatorView.emulatorUri}
                        setEmulatorUri={(v: string) => updateEmulatorView("emulatorUri", v)}
                        radiosEmulatorView={emulatorView.radiosEmulatorView}
                    />
                </Stack>
            </Stack>
        </BasePage>
    );
}

/* Presentational single emulator view */
interface SingleEmulatorViewProps {
    emulatorConnectionState: EmulatorConnectionState;
    setEmulatorConnectionState: (v: EmulatorConnectionState) => void;
    setHasEmulatorAudio: (v: { hasAudio: boolean }) => void;
    longitudeValue: number;
    setLongitudeValue: (v: number) => void;
    latitudeValue: number;
    setLatitudeValue: (v: number) => void;
    hasEmulatorError: boolean;
    setHasEmulatorError: (v: boolean) => void;
    setEmulatorErrorMessage: (v: string | null) => void;
    gpsLocation: any;
    setGpsLocation: (v: any) => void;
    volumeState: VolumeState;
    setVolumeState: (v: VolumeState) => void;
    radioEmulatorViewValue: string;
    setRadioEmulatorViewValue: (v: string) => void;
    emulatorUri: string;
    setEmulatorUri: (v: string) => void;
    radiosEmulatorView: Radio[];
}

function SingleEmulatorView({
                                emulatorConnectionState,
                                setEmulatorConnectionState,
                                setHasEmulatorAudio,
                                longitudeValue,
                                setLongitudeValue,
                                latitudeValue,
                                setLatitudeValue,
                                hasEmulatorError,
                                setHasEmulatorError,
                                setEmulatorErrorMessage,
                                gpsLocation,
                                setGpsLocation,
                                volumeState,
                                setVolumeState,
                                radioEmulatorViewValue,
                                setRadioEmulatorViewValue,
                                emulatorUri,
                                setEmulatorUri,
                                radiosEmulatorView,
                            }: SingleEmulatorViewProps) {
    const [showEmulator, setShowEmulator] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (emulatorConnectionState?.emuState === "connecting") {
            setIsLoading(true);
            setShowEmulator(true);
        }
        if (emulatorConnectionState?.emuState === "connected") {
            setIsLoading(false);
        }
        if (emulatorConnectionState?.emuState === "disconnected") {
            setIsLoading(false);
            setShowEmulator(false);
        }
    }, [emulatorConnectionState]);

    const handleEmulatorUriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUri = String(e.target.value);
        setEmulatorUri(newUri);
        sessionStorage.setItem("emulatorUri", JSON.stringify(newUri));
    };

    const onChangeEmulatorView = (e: React.ChangeEvent<HTMLInputElement>) => setRadioEmulatorViewValue(e.currentTarget.value);

    const onEmulatorError = (error: any) => {
        console.error("Emulator error", error);
        if (!String(error).includes("receiveJsepMessages")) {
            setHasEmulatorError(true);
            setEmulatorErrorMessage(String(error));
        }
    };

    const onEmulatorStateChange = (state: string) => {
        console.info("Emulator state changed", state);
        setEmulatorConnectionState({ emuState: state });
        if (state === "disconnected") setIsLoading(false);
        if (state === "connecting") {
            setShowEmulator(true);
            setIsLoading(true);
        }
        if (state === "connected") setIsLoading(false);
    };

    const toggleEmulator = () => {
        if (showEmulator) {
            setShowEmulator(false);
            setIsLoading(false);
            // reset connection and error state when hiding (disconnect)
            setEmulatorConnectionState({ emuState: "disconnected" });
            setHasEmulatorError(false);
            setEmulatorErrorMessage(null);
        } else {
            setShowEmulator(true);
            setIsLoading(true);
        }
    };

    const VolumeIcon = (volumeState?.muted || (volumeState?.volume ?? 0) === 0) ? VolumeX : Volume2;

    // derive connecting from the passed connection state
    const isConnecting = String(emulatorConnectionState?.emuState) === "connecting";

    const buttonInlineStyle: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 10,
        paddingRight: 10,
        whiteSpace: "nowrap",
    };

    return (
        <div className="emulator-container">
            <RowLayout style={{ gap: 0 }}>
                <Col style={{ padding: 12, borderRight: "1px solid rgba(255,255,255,0.03)", maxWidth: 420 }}>
                    {hasEmulatorError && <p style={{ color: "var(--bs-danger)", margin: 0 }}>Oopps... some connection problem occurred!</p>}

                    {isLoading && showEmulator && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <Button
                                variant="outline-light"
                                onClick={toggleEmulator}
                                aria-label="Connecting - stop"
                                style={buttonInlineStyle}
                                className="emulator-button"
                            >
                                <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                                <span>Connecting...</span>
                            </Button>
                        </div>
                    )}

                    {showEmulator && !hasEmulatorError && (
                        <Emulator
                            uri={emulatorUri}
                            width={100}
                            height={400}
                            onError={onEmulatorError}
                            onStateChange={onEmulatorStateChange}
                            onAudioStateChange={(audioState: boolean) => setHasEmulatorAudio({ hasAudio: audioState })}
                            view={radioEmulatorViewValue}
                            gps={gpsLocation}
                            volume={volumeState?.volume}
                            muted={volumeState?.muted}
                        />
                    )}

                    {!showEmulator && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                variant="outline-light"
                                onClick={() => {
                                    setEmulatorConnectionState({ emuState: "connecting" });
                                }}
                                aria-label={isConnecting ? "Connecting - please wait" : "Connect emulator"}
                                style={buttonInlineStyle}
                                className="emulator-button"
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Play size={14} /> <span>Connect</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </Col>

                <Col style={{ padding: 12 }}>
                    {showEmulator && (
                        <Button
                            style={{ ...buttonInlineStyle, marginTop: 8, marginBottom: 8, marginRight: 8 }}
                            variant="outline-light"
                            size="sm"
                            onClick={() => {
                                setShowEmulator(false);
                                setIsLoading(false);
                                setEmulatorConnectionState({ emuState: "disconnected" });
                                setHasEmulatorError(false);
                                setEmulatorErrorMessage(null);
                            }}
                            aria-label="Disconnect emulator"
                            className="emulator-button"
                        >
                            <X size={14} /> <span>Disconnect</span>
                        </Button>
                    )}

                    {!hasEmulatorError ? <p style={{ marginTop: 8 }}>State: {emulatorConnectionState?.emuState}</p> : <p style={{ marginTop: 8, color: "var(--bs-danger)" }}>State: ERROR</p>}

                    <EmuUrlInput value={emulatorUri} onChange={handleEmulatorUriChange} />
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <ButtonGroup size="sm" style={{ marginRight: 8 }}>
                            {radiosEmulatorView.map((radio, idx) => {
                                const Icon = radio.icon;
                                return (
                                    <ToggleButton
                                        key={idx}
                                        id={`radio-${idx}`}
                                        type="radio"
                                        variant="outline-light"
                                        name={`radio`}
                                        value={radio.value}
                                        checked={String(radioEmulatorViewValue) === String(radio.value)}
                                        onChange={onChangeEmulatorView}
                                        aria-label={radio.name}
                                        title={radio.name}
                                        style={{ ...buttonInlineStyle, paddingLeft: 8, paddingRight: 8 }}
                                        className="emulator-button-toogle"
                                    >
                                        <Icon size={14} /> <span>{radio.name}</span>
                                    </ToggleButton>
                                );
                            })}
                        </ButtonGroup>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <InputGroup size="sm">
                            <input
                                aria-label="Longitude"
                                type="number"
                                step="0.00001"
                                value={longitudeValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLongitudeValue(Number(e.target.value))}
                                placeholder="Longitude"
                                style={{
                                    padding: "6px 8px",
                                    borderRadius: 4,
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    background: "transparent",
                                    color: "inherit",
                                    marginRight: 6,
                                    width: "50%",
                                }}
                            />
                            <input
                                aria-label="Latitude"
                                type="number"
                                step="0.00001"
                                value={latitudeValue}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatitudeValue(Number(e.target.value))}
                                placeholder="Latitude"
                                style={{
                                    padding: "6px 8px",
                                    borderRadius: 4,
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    background: "transparent",
                                    color: "inherit",
                                    width: "50%",
                                }}
                            />
                        </InputGroup>
                        <Button
                            type="button"
                            variant="outline-light"
                            onClick={() => setGpsLocation({ gps: { latitude: latitudeValue, longitude: longitudeValue } })}
                            aria-label="Set GPS to current values"
                            style={{ ...buttonInlineStyle, marginRight: 8 }}
                            className="emulator-button"
                        >
                            <MapPin size={14} /> <span>Set GPS</span>
                        </Button>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: 6 }}>
                            Volume {Math.floor((volumeState?.volume || 0) * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volumeState?.volume ?? 0}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = Number(e.target.value);
                                setVolumeState({ volume: value, muted: value === 0 });
                            }}
                            style={{ width: "100%" }}
                        />
                        <Button variant="outline-light" size="sm" aria-label={`Audio ${volumeState?.muted ? "muted" : "on"}`} style={buttonInlineStyle} className="emulator-button">
                            <VolumeIcon size={14} /> <span>{volumeState?.muted ? "Muted" : "Audio is On"}</span>
                        </Button>
                    </div>
                </Col>
            </RowLayout>
        </div>
    );
}

export default EmulatorPage;
