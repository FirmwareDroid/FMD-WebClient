import React, {useRef, useState, useEffect, useCallback} from 'react';
import { storage } from '@/services/adb-streamer/storage';
import {
    ScrcpyVideoCodecId,
    ScrcpyAudioCodec,
    AndroidKeyCode,
    AndroidKeyEventAction,
    AndroidKeyEventMeta,
    AndroidMotionEventAction,
    AndroidMotionEventButton,
    ScrcpyPointerId,
    ScrcpyControlMessageType,
} from '@yume-chan/scrcpy';
import {TinyH264Decoder} from '@yume-chan/scrcpy-decoder-tinyh264';
import {WebCodecsVideoDecoder} from '@yume-chan/scrcpy-decoder-webcodecs';
import {
    Float32PcmPlayer,
    Float32PlanerPcmPlayer,
    Int16PcmPlayer,
} from '@yume-chan/pcm-player';
import {ReadableStream, WritableStream} from '@yume-chan/stream-extra';
import {
    AacDecodeStream,
    OpusDecodeStream,
} from '@/services/adb-streamer/utils/audio-decode-stream';
import {Packr, Unpackr} from 'msgpackr';
import {useAdbStore} from '@/stores/adb';
import {useFileStore} from '@/stores/file';
import {useToastStore} from '@/stores/toast';
import {streamingService} from '@/services/adb-streamer/stream/streaming-service';
import { setAuthToken, setBackendBaseUrl } from '@/services/adb-streamer/http-client';
import DeviceActions from '@/components/adb-client/device/DeviceActions';
import DeviceControls from '@/components/adb-client/device/DeviceControls';
import {mapClientToDevicePosition} from '@/services/adb-streamer/utils/mapClientToDevicePosition';
import {
    PACK_OPTIONS,
} from '@/services/adb-streamer/utils/constants';
import {Card, CardContent} from "@/components/ui/card.tsx";
import * as Tabs from '@radix-ui/react-tabs';

// Silent logger for adb-emulator diagnostics (disabled by default).
// To re-enable debugging set DEBUG_ADB_EMULATOR = true and the logger will forward to console.
const DEBUG_ADB_EMULATOR = false;
const adbLog = {
    debug: (..._args: any[]) => { if (DEBUG_ADB_EMULATOR) console.debug(..._args); },
    warn: (..._args: any[]) => { if (DEBUG_ADB_EMULATOR) console.warn(..._args); },
    info: (..._args: any[]) => { if (DEBUG_ADB_EMULATOR) console.info(..._args); },
    error: (..._args: any[]) => { if (DEBUG_ADB_EMULATOR) console.error(..._args); },
};

const MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON = [
    AndroidMotionEventButton.Primary,
    AndroidMotionEventButton.Tertiary,
    AndroidMotionEventButton.Secondary,
    AndroidMotionEventButton.Back,
    AndroidMotionEventButton.Forward,
];

const packer = new Packr(PACK_OPTIONS);
const unpacker = new Unpackr(PACK_OPTIONS);

// Reasonable maximum render height for the emulator
const MAX_RENDER_HEIGHT = 720;

class LocalScrcpyHoverHelper {
    private pointerId: number | bigint | null = null;
    private lastX = 0;
    private lastY = 0;

    start(pointerId: number | bigint, x: number, y: number) {
        this.pointerId = pointerId;
        this.lastX = x;
        this.lastY = y;
    }

    move(x: number, y: number) {
        this.lastX = x;
        this.lastY = y;
    }

    stop() {
        this.pointerId = null;
    }

    isActive() {
        return this.pointerId !== null;
    }

    reset() {
        this.pointerId = null;
        this.lastX = 0;
        this.lastY = 0;
    }

    getLastPosition() {
        return {x: this.lastX, y: this.lastY};
    }

    process(params: {
        action: number;
        pointerId: number | bigint;
        screenWidth: number;
        screenHeight: number;
        pointerX: number;
        pointerY: number;
        pressure?: number;
        actionButton?: number;
        buttons?: number;
    }) {
        const {
            action,
            pointerId,
            screenWidth,
            screenHeight,
            pointerX,
            pointerY,
            pressure = 0,
            actionButton = 0,
            buttons = 0,
        } = params;

        this.lastX = pointerX;
        this.lastY = pointerY;

        if (!this.isActive() && action === AndroidMotionEventAction.Down) {
            this.start(pointerId, pointerX, pointerY);
        }

        if (this.isActive() && String(this.pointerId) !== String(pointerId)) {
            this.reset();
            this.start(pointerId, pointerX, pointerY);
        }

        if (action === AndroidMotionEventAction.Up || action === AndroidMotionEventAction.HoverExit) {
            this.stop();
        }

        const message = {
            action,
            pointerId,
            screenWidth,
            screenHeight,
            pointerX,
            pointerY,
            pressure,
            actionButton,
            buttons,
        };

        return [message];
    }
}


