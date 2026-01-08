// typescript
import React, { useState, useCallback, useEffect } from 'react';
import {
    SpeakerLoudIcon,
    SpeakerOffIcon,
    ReloadIcon,
    EnterFullScreenIcon,
    ExitFullScreenIcon,
    PlusIcon,
    MinusIcon,
} from "@radix-ui/react-icons";
import { AndroidKeyCode, AndroidKeyEventAction } from '@yume-chan/scrcpy';

type Props = {
    // kept original DeviceControls props but made optional so this file's default export
    // also accepts the props used by AdbEmulatorView.
    sendEvent?: (msg: any) => void;
    fullscreen?: HTMLDivElement | null;
    framesRendered?: number;
    framesSkipped?: number;

    // added to match usage in AdbEmulatorView
    onStart?: (params: { maxFps: number; bitRate: number }) => void;
    isWsOpen?: boolean;
};

const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 6,
    background: '#2b2b2b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
};

const DeviceControls: React.FC<Props> = ({ sendEvent, fullscreen, framesRendered = 0, framesSkipped = 0 }) => {
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1); // 0..1 (local UI-only state)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [, setRotation] = useState(0); // keep setter only to avoid unused variable error

    // safe send wrapper to avoid exceptions bubbling from sendEvent
    const safeSend = useCallback((msg: any) => {
        if (!sendEvent) return;
        try {
            sendEvent(msg);
        } catch (err) {
            // swallow to avoid breaking UI; log for debugging
            try { console.warn('[DeviceControls] sendEvent failed', err, msg?.cmd); } catch (e) {}
        }
    }, [sendEvent]);

    // keep last non-zero volume to restore after unmute
    const lastNonZeroVolumeRef = React.useRef<number>(1);

    // No longer sync initial volume from server; UI keeps local state only.

    // keep isFullscreen in sync when user presses ESC or fullscreen is changed externally
    useEffect(() => {
        const handler = () => {
            const active = !!document.fullscreenElement && document.fullscreenElement === fullscreen;
            setIsFullscreen(active);
        };
        document.addEventListener('fullscreenchange', handler);
        return () => {
            document.removeEventListener('fullscreenchange', handler);
        };
    }, [fullscreen]);

    // derived: consider volume===0 as muted for display & behavior
    const displayedMuted = muted || volume === 0;

    // helper to send setDeviceVolume to server with absolute volume (0..1) and muted flag.
    // This matches the server's accepted payload shapes (numeric or object with volume/muted).
    const sendSetVolume = useCallback((target: number, forcedMuted?: boolean) => {
        const next = Math.max(0, Math.min(1, target));
        const mutedFlag = typeof forcedMuted === 'boolean' ? forcedMuted : (next === 0 || !!muted);
        if (sendEvent) {
            try {
                // Send object payload: server will accept { volume: <0..1>, muted: <bool> }
                safeSend({ cmd: 'setDeviceVolume', payload: { volume: next, muted: mutedFlag } });
                return;
            } catch (e) {
                // fallthrough to fallback
            }
        }
        // fallback: emulate with key events if setDeviceVolume not available
        const delta = next - volume;
        const step = Math.round(Math.abs(delta * 10));
        const key = (delta > 0) ? ((AndroidKeyCode as any).VolumeUp ?? (AndroidKeyCode as any).KeyVolumeUp ?? (AndroidKeyCode as any).VOLUME_UP) : ((AndroidKeyCode as any).VolumeDown ?? (AndroidKeyCode as any).KeyVolumeDown ?? (AndroidKeyCode as any).VOLUME_DOWN);
        if (step > 0 && key != null) {
            for (let i = 0; i < Math.max(1, step); i++) {
                safeSend({ cmd: 'injectKeyCode', payload: { action: AndroidKeyEventAction.Down, keyCode: key, metaState: 0, repeat: 0 } });
                safeSend({ cmd: 'injectKeyCode', payload: { action: AndroidKeyEventAction.Up, keyCode: key, metaState: 0, repeat: 0 } });
            }
        }
    }, [sendEvent, volume, muted, safeSend]);

    const toggleMute = useCallback(() => {
        setMuted((m) => {
            const nextMuted = !m;
            if (nextMuted) {
                if (volume > 0) lastNonZeroVolumeRef.current = volume;
                setVolume(0);
                sendSetVolume(0, true);
            } else {
                const restore = lastNonZeroVolumeRef.current || 1;
                setVolume(restore);
                sendSetVolume(restore, false);
            }
            return nextMuted;
        });
    }, [sendSetVolume, volume]);

    const changeVolume = useCallback((delta: number) => {
        setVolume((v) => {
            const next = Math.max(0, Math.min(1, Number((v + delta).toFixed(3))));
            if (next > 0) lastNonZeroVolumeRef.current = next;
            if (next === 0) setMuted(true);
            else setMuted(false);
            sendSetVolume(next, next === 0);
            return next;
        });
    }, [sendSetVolume]);

    const flipRotation = useCallback(() => {
        setRotation((r) => {
            const next = (r + 1) % 4;
            sendEvent?.({ cmd: 'rotateDevice', payload: { rotation: next } });
            return next;
        });
    }, [sendEvent]);

    const toggleFullscreen = useCallback(async () => {
        if (!fullscreen) return;
        try {
            if (!document.fullscreenElement) {
                await fullscreen.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch {
            // ignore
        }
    }, [fullscreen]);

    return (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                    aria-label="Volume down"
                    title="Volume down"
                    style={buttonStyle}
                    onClick={() => changeVolume(-0.1)}
                >
                    <MinusIcon />
                    <span style={{ marginLeft: 6, fontSize: 13 }}>Vol -</span>
                </button>

                <button aria-label="Mute / unmute" style={buttonStyle} onClick={toggleMute}>
                    {displayedMuted ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}
                    <span style={{ marginLeft: 6, fontSize: 13 }}>{displayedMuted ? 'Muted' : 'Sound'}</span>
                </button>

                <button
                    aria-label="Volume up"
                    title="Volume up"
                    style={buttonStyle}
                    onClick={() => changeVolume(0.1)}
                >
                    <PlusIcon />
                    <span style={{ marginLeft: 6, fontSize: 13 }}>Vol +</span>
                </button>

                <button aria-label="Flip device" style={buttonStyle} onClick={flipRotation}>
                    <ReloadIcon />
                    <span style={{ marginLeft: 6, fontSize: 13 }}>Flip</span>
                </button>

                <button aria-label="Toggle fullscreen" style={buttonStyle} onClick={toggleFullscreen}>
                    {isFullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
                    <span style={{ marginLeft: 6, fontSize: 13 }}>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>
            </div>

            <div style={{ marginLeft: 12, color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                Frames: {framesRendered} rendered / {framesSkipped} skipped
            </div>
        </div>
    );
};

export default DeviceControls;