const AdbEmulatorView: React.FC = () => {
    const adbStore = useAdbStore();
    const fileStore = useFileStore();
    const toast = useToastStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<HTMLCanvasElement | null>(null);
    const rendererListenersRef = useRef<{
        down?: (ev: PointerEvent) => void;
        move?: (ev: PointerEvent) => void;
        up?: (ev: PointerEvent) => void;
        leave?: (ev: PointerEvent) => void;
        context?: (ev: MouseEvent) => void;
        wheel?: (ev: WheelEvent) => void;
    } | null>(null);
    const audioPlayerRef = useRef<any>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const decoderRef = useRef<any>(null);
    const videoControllerRef = useRef<any>(null);
    const audioControllerRef = useRef<any>(null);
    // Track whether controllers have been closed to avoid enqueue on closed controllers
    const videoControllerClosedRef = useRef<boolean>(true);
    const audioControllerClosedRef = useRef<boolean>(true);
    const droppedVideoRef = useRef<number>(0);
    const droppedAudioRef = useRef<number>(0);
    const framesIntervalRef = useRef<number | null>(null);
    const hoverHelperRef = useRef(new LocalScrcpyHoverHelper());
    const audioFramesFedRef = useRef<number>(0);

    // Safe enqueue that checks controller ref and closed flag. Avoids throwing when stream closed.
    const safeEnqueueRef = (controllerRefObj: React.MutableRefObject<any>, closedRefObj: React.MutableRefObject<boolean>, chunk: any, name = '') => {
        const controller = controllerRefObj.current;
        if (!controller) {
            // controller not available yet
            adbLog.debug(`[adb-emulator] safeEnqueue: no controller for ${name}`);
            return;
        }
        if (closedRefObj.current) {
            // already closed
            adbLog.warn(`[adb-emulator] safeEnqueue: controller for ${name} already closed`);
            if (name === 'video') {
                droppedVideoRef.current++;
                return;
            }
            if (name === 'audio') {
                // Attempt a best-effort fallback: feed audio directly into player if possible
                try {
                    const view = normalizePacketToUint8(chunk) ?? (chunk && chunk.data instanceof Uint8Array ? chunk.data : null);
                    if (view && audioPlayerRef.current) {
                        const i16 = uint8ToInt16(view);
                        try {
                            audioPlayerRef.current.feed(i16);
                            audioFramesFedRef.current++;
                            if (audioFramesFedRef.current % 50 === 0) adbLog.debug('[adb-emulator] audioFramesFed (fallback)', audioFramesFedRef.current);
                            return;
                        } catch (err) {
                            adbLog.warn('[adb-emulator] fallback audioPlayer.feed failed', err);
                        }
                    }
                } catch (e) {
                    adbLog.warn('[adb-emulator] fallback direct audio feed failed', e);
                }
                droppedAudioRef.current++;
                adbLog.warn('[adb-emulator] drop audio — controller closed, total dropped:', droppedAudioRef.current);
                return;
            }
        }
        // If desiredSize is available, respect it (drop if <= 0)
        try {
            const desiredSize = (controller as any).desiredSize;
            if (typeof desiredSize === 'number' && desiredSize <= 0) {
                // backpressure - drop frame
                if (name === 'video') droppedVideoRef.current++;
                if (name === 'audio') droppedAudioRef.current++;
                return;
            }
        } catch (e) {
            // ignore
        }

        try {
            if (typeof controller.enqueue === 'function') {
                try {
                    controller.enqueue(chunk);
                    // success log (throttled)
                    if (Math.random() < 0.01) adbLog.debug(`[adb-emulator] safeEnqueue: enqueued ${name} chunk`);
                } catch (err) {
                    closedRefObj.current = true;
                    adbLog.error(`[adb-emulator] safeEnqueue: enqueue threw for ${name}:`, err);
                    if (name === 'video') {
                        droppedVideoRef.current++;
                    } else if (name === 'audio') {
                        droppedAudioRef.current++;
                    }
                    return;
                }
            } else if (typeof controller.write === 'function') {
                try {
                    controller.write(chunk);
                    if (Math.random() < 0.01) adbLog.debug(`[adb-emulator] safeEnqueue: wrote ${name} chunk`);
                } catch (err) {
                    closedRefObj.current = true;
                    adbLog.error(`[adb-emulator] safeEnqueue: write threw for ${name}:`, err);
                    if (name === 'video') {
                        droppedVideoRef.current++;
                    } else if (name === 'audio') {
                        droppedAudioRef.current++;
                    }
                    return;
                }
            } else {
                // unknown controller shape
                adbLog.warn(`[adb-emulator] safeEnqueue: unknown controller shape for ${name}`);
            }
        } catch (err) {
            // Mark closed to avoid further attempts
            closedRefObj.current = true;
            if (name === 'video') {
                droppedVideoRef.current++;
                if (droppedVideoRef.current % 50 === 0) {
                    adbLog.info(`[adb-emulator] dropped ${droppedVideoRef.current} video frames`);
                }
            } else if (name === 'audio') {
                droppedAudioRef.current++;
                if (droppedAudioRef.current % 50 === 0) {
                    adbLog.info(`[adb-emulator] dropped ${droppedAudioRef.current} audio frames`);
                }
            }
        }
    };

    // Helper to resume AudioContext created by pcm players (must be called after a user gesture)
    const ensureAudioContextResumed = async () => {
        try {
            const player = audioPlayerRef.current as any;
            // different players expose their AudioContext under different properties
            const ctx = player?.context ?? player?.audioContext ?? player?._audioContext ?? null;
            if (ctx && typeof ctx.state === 'string' && ctx.state === 'suspended') {
                adbLog.info('[adb-emulator] resuming AudioContext');
                await ctx.resume();
            }
        } catch (err) {
            adbLog.warn('[adb-emulator] could not resume AudioContext', err);
        }
    };

    // Helper to convert various wrapper shapes into a Uint8Array when possible
    const normalizePacketToUint8 = (pkt: any): Uint8Array | null => {
        if (!pkt) return null;
        try {
            if (pkt instanceof Uint8Array) return pkt;
            if (pkt instanceof ArrayBuffer) return new Uint8Array(pkt);
            // Node Buffer-like: { type: 'Buffer', data: [numbers] }
            if (pkt && pkt.type === 'Buffer' && Array.isArray(pkt.data)) return new Uint8Array(pkt.data);
            // wrapper: { data: Uint8Array } or { data: ArrayBuffer }
            if (pkt.data) {
                const d = pkt.data;
                if (d instanceof Uint8Array) return d;
                if (d instanceof ArrayBuffer) return new Uint8Array(d);
                if (Array.isArray(d) && d.every((x: any) => typeof x === 'number')) return new Uint8Array(d);
            }
            // direct array of numbers
            if (Array.isArray(pkt) && pkt.every((x: any) => typeof x === 'number')) return new Uint8Array(pkt);
            // check for nested buffer properties
            if (pkt.buffer instanceof ArrayBuffer) return new Uint8Array(pkt.buffer);
            if (pkt._buffer instanceof ArrayBuffer) return new Uint8Array(pkt._buffer);
            if (pkt._buf && pkt._buf instanceof ArrayBuffer) return new Uint8Array(pkt._buf);
        } catch (e) {
            // ignore
        }
        return null;
    };

    // Convert a Uint8Array (possibly with non-zero byteOffset) into an Int16Array safely.
    // If the byteOffset is not aligned to 2, copy the bytes into a new buffer with offset 0.
    const uint8ToInt16 = (view: Uint8Array): Int16Array => {
        if (!view) return new Int16Array(0);
        const bytes = view.byteLength - (view.byteLength % 2);
        if (view.byteOffset % 2 === 0) {
            return new Int16Array(view.buffer, view.byteOffset, Math.floor(bytes / Int16Array.BYTES_PER_ELEMENT));
        }
        // create aligned copy
        const copy = new Uint8Array(bytes);
        copy.set(new Uint8Array(view.buffer, view.byteOffset, bytes));
        return new Int16Array(copy.buffer, 0, Math.floor(bytes / Int16Array.BYTES_PER_ELEMENT));
    };

    const enqueueAudio = useCallback(async (pkt: any) => {
        try {
            // Primary: enqueue to audio controller if available
            if (audioControllerRef.current && !audioControllerClosedRef.current) {
                safeEnqueueRef(audioControllerRef, audioControllerClosedRef, pkt, 'audio');
                return;
            }

            // Fallback: try direct feed to audio player (assume Int16 raw when possible)
            const view = normalizePacketToUint8(pkt) ?? (pkt && pkt.data instanceof Uint8Array ? pkt.data : null);
            if (view && audioPlayerRef.current) {
                try {
                    const i16 = uint8ToInt16(view);
                    audioPlayerRef.current.feed(i16);
                    audioFramesFedRef.current++;
                    if (audioFramesFedRef.current % 50 === 0) adbLog.debug('[adb-emulator] audioFramesFed (direct fallback)', audioFramesFedRef.current);
                    return;
                } catch (err) {
                    adbLog.warn('[adb-emulator] enqueueAudio: direct audioPlayer.feed failed', err);
                }
            }
        } catch (e) {
            adbLog.warn('[adb-emulator] enqueueAudio failed', e);
        }
        droppedAudioRef.current++;
        adbLog.warn('[adb-emulator] enqueueAudio: dropped audio (no path), total dropped:', droppedAudioRef.current);
    }, []);

    const [width, setWidth] = useState(adbStore.displaySize()?.width || 0);
    const [height, setHeight] = useState(adbStore.displaySize()?.height || 0);
    const [rotation, setRotation] = useState(0);
    const [framesRendered, setFramesRendered] = useState(0);
    const [framesSkipped, setFramesSkipped] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isWsOpen, setIsWsOpen] = useState(false);

    const [controlLeft, setControlLeft] = useState(false);
    const [controlRight, setControlRight] = useState(false);
    const [shiftLeft, setShiftLeft] = useState(false);
    const [shiftRight, setShiftRight] = useState(false);
    const [altLeft, setAltLeft] = useState(false);
    const [altRight, setAltRight] = useState(false);
    const [metaLeft, setMetaLeft] = useState(false);
    const [metaRight, setMetaRight] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const [numLock, setNumLock] = useState(true);
    const keysRef = useRef(new Set<number>());

    const rotatedWidth = rotation & 1 ? height : width;
    const rotatedHeight = rotation & 1 ? width : height;

    useEffect(() => {
        try {
            const ds = adbStore.displaySize();
            const r = (ds as any)?.rotation ?? 0;
            setRotation(r);
        } catch {
            // no-op
        }
    }, [adbStore]);

    const setModifier = useCallback((keyCode: number, value: boolean) => {
        switch (keyCode) {
            case AndroidKeyCode.ControlLeft:
                setControlLeft(value);
                break;
            case AndroidKeyCode.ControlRight:
                setControlRight(value);
                break;
            case AndroidKeyCode.ShiftLeft:
                setShiftLeft(value);
                break;
            case AndroidKeyCode.ShiftRight:
                setShiftRight(value);
                break;
            case AndroidKeyCode.AltLeft:
                setAltLeft(value);
                break;
            case AndroidKeyCode.AltRight:
                setAltRight(value);
                break;
            case AndroidKeyCode.MetaLeft:
                setMetaLeft(value);
                break;
            case AndroidKeyCode.MetaRight:
                setMetaRight(value);
                break;
            case AndroidKeyCode.CapsLock:
                if (value) {
                    setCapsLock((prev) => !prev);
                }
                break;
            case AndroidKeyCode.NumLock:
                if (value) {
                    setNumLock((prev) => !prev);
                }
                break;
        }
    }, []);

    const getMetaState = useCallback(() => {
        let meta = AndroidKeyEventMeta.None;
        if (altLeft) meta |= AndroidKeyEventMeta.AltLeft;
        if (altRight) meta |= AndroidKeyEventMeta.AltRight;
        if (shiftLeft) meta |= AndroidKeyEventMeta.ShiftLeft;
        if (shiftRight) meta |= AndroidKeyEventMeta.ShiftRight;
        if (controlLeft) meta |= AndroidKeyEventMeta.CtrlLeft;
        if (controlRight) meta |= AndroidKeyEventMeta.CtrlRight;
        if (metaLeft) meta |= AndroidKeyEventMeta.MetaLeft;
        if (metaRight) meta |= AndroidKeyEventMeta.MetaRight;
        if (capsLock) meta |= AndroidKeyEventMeta.CapsLock;
        if (numLock) meta |= AndroidKeyEventMeta.NumLock;
        return meta;
    }, [
        altLeft,
        altRight,
        shiftLeft,
        shiftRight,
        controlLeft,
        controlRight,
        metaLeft,
        metaRight,
        capsLock,
        numLock,
    ]);

    const send = useCallback((message: any) => {
        // debug outgoing messages (respect DEBUG flag)
        try {
            adbLog.debug('[adb-emulator] send', message?.cmd ?? '<no-cmd>', message?.payload ? { ...message.payload } : undefined);
        } catch (e) {
            // ignore
        }
        if (wsRef.current) {
            const record = packer.pack(message);
            wsRef.current.send(record);
        }
    }, []);

    const down = useCallback(async (key: string) => {
        const keyCode = (AndroidKeyCode as any)[key];
        if (!keyCode) {
            console.log('unknown key');
            return;
        }

        setModifier(keyCode, true);
        keysRef.current.add(keyCode);

        const payload = {
            action: AndroidKeyEventAction.Down,
            keyCode,
            metaState: getMetaState(),
            repeat: 0,
        };
        send({
            cmd: 'injectKeyCode',
            payload,
        });
    }, [setModifier, getMetaState, send]);

    const up = useCallback(async (key: string) => {
        const keyCode = (AndroidKeyCode as any)[key];
        if (!keyCode) {
            return;
        }

        setModifier(keyCode, false);
        keysRef.current.delete(keyCode);

        send({
            cmd: 'injectKeyCode',
            payload: {
                action: AndroidKeyEventAction.Up,
                keyCode,
                metaState: getMetaState(),
                repeat: 0,
            },
        });
    }, [setModifier, getMetaState, send]);

    const dispose = useCallback(async () => {
        // mark controllers closed immediately to prevent enqueues during teardown
        videoControllerClosedRef.current = true;
        audioControllerClosedRef.current = true;
        videoControllerRef.current = null;
        audioControllerRef.current = null;
        // Remove renderer DOM listeners if present
        try {
            const r = rendererRef.current;
            const l = rendererListenersRef.current;
            if (r && l) {
                if (l.down) r.removeEventListener('pointerdown', l.down as any);
                if (l.move) r.removeEventListener('pointermove', l.move as any);
                if (l.up) r.removeEventListener('pointerup', l.up as any);
                if (l.leave) r.removeEventListener('pointerleave', l.leave as any);
                if (l.context) r.removeEventListener('contextmenu', l.context as any);
                if (l.wheel) r.removeEventListener('wheel', l.wheel as any);
            }
        } catch (e) {
            // ignore
        }
        // Also remove wheel listener from fullscreen container if set
        try {
            if (fullscreenRef.current) {
                fullscreenRef.current.removeEventListener('wheel', handleWheel as any);
            }
        } catch (e) {}
        if (abortControllerRef.current) {
            await abortControllerRef.current.abort();
            console.log('abortController.aborted');
        }
        if (decoderRef.current) {
            await decoderRef.current.dispose();
            decoderRef.current = null;
            console.log('decoder disposed');
        }
        if (audioPlayerRef.current) {
            await audioPlayerRef.current.stop();
            audioPlayerRef.current = null;
            console.log('audioPlayer stopped');
        }
        if (wsRef.current) {
            await wsRef.current.close();
            wsRef.current = null;
            console.log('ws closed');
        }
        if (framesIntervalRef.current) {
            clearTimeout(framesIntervalRef.current);
            framesIntervalRef.current = null;
        }
        if (containerRef.current) {
            while (containerRef.current.firstChild) {
                console.log('Removing container.firstChild');
                containerRef.current.firstChild.remove();
            }
        }
        rendererRef.current = null;
        rendererListenersRef.current = null;
    }, []);

    const start = useCallback(async ({maxFps, bitRate, audioEncoder: overrideAudioEncoder, audioCodec: overrideAudioCodec, videoEncoder: overrideVideoEncoder, videoCodec: overrideVideoCodec, device: overrideDevice}: { maxFps: number; bitRate: number; audioEncoder?: string; audioCodec?: string; videoEncoder?: string; videoCodec?: string; device?: string }) => {
         await dispose();

        // ensure a device is selected in the store before attempting to start
        if (!adbStore.device) {
            toast.error('No device selected. Please select a device before connecting.');
            return;
        }

        abortControllerRef.current = new AbortController();
        setIsStreaming(true);

        // Prefer explicit overrides from DeviceActions; otherwise use store-derived encoder objects
        const audioEncoderObj = (() => {
            if (overrideAudioEncoder) {
                // find by id/name in available encoders
                return (adbStore.audioEncoders().find((a: any) => (a.id ?? a.name) === overrideAudioEncoder) || { id: overrideAudioEncoder, name: overrideAudioEncoder, codec: overrideAudioCodec ?? undefined });
            }
            return adbStore.audioEncoderObj();
        })();

        let videoEncoderObj = (() => {
            if (overrideVideoEncoder) {
                return (adbStore.videoEncoders().find((v: any) => (v.id ?? v.name) === overrideVideoEncoder) || { id: overrideVideoEncoder, name: overrideVideoEncoder, codec: overrideVideoCodec ?? undefined });
            }
            return adbStore.videoEncoderObj();
        })();

        console.log('[adb-emulator] audio encoder:', audioEncoderObj);

        if (['off', 'raw'].includes(audioEncoderObj?.codec || '')) {
            audioPlayerRef.current = new Int16PcmPlayer(48000, 2);
        } else if (['aac'].includes(audioEncoderObj?.codec || '')) {
            audioPlayerRef.current = new Float32PlanerPcmPlayer(48000, 2);
        } else if (['opus'].includes(audioEncoderObj?.codec || '')) {
            audioPlayerRef.current = new Float32PcmPlayer(48000, 2);
        }

        console.log('[adb-emulator] audioPlayer created:', !!audioPlayerRef.current, audioPlayerRef.current?.constructor?.name);

        // Ensure we always have a decoder object; if videoEncoderObj is missing, pick a safe default
        if (!videoEncoderObj) {
            // pick TinyH264 as a safe default decoder (will be unused if no video is streamed)
            videoEncoderObj = { id: 'TinyH264@default', name: 'TinyH264', codec: 'h264', decoder: 'TinyH264' } as any;
        }

        const vdec = (videoEncoderObj as any)?.decoder ?? '';
        if (['off', 'TinyH264'].includes(vdec || '')) {
            decoderRef.current = new TinyH264Decoder();
        } else if (['WebCodecs'].includes(vdec || '')) {
             let codec: ScrcpyVideoCodecId | undefined;
             switch (videoEncoderObj?.codec) {
                 case 'h264': {
                     codec = ScrcpyVideoCodecId.H264;
                     break;
                 }
                 case 'h265': {
                     codec = ScrcpyVideoCodecId.H265;
                     break;
                 }
                 case 'av1': {
                     codec = ScrcpyVideoCodecId.AV1;
                     break;
                 }
             }

            const canvas = document.createElement('canvas') as HTMLCanvasElement & {
                draw?: (frame: VideoFrame) => Promise<void>;
                setSize?: (w: number, h: number) => void;
            };
            const ctx = canvas.getContext('2d')!;

            canvas.setSize = (w: number, h: number) => {
                canvas.width = w;
                canvas.height = h;
            };

            canvas.draw = async (frame: VideoFrame) => {
                const bitmap = await createImageBitmap(frame);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                bitmap.close();
            };

            decoderRef.current = new WebCodecsVideoDecoder({
                codec: codec!,
                renderer: canvas as any,
            });
        }

        // Ensure decoderRef.current exists; if not, create a safe fallback decoder and renderer
        if (!decoderRef.current) {
            try {
                decoderRef.current = new TinyH264Decoder();
            } catch (err) {
                adbLog.warn('[adb-emulator] Could not create TinyH264Decoder fallback:', err);
                // create a minimal dummy decoder-like object exposing a renderer
                const fallbackCanvas = document.createElement('canvas');
                (fallbackCanvas as any).setSize = (w: number, h: number) => {
                    fallbackCanvas.width = w;
                    fallbackCanvas.height = h;
                };
                decoderRef.current = { renderer: fallbackCanvas } as any;
            }
        }

        // Ensure we have a renderer element to attach
        let renderer = (decoderRef.current as any).renderer as HTMLCanvasElement | null | undefined;
        if (!renderer) {
            // create a simple canvas renderer and attach to decoder if possible
            const canvas = document.createElement('canvas') as HTMLCanvasElement & {
                draw?: (frame: VideoFrame) => Promise<void>;
                setSize?: (w: number, h: number) => void;
            };
            const ctx = canvas.getContext('2d')!;
            canvas.setSize = (w: number, h: number) => {
                canvas.width = w;
                canvas.height = h;
            };
            canvas.draw = async (frame: VideoFrame) => {
                const bitmap = await createImageBitmap(frame);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                bitmap.close();
            };
            renderer = canvas;
            try {
                // attach if decoder supports it
                (decoderRef.current as any).renderer = canvas;
            } catch (e) {
                // ignore
            }
        }

        // constrain renderer to a reasonable maximum height
        try {
            renderer.style.maxWidth = '100%';
            renderer.style.maxHeight = `${MAX_RENDER_HEIGHT}px`;
            renderer.style.touchAction = 'none';
            renderer.style.outline = 'none';
            renderer.style.pointerEvents = 'auto';
            (renderer as any).tabIndex = 0;
        } catch (e) {
            // ignore
        }

        rendererRef.current = renderer as HTMLCanvasElement;
        containerRef.current?.appendChild(rendererRef.current);

        // Attach DOM pointer listeners directly on the renderer to ensure it receives events
        // and forwards them into our existing React-style handlers.
        const domDown = (ev: PointerEvent) => {
            try { fullscreenRef.current?.focus(); } catch {}
            ev.preventDefault();
            ev.stopPropagation();
            try { (ev.currentTarget as Element).setPointerCapture(ev.pointerId); } catch {}
            // Reuse existing logic by calling injectTouch
            injectTouch(AndroidMotionEventAction.Down, ev as any);
        };
        const domMove = (ev: PointerEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            injectTouch(ev.buttons === 0 ? AndroidMotionEventAction.HoverMove : AndroidMotionEventAction.Move, ev as any);
        };
        const domUp = (ev: PointerEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            try { (ev.currentTarget as Element).releasePointerCapture(ev.pointerId); } catch {}
            injectTouch(AndroidMotionEventAction.Up, ev as any);
        };
        const domLeave = (ev: PointerEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            injectTouch(AndroidMotionEventAction.HoverExit, ev as any);
            injectTouch(AndroidMotionEventAction.Up, ev as any);
        };
        const domContext = (ev: MouseEvent) => {
            ev.preventDefault();
        };

        renderer.addEventListener('pointerdown', domDown as any);
        renderer.addEventListener('pointermove', domMove as any);
        renderer.addEventListener('pointerup', domUp as any);
        renderer.addEventListener('pointercancel', domUp as any);
        renderer.addEventListener('pointerleave', domLeave as any);
        renderer.addEventListener('contextmenu', domContext as any);
        // Ensure wheel events on the renderer are handled (user scroll/trackpad)
        renderer.addEventListener('wheel', handleWheel as any, { passive: false });

        rendererListenersRef.current = {
            down: domDown,
            move: domMove,
            up: domUp,
            leave: domLeave,
            context: domContext,
            wheel: handleWheel,
        };

        if (decoderRef.current && typeof decoderRef.current.sizeChanged === 'function') {
            decoderRef.current.sizeChanged((size: { width: number; height: number }) => {
                setWidth(size.width);
                setHeight(size.height);
                console.log(`RESIZE: width=${size.width}, height=${size.height}`);
            });
        }

        if (fullscreenRef.current) {
            fullscreenRef.current.addEventListener('wheel', handleWheel as any, {
                passive: false,
            });
            fullscreenRef.current.tabIndex = 0;
        }
        renderer.setAttribute('aria-label', 'Device Screen');

        // Only pipe to decoder writable if available
        if (decoderRef.current && (decoderRef.current as any).writable) {
            new ReadableStream({
                start(controller) {
                    videoControllerRef.current = controller;
                    videoControllerClosedRef.current = false;
                },
            })
                .pipeTo((decoderRef.current as any).writable, {
                    signal: abortControllerRef.current.signal,
                })
                .catch(() => {
                    if (abortControllerRef.current?.signal.aborted) {
                        return;
                    }
                })
                .finally(() => {
                    videoControllerClosedRef.current = true;
                });
        } else {
            adbLog.warn('[adb-emulator] decoder has no writable stream; video will be disabled for this session');
        }

        if (['off', 'raw'].includes(audioEncoderObj?.codec || '')) {
            new ReadableStream({
                start(controller) {
                    audioControllerRef.current = controller;
                    audioControllerClosedRef.current = false;
                    adbLog.debug('[adb-emulator] audio controller created (raw)');
                },
            })
                .pipeTo(
                    new WritableStream({
                        write: (chunk: any) => {
                            // support multiple possible chunk shapes
                            const view = normalizePacketToUint8(chunk) ?? (chunk && chunk.data instanceof Uint8Array ? chunk.data : null);
                            if (!view) {
                                console.warn('[adb-emulator] raw audio chunk not binary shape', chunk);
                                return;
                            }
                            const i16 = uint8ToInt16(view);
                            try {
                                audioPlayerRef.current.feed(i16);
                            } catch (err) {
                                console.warn('[adb-emulator] audioPlayer.feed failed (raw)', err);
                                // don't rethrow; swallow to avoid closing the pipe
                            }
                            audioFramesFedRef.current++;
                            if (audioFramesFedRef.current % 50 === 0) {
                                //console.debug('[adb-emulator] audioFramesFed', audioFramesFedRef.current);
                            }
                        },
                    })
                )
                .catch((err: any) => {
                    if (abortControllerRef.current?.signal.aborted) {
                        return;
                    }
                    adbLog.error('[adb-emulator] audio raw pipe error:', err);
                })
                .finally(() => {
                    audioControllerClosedRef.current = true;
                    adbLog.debug('[adb-emulator] audio controller (raw) pipe finished/closed');
                });
        } else if (['aac'].includes(audioEncoderObj?.codec || '')) {
            new ReadableStream({
                start(controller) {
                    audioControllerRef.current = controller;
                    audioControllerClosedRef.current = false;
                    adbLog.debug('[adb-emulator] audio controller created (aac)');
                },
            })
                .pipeThrough(
                    new AacDecodeStream({
                        codec: ScrcpyAudioCodec.Aac.webCodecId,
                        numberOfChannels: 2,
                        sampleRate: 48000,
                    }),
                    {
                        signal: abortControllerRef.current.signal,
                    }
                )
                .pipeTo(
                    new WritableStream({
                        write: (chunk) => {
                            // chunk may be Float32Array, an array of Float32Array (AAC planar), or an object wrapper; handle all
                            if (Array.isArray(chunk) && chunk.length > 0 && chunk.every((c: any) => c instanceof Float32Array)) {
                                // AAC -> array of Float32Array (planar)
                                try {
                                    audioPlayerRef.current.feed(chunk);
                                } catch (err) {
                                    console.warn('[adb-emulator] audioPlayer.feed failed (aac planar)', err);
                                }
                                audioFramesFedRef.current++;
                                if (audioFramesFedRef.current % 50 === 0) console.debug('[adb-emulator] audioFramesFed', audioFramesFedRef.current);
                                return;
                            }
                            if (chunk instanceof Float32Array) {
                                try {
                                    audioPlayerRef.current.feed(chunk);
                                } catch (err) {
                                    console.warn('[adb-emulator] audioPlayer.feed failed (aac float32)', err);
                                }
                                audioFramesFedRef.current++;
                                if (audioFramesFedRef.current % 50 === 0) console.debug('[adb-emulator] audioFramesFed', audioFramesFedRef.current);
                                return;
                            }
                            const view = normalizePacketToUint8(chunk);
                            if (view) {
                                // convert to Float32Array? but we cannot decode compressed here; warn
                                console.warn('[adb-emulator] decoded stream wrote binary buffer unexpectedly; expected Float32 frames');
                                // try to interpret as Int16 if length fits
                                try {
                                    const i16 = new Int16Array(view.buffer, view.byteOffset, Math.floor(view.byteLength / Int16Array.BYTES_PER_ELEMENT));
                                    // naive conversion to float32: convert int16 samples to float range
                                    const f32 = new Float32Array(i16.length);
                                    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
                                    try {
                                        audioPlayerRef.current.feed(f32);
                                    } catch (err) {
                                        console.warn('[adb-emulator] audioPlayer.feed failed (aac fallback)', err);
                                    }
                                } catch (err) {
                                    console.warn('[adb-emulator] could not convert unexpected chunk to float samples', err);
                                }
                                return;
                            }
                            console.warn('[adb-emulator] aac/opus stream chunk had unexpected shape', chunk);
                        },
                    }),
                    {
                        signal: abortControllerRef.current.signal,
                    }
                )
                .catch((err: any) => {
                    if (abortControllerRef.current?.signal.aborted) {
                        return;
                    }
                    adbLog.error('[adb-emulator] audio aac pipe error:', err);
                })
                .finally(() => {
                    audioControllerClosedRef.current = true;
                    adbLog.debug('[adb-emulator] audio controller (aac) pipe finished/closed');
                });
        } else if (['opus'].includes(audioEncoderObj?.codec || '')) {
            new ReadableStream({
                start(controller) {
                    audioControllerRef.current = controller;
                    audioControllerClosedRef.current = false;
                    adbLog.debug('[adb-emulator] audio controller created (opus)');
                },
            })
                .pipeThrough(
                    new OpusDecodeStream({
                        codec: ScrcpyAudioCodec.Opus.webCodecId,
                        numberOfChannels: 2,
                        sampleRate: 48000,
                    }),
                    {
                        signal: abortControllerRef.current.signal,
                    }
                )
                .pipeTo(
                    new WritableStream({
                        write: (chunk) => {
                            // chunk may be Float32Array or an array (planar) or an object wrapper; handle arrays too
                            if (Array.isArray(chunk) && chunk.length > 0 && chunk.every((c: any) => c instanceof Float32Array)) {
                                audioPlayerRef.current.feed(chunk);
                                audioFramesFedRef.current++;
                                if (audioFramesFedRef.current % 50 === 0) console.debug('[adb-emulator] audioFramesFed', audioFramesFedRef.current);
                                return;
                            }
                            if (chunk instanceof Float32Array) {
                                audioPlayerRef.current.feed(chunk);
                                audioFramesFedRef.current++;
                                if (audioFramesFedRef.current % 50 === 0) console.debug('[adb-emulator] audioFramesFed', audioFramesFedRef.current);
                                return;
                            }
                            const view = normalizePacketToUint8(chunk);
                            if (view) {
                                // convert to Float32Array? but we cannot decode compressed here; warn
                                console.warn('[adb-emulator] decoded stream wrote binary buffer unexpectedly; expected Float32 frames');
                                // try to interpret as Int16 if length fits
                                try {
                                    const i16 = new Int16Array(view.buffer, view.byteOffset, Math.floor(view.byteLength / Int16Array.BYTES_PER_ELEMENT));
                                    // naive conversion to float32: convert int16 samples to float range
                                    const f32 = new Float32Array(i16.length);
                                    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
                                    try { audioPlayerRef.current.feed(f32); } catch (err) { console.warn('[adb-emulator] audioPlayer.feed failed (opus fallback)', err); }
                                } catch (err) {
                                    console.warn('[adb-emulator] could not convert unexpected chunk to float samples', err);
                                }
                                return;
                            }
                            console.warn('[adb-emulator] aac/opus stream chunk had unexpected shape', chunk);
                        },
                    }),
                    {
                        signal: abortControllerRef.current.signal,
                    }
                )
                .catch((err: any) => {
                    if (abortControllerRef.current?.signal.aborted) {
                        return;
                    }
                    adbLog.error('[adb-emulator] audio opus pipe error:', err);
                })
                .finally(() => {
                    audioControllerClosedRef.current = true;
                    adbLog.debug('[adb-emulator] audio controller (opus) pipe finished/closed');
                });
        }

        // Ensure the AudioContext (if any) is resumed after a user gesture before starting playback
        await ensureAudioContextResumed();
        await audioPlayerRef.current.start();
        try {
            const playerCtx = (audioPlayerRef.current as any)?.context ?? (audioPlayerRef.current as any)?.audioContext ?? null;
            adbLog.info('[adb-emulator] audioPlayer started, AudioContext state:', playerCtx?.state ?? 'unknown');
        } catch (e) {}

        const deviceToUse = overrideDevice ?? adbStore.device!;
        const returnedWs = await streamingService.init({
             device: deviceToUse,
             audio: (audioEncoderObj?.name ?? '') !== 'off' && !!audioEncoderObj,
             audioCodec:
                 (overrideAudioCodec ?? audioEncoderObj?.codec) === 'off' ? undefined : (overrideAudioCodec ?? audioEncoderObj?.codec),
             audioEncoder:
                 (overrideAudioEncoder ?? audioEncoderObj?.name) === 'off' ? undefined : (overrideAudioEncoder ?? audioEncoderObj?.name),
             video: (videoEncoderObj?.name ?? '') !== 'off' && !!videoEncoderObj,
             videoCodec:
                 (overrideVideoCodec ?? videoEncoderObj?.codec) === 'off' ? undefined : (overrideVideoCodec ?? videoEncoderObj?.codec),
             videoEncoder:
                 (overrideVideoEncoder ?? videoEncoderObj?.name) === 'off' ? undefined : (overrideVideoEncoder ?? videoEncoderObj?.name),
             videoBitRate: bitRate,
             maxFps: maxFps,
             // include user-specified backend and credentials so the websocket upgrade can be authenticated
             backendBaseUrl: emulatorUrl || undefined,
             username: backendUser || undefined,
             password: backendPass || undefined,
             onopen: (wsInstance: WebSocket) => {
                 try {
                     wsRef.current = wsInstance;
                 } catch (err) {
                     // ignore
                 }
                 console.log(`CONNECTED`);
                 setIsWsOpen(true);
             },
             onclose: () => {
                 console.log(`DISCONNECTED`);
                 // mark controllers closed
                 videoControllerClosedRef.current = true;
                 audioControllerClosedRef.current = true;
                 videoControllerRef.current = null;
                 audioControllerRef.current = null;
                 setIsWsOpen(false);
                 wsRef.current = null;
             },
             onmessage: (...args: any[]) => {
                 const evt = args[args.length - 1];

                 // If both controllers are closed, skip processing entirely to avoid unpacking and enqueuing.
                 if (videoControllerClosedRef.current && audioControllerClosedRef.current) {
                     return;
                 }

                 let record: any;
                 try {
                     record = unpacker.unpack(evt.data);
                 } catch (err) {
                     // If unpacking failed (corrupt/partial message), just ignore this message.
                     return;
                 }
                 if (record.media === 'video') {
                     safeEnqueueRef(videoControllerRef, videoControllerClosedRef, record.packet, 'video');
                 } else if (record.media === 'audio') {
                     try {
                         enqueueAudio(record.packet);
                     } catch (e) {}
                 } else if (record.media === 'message') {
                     try {
                         // backward-compatible: ignore legacy volume messages (we don't sync)
                         if (record.type === 'clipboard' && record.message) {
                             navigator.clipboard.writeText(record.message);
                         } else if (record.message) {
                             navigator.clipboard.writeText(record.message);
                         }
                     } catch (err) {
                         // ignore
                     }
                 }
             },
             onerror: (...args: any[]) => {
                 const evt = args[args.length - 1];
                 console.log(`ERROR=${(evt && (evt as any).data) ?? evt}`);
                 // also mark controllers closed on error
                 videoControllerClosedRef.current = true;
                 audioControllerClosedRef.current = true;
                 videoControllerRef.current = null;
                 audioControllerRef.current = null;
             },
        } as any);

        // If for some reason the returned ws is available but wsRef wasn't set in onopen,
        // ensure wsRef points to the actual socket now.
        try {
            wsRef.current = wsRef.current ?? returnedWs;
        } catch (err) {}

        framesIntervalRef.current = window.setInterval(() => {
            if (decoderRef.current) {
                try {
                    const fr = (decoderRef.current as any).framesRendered;
                    const fs = (decoderRef.current as any).framesSkipped;
                    if (typeof fr === 'number') setFramesRendered(fr);
                    if (typeof fs === 'number') setFramesSkipped(fs);
                } catch (e) {
                    // decoder doesn't expose frame counters; ignore
                }
            }
        }, 1000);
    }, [adbStore, dispose]);



    const hasDevice = !!adbStore.device;
    const safeStart = useCallback(
        (opts: { maxFps: number; bitRate: number }) => {
            if (!hasDevice) {
                console.warn('Attempted to start streaming but no device is available.');
                return;
            }
            return start(opts);
        },
        [hasDevice, start]
    );

    const handleWheel = useCallback((e: WheelEvent) => {
        try { fullscreenRef.current?.focus(); } catch {}
        e.preventDefault();
        e.stopPropagation();

        const renderer = rendererRef.current;
        if (!renderer) return;

        // compute client rect with fallback similar to injectTouch
        let clientRect = renderer.getBoundingClientRect();
        if ((!clientRect || clientRect.width <= 0 || clientRect.height <= 0) && containerRef.current) {
            clientRect = containerRef.current.getBoundingClientRect();
        }
        if (!clientRect || clientRect.width <= 0 || clientRect.height <= 0) {
            clientRect = { x: 0, y: 0, width: window.innerWidth || 1, height: window.innerHeight || 1 } as DOMRect;
        }

        const decoderSize = (decoderRef.current && (decoderRef.current.size || { width: (decoderRef.current as any).width, height: (decoderRef.current as any).height })) || null;
        const fallbackWidth = (decoderSize && decoderSize.width) || (renderer as any)?.width || Math.round(clientRect.width) || rotatedWidth || 0;
        const fallbackHeight = (decoderSize && decoderSize.height) || (renderer as any)?.height || Math.round(clientRect.height) || rotatedHeight || 0;
        let screenW = (width && width > 0) ? width : fallbackWidth;
        let screenH = (height && height > 0) ? height : fallbackHeight;
        if (!screenW || screenW <= 0) screenW = Math.max(1, Math.round(clientRect.width));
        if (!screenH || screenH <= 0) screenH = Math.max(1, Math.round(clientRect.height));

        const {x, y} = mapClientToDevicePosition({
            clientX: e.clientX,
            clientY: e.clientY,
            clientRect,
            rotation,
            width: screenW,
            height: screenH,
        });

        // Normalize delta by deltaMode: DOM_DELTA_PIXEL (0), LINE (1), PAGE (2)
        let normDeltaX = e.deltaX;
        let normDeltaY = e.deltaY;
        try {
            if ((e as any).deltaMode === 1) {
                // lines -> approximate pixels
                normDeltaX = e.deltaX * 16;
                normDeltaY = e.deltaY * 16;
            } else if ((e as any).deltaMode === 2) {
                // pages -> use viewport height
                normDeltaX = e.deltaX * (window.innerHeight || 800);
                normDeltaY = e.deltaY * (window.innerHeight || 800);
            }
        } catch (err) {}

        // Build payload similar to injectTouch with additional scroll fields
        const payload: any = {
            // absolute device coords
            pointerX: Math.max(0, Math.min(Math.max(0, screenW - 1), Math.round(x))),
            pointerY: Math.max(0, Math.min(Math.max(0, screenH - 1), Math.round(y))),
            deviceX: Math.max(0, Math.min(Math.max(0, screenW - 1), Math.round(x))),
            deviceY: Math.max(0, Math.min(Math.max(0, screenH - 1), Math.round(y))),
            // display size
            displayWidth: screenW,
            displayHeight: screenH,
            // rotation and client coords
            rotation,
            clientX: Math.round(e.clientX),
            clientY: Math.round(e.clientY),
            // pointer id for mouse/scroll
            pointerId: ScrcpyPointerId.Finger,
            // buttons & actionButton
            buttons: (e as any).buttons ?? 0,
            actionButton: 0,
            // scroll amounts (pixels, preserve sign)
            scrollX: -normDeltaX,
            scrollY: -normDeltaY,
        };

        // Debug log the payload before sending (respects DEBUG_ADB_EMULATOR)
        try {
            adbLog.debug('[adb-emulator] injectScroll ->', payload);
        } catch (err) {}

        send({ cmd: 'injectScroll', payload });
    }, [rotation, width, height, send, rotatedWidth, rotatedHeight]);

    const injectTouch = useCallback((action: AndroidMotionEventAction, e: React.PointerEvent) => {
        const {pointerType} = e;
        let pointerId;
        if (pointerType === 'mouse') {
            pointerId = ScrcpyPointerId.Finger;
        } else {
            pointerId = BigInt(e.pointerId);
        }

        if (!rendererRef.current) return;

        // Prefer the actual renderer (canvas) bounding rect. If it reports zero width/height
        // (which can happen if not yet laid out), fall back to the container's rect and
        // ultimately to the window size so we avoid zero denominators.
        const renderer = rendererRef.current;
        // Prefer the actual renderer (canvas) bounding rect. If it reports zero width/height
        // (which can happen if not yet laid out), fall back to the container's rect and
        // ultimately to the window size so we avoid zero denominators.
        let clientRect = renderer.getBoundingClientRect();
        if ((!clientRect || clientRect.width <= 0 || clientRect.height <= 0) && containerRef.current) {
            clientRect = containerRef.current.getBoundingClientRect();
        }
        if (!clientRect || clientRect.width <= 0 || clientRect.height <= 0) {
            clientRect = { x: 0, y: 0, width: window.innerWidth || 1, height: window.innerHeight || 1 } as DOMRect;
        }
        // Try decoder-provided size first (some decoders expose size metadata)
        const decoderSize = (decoderRef.current && (decoderRef.current.size || { width: (decoderRef.current as any).width, height: (decoderRef.current as any).height })) || null;
        const fallbackWidth = (decoderSize && decoderSize.width) || (renderer as any)?.width || Math.round(clientRect.width) || rotatedWidth || 0;
        const fallbackHeight = (decoderSize && decoderSize.height) || (renderer as any)?.height || Math.round(clientRect.height) || rotatedHeight || 0;
        let screenW = (width && width > 0) ? width : fallbackWidth;
        let screenH = (height && height > 0) ? height : fallbackHeight;
        // Ensure we never pass zero dimensions to the mapper
        if (!screenW || screenW <= 0) screenW = Math.max(1, Math.round(clientRect.width));
        if (!screenH || screenH <= 0) screenH = Math.max(1, Math.round(clientRect.height));


        const {x, y} = mapClientToDevicePosition({
            clientX: e.clientX,
            clientY: e.clientY,
            clientRect,
            rotation,
            width: screenW,
            height: screenH,
        });

        // Debug: log mapping info when coordinates appear zero — helps identify upstream issues
        try {
            const rectInfo = { x: Math.round(clientRect.x), y: Math.round(clientRect.y), w: Math.round(clientRect.width), h: Math.round(clientRect.height) };
            adbLog.debug('[adb-emulator] mapClientToDevicePosition', { screenW, screenH, rect: rectInfo, clientX: Math.round(e.clientX), clientY: Math.round(e.clientY), mappedX: Math.round(x), mappedY: Math.round(y) });
        } catch (err) {
            // ignore
        }

        const messages = hoverHelperRef.current.process({
            action,
            pointerId,
            screenWidth: screenW,
            screenHeight: screenH,
            pointerX: x,
            pointerY: y,
            pressure: e.pressure,
            actionButton: MOUSE_EVENT_BUTTON_TO_ANDROID_BUTTON[e.button],
            buttons: e.buttons,
        });

        for (const message of messages) {
            try {
                adbLog.debug('[adb-emulator] injectTouch ->', message.action, Math.round(message.pointerX), Math.round(message.pointerY));
            } catch (err) {}
            // augment payload with absolute device coordinates and display size
            const rawX = Math.round(message.pointerX);
            const rawY = Math.round(message.pointerY);
            // clamp to [0, screenW-1] / [0, screenH-1] to avoid sending out-of-range coordinates
            const clampedX = Math.max(0, Math.min(Math.max(0, screenW - 1), rawX));
            const clampedY = Math.max(0, Math.min(Math.max(0, screenH - 1), rawY));

            try {
                adbLog.debug('[adb-emulator] injectTouch clamped', { rawX, rawY, clampedX, clampedY, screenW, screenH });
            } catch (err) {}

            const payload = {
                // keep original expected shape
                ...message,
                // normalized fields replaced with clamped device values
                pointerX: clampedX,
                pointerY: clampedY,
                // absolute device coords (pixels)
                deviceX: clampedX,
                deviceY: clampedY,
                // display size for the current device
                displayWidth: screenW,
                displayHeight: screenH,
                // rotation of the display (0..3)
                rotation,
                // also include original client coordinates for debugging
                clientX: (e as any).clientX,
                clientY: (e as any).clientY,
            };

            send({
                cmd: 'injectTouch',
                payload,
            });
        }
    }, [rotation, width, height, send]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.ctrlKey && e.key === 'v') {
            handleClipboardPaste();
        } else {
            down(e.code);
        }
    }, [down]);

    const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        up(e.code);
    }, [up]);

    const handleClipboardPaste = useCallback(async () => {
        const clipboardText = await navigator.clipboard.readText();
        if (clipboardText) {
            send({
                cmd: 'clipboardPaste',
                payload: {
                    type: ScrcpyControlMessageType.SetClipboard,
                    sequence: BigInt('12345'),
                    paste: true,
                    length: clipboardText.length,
                    content: clipboardText,
                },
            });
        }
    }, [send]);

    // Pointer handlers were previously declared here but were moved to DOM listeners
    // attached directly to the renderer (canvas). Keeping behavior local to the
    // renderer avoids events being swallowed by the canvas element; see renderer
    // listeners added in `start()` above.

    useEffect(() => {
        const init = async () => {
            await Promise.all([
                adbStore.metainfo(),
                fileStore.getUplaods(),
                fileStore.getApps(),
            ]);
            //await start({maxFps: DEAULT_MAX_FPS, bitRate: DEAULT_BIT_RATE});
        };
        init();

        return () => {
            dispose();
        };
    }, []);

    const disconnect = useCallback(async () => {
        try {
            await dispose();
        } finally {
            setIsStreaming(false);
            setIsWsOpen(false);
            // mark controllers closed on disconnect to avoid further enqueues
            videoControllerClosedRef.current = true;
            audioControllerClosedRef.current = true;
            videoControllerRef.current = null;
            audioControllerRef.current = null;
            // Also remove renderer event listeners just in case
            try {
                const r = rendererRef.current;
                const l = rendererListenersRef.current;
                if (r && l) {
                    if (l.down) r.removeEventListener('pointerdown', l.down as any);
                    if (l.move) r.removeEventListener('pointermove', l.move as any);
                    if (l.up) r.removeEventListener('pointerup', l.up as any);
                    if (l.leave) r.removeEventListener('pointerleave', l.leave as any);
                    if (l.context) r.removeEventListener('contextmenu', l.context as any);
                    if (l.wheel) r.removeEventListener('wheel', l.wheel as any);
                }
                try {
                    if (fullscreenRef.current) {
                        fullscreenRef.current.removeEventListener('wheel', handleWheel as any);
                    }
                } catch (e) {}
            } catch (e) {
                // ignore
            }
        }
    }, [dispose]);

    const playTestTone = useCallback(async () => {
        try {
            // create a temporary AudioContext and play a short tone to verify audio output
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 440;
            g.gain.value = 0.05;
            o.connect(g);
            g.connect(ctx.destination);
            o.start();
            setTimeout(() => {
                try { o.stop(); } catch (e) {}
                try { ctx.close(); } catch (e) {}
            }, 800);
            console.info('[adb-emulator] played test tone');
        } catch (err) {
            console.warn('[adb-emulator] test tone failed', err);
        }
    }, []);

    // local tab state for right-side panel
    const [activeTab, setActiveTab] = useState<'settings'|'logcat'|'files'|'apps'>('settings');

    // loading state for metadata fetch and a simple connect handler
    const [isLoadingMeta, setIsLoadingMeta] = useState(false);
    // backend/emulator URL to use for websocket streaming (optional)
    const [emulatorUrl, setEmulatorUrl] = useState<string>(() => {
        try {
            const v = storage.getSession('adbBackendUrl');
            return v ? String(v) : '';
        } catch { return ''; }
    });
    // optional basic auth credentials for websocket upgrade (user-provided)
    const [backendUser, setBackendUser] = useState<string>(() => {
        try { return String(storage.getSession('adbBackendUser') || ''); } catch { return ''; }
    });
    const [backendPass, setBackendPass] = useState<string>(() => {
        try { return String(storage.getSession('adbBackendPass') || ''); } catch { return ''; }
    });

    // Keep the HTTP client and streaming defaults in sync with user inputs.
    // This ensures the Authorization header is set for apiClient (metadata/file calls)
    // and streamingService can receive credentials for websocket auth when starting.
    useEffect(() => {
        try {
            if (emulatorUrl && emulatorUrl.trim()) {
                // configure base URL (this also extracts and applies credentials embedded in a URL)
                setBackendBaseUrl(emulatorUrl.trim());
            }
        } catch (e) {
            // ignore invalid URL here; connect() will surface missing/invalid URL to user
        }

        // Apply or clear Authorization header based on explicit credentials fields
        try {
            if (backendUser || backendPass) {
                const user = backendUser ?? '';
                const pass = backendPass ?? '';
                let token = '';
                try { token = typeof btoa === 'function' ? btoa(`${user}:${pass}`) : Buffer.from(`${user}:${pass}`).toString('base64'); } catch { try { token = Buffer.from(`${user}:${pass}`).toString('base64'); } catch { token = ''; } }
                if (token) {
                    setAuthToken(`Basic ${token}`);
                } else {
                    setAuthToken(undefined);
                }
            } else {
                // no credentials – clear Authorization header
                setAuthToken(undefined);
            }
        } catch (e) {
            // ignore
        }
    }, [emulatorUrl, backendUser, backendPass]);

    const connect = useCallback(async () => {
        setIsLoadingMeta(true);
        try {
            // configure API client to target the emulator backend and include Authorization header if credentials provided
            try {
                if (emulatorUrl && emulatorUrl.trim()) {
                    setBackendBaseUrl(emulatorUrl.trim());
                }
                if (backendUser || backendPass) {
                    // compute Basic base64 and set as Authorization header for apiClient
                    const user = backendUser ?? '';
                    const pass = backendPass ?? '';
                    let token = '';
                    try {
                        token = typeof btoa === 'function' ? btoa(`${user}:${pass}`) : Buffer.from(`${user}:${pass}`).toString('base64');
                    } catch {
                        try { token = Buffer.from(`${user}:${pass}`).toString('base64'); } catch { token = ''; }
                    }
                    if (token) setAuthToken(`Basic ${token}`);
                }
            } catch (e) {
                // non-fatal: continue to attempt metadata fetch
            }

            // fetch meta information from adb service and related file lists
            await Promise.all([
                adbStore.metainfo ? adbStore.metainfo() : Promise.resolve(),
                fileStore.getUplaods ? fileStore.getUplaods() : Promise.resolve(),
                fileStore.getApps ? fileStore.getApps() : Promise.resolve(),
            ]);
            toast.success('Metadata loaded');
        } catch (err: any) {
            const msg = err?.message ?? String(err ?? 'Failed to load metadata');
            toast.error(`Failed to load metadata: ${msg}`);
        } finally {
            setIsLoadingMeta(false);
        }
    }, [adbStore, fileStore, toast]);

    return (
        <div className="emulator-root emulator-page">
            <Card className="w-full max-w-5xl">
                <CardContent>
                    <p className="text-body">
                        On this page, you can connect to an Android emulator vis scrcpy server and adb. To use this
                        feature a Websocket connection will be established to stream the device's screen and send
                        input events. Make sure you have the websocket server running on the machine where
                        the emulator is hosted.
                    </p>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                            <label style={{ fontSize: 12, marginBottom: 6 }}>Websocket Connection-URL</label>
                            <input
                                className="emulator-input"
                                value={emulatorUrl}
                                onChange={(e) => {
                                    const v = String(e.target.value || '');
                                    setEmulatorUrl(v);
                                    try { storage.setSession('adbBackendUrl', v); } catch {}
                                }}
                                placeholder="Emulator backend URL (wss://host:port)"
                                style={{ padding: 8, minWidth: 320 }}
                            />
                        </div>
                    </div>

                    {/** Add CONTROLS HERE */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                            <label style={{ fontSize: 12, marginBottom: 6 }}>Username</label>
                            <input
                                className="emulator-input"
                                value={backendUser}
                                onChange={(e) => {
                                    const v = String(e.target.value || '');
                                    setBackendUser(v);
                                    try { storage.setSession('adbBackendUser', v); } catch {}
                                }}
                                placeholder="Username (optional)"
                                style={{ padding: 8 }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                            <label style={{ fontSize: 12, marginBottom: 6 }}>Password</label>
                            <input
                                className="emulator-input"
                                type="password"
                                value={backendPass}
                                onChange={(e) => {
                                    const v = String(e.target.value || '');
                                    setBackendPass(v);
                                    try { storage.setSession('adbBackendPass', v); } catch {}
                                }}
                                placeholder="Password (optional)"
                                style={{ padding: 8 }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                        <button className="btn" onClick={connect} disabled={isLoadingMeta} aria-label="Connect">
                            {isLoadingMeta ? 'Loading metadata...' : 'Connect'}
                        </button>
                        <div style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{adbStore.devices?.length ? `${adbStore.devices.length} device(s) available` : 'No devices loaded'}</div>
                    </div>


                </CardContent>
            </Card>

            {/** Optional banner when no device is present */}
            {!hasDevice && (
                <div className="emulator-banner" role="status" aria-live="polite">
                    No devices available. Connect a device to enable streaming.
                </div>
            )}

            {/** Main content: left = emulator renderer, right = controls & tabs */}
            <div className="emulator-main">
                {/** Left: emulator area */}
                <div className="emulator-left">
                    {isStreaming && isWsOpen && (
                        <div className="emulator-panel" style={{ marginBottom: 8 }}>
                            <DeviceControls sendEvent={send} fullscreen={fullscreenRef.current} framesRendered={framesRendered} framesSkipped={framesSkipped} />
                        </div>
                    )}

                    <div id="fullscreen" ref={fullscreenRef} className="emulator-fullscreen" onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} tabIndex={0}>
                        <div id="video-canvas" ref={containerRef} className="emulator-canvas" style={{ transform: `translate(${(rotatedWidth - width) / 2}px, ${(rotatedHeight - height) / 2}px) rotate(${rotation * 90}deg)` }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button hidden={true} onClick={playTestTone} className="btn btn-sm">
                            Play Test Tone
                        </button>
                    </div>
                </div>

                {/** Right: controls & tabs */}
                <div className={`emulator-right ${!hasDevice ? 'emulator-disabled' : ''}`}>
                    <div className="emulator-panel" style={{ padding: 0 }}>
                        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                            <Tabs.List className="emulator-tablist" role="tablist" aria-label="Emulator tabs">
                                <Tabs.Trigger value="settings" className="emulator-tab-button">Settings</Tabs.Trigger>
                                <Tabs.Trigger value="logcat" className="emulator-tab-button">Logcat</Tabs.Trigger>
                                <Tabs.Trigger value="files" className="emulator-tab-button">Files</Tabs.Trigger>
                                <Tabs.Trigger value="apps" className="emulator-tab-button">Apps</Tabs.Trigger>
                            </Tabs.List>

                            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                                <Tabs.Content value="settings">
                                    <div style={{ padding: 8 }}>
                                        <DeviceActions onStart={safeStart} isWsOpen={isWsOpen} onDisconnect={disconnect} />
                                    </div>
                                </Tabs.Content>

                                <Tabs.Content value="logcat">
                                    <div style={{ padding: 8 }}>
                                        <h4 style={{ marginTop: 0 }}>Logcat (mock)</h4>
                                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'var(--muted, #ccc)' }}>This is a mockup of the Logcat view. Real log streaming will be implemented later.</pre>
                                    </div>
                                </Tabs.Content>

                                <Tabs.Content value="files">
                                    <div style={{ padding: 8 }}>
                                        <h4 style={{ marginTop: 0 }}>Files (mock)</h4>
                                        <p style={{ color: 'var(--muted, #ccc)' }}>File browser placeholder — implement file listing and upload/download here.</p>
                                    </div>
                                </Tabs.Content>

                                <Tabs.Content value="apps">
                                    <div style={{ padding: 8 }}>
                                        <h4 style={{ marginTop: 0 }}>Apps (mock)</h4>
                                        <p style={{ color: 'var(--muted, #ccc)' }}>Apps placeholder — list installed apps and actions here.</p>
                                    </div>
                                </Tabs.Content>
                            </div>
                        </Tabs.Root>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdbEmulatorView;
