// typescript
import React, { useState, useEffect } from 'react';
import { useAdbStore } from '@/stores/adb';
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS } from '@/services/adb-streamer/utils/constants';

interface DeviceActionsProps {
    isWsOpen: boolean;
    onStart: (params: { maxFps: number; bitRate: number; audioEncoder?: string; audioCodec?: string; videoEncoder?: string; videoCodec?: string; device?: string }) => void;
    onDisconnect?: () => void;
}

const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'left',
    justifyContent: 'left',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 6,
    background: '#2b2b2b',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer',
};

const controlRow: React.CSSProperties = {
    display: 'flex',
    gap: 10,
    alignItems: 'left',
    flexWrap: 'wrap',
    justifyContent: 'lfet',
};

const inputStyle: React.CSSProperties = {
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'transparent',
    color: 'inherit',
    minWidth: 120,
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    marginBottom: 4,
    color: 'inherit',
};

const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
};

const DeviceActions: React.FC<DeviceActionsProps> = ({ isWsOpen, onStart, onDisconnect }) => {
    const adbStore = useAdbStore();
    const [maxFps, setMaxFps] = useState<number>(DEAULT_MAX_FPS);
    const [bitRate, setBitRate] = useState<number>(DEAULT_BIT_RATE);

    const audioEncoders = adbStore.audioEncoders();
    const videoEncoders = adbStore.videoEncoders();
    const devices = adbStore.devices || [];

    // Local encoder lists derived from the selected device for immediate UI updates
    const [localAudioEncoders, setLocalAudioEncoders] = useState<any[]>(
        audioEncoders.map((a: any) => ({ ...a, id: a.id ?? a.name }))
    );
    const [localVideoEncoders, setLocalVideoEncoders] = useState<any[]>(
        videoEncoders.map((v: any) => ({ ...v, id: v.id ?? v.name }))
    );

    // Normalize device identifier: support string device entries and objects
    const getDeviceId = (d: any) => {
        if (!d) return '';
        if (typeof d === 'string') return d;
        return d.name ?? d.serverKey ?? d.serial ?? d.id ?? '';
    };

    // Local selected id to keep the <select> responsive even if store setter is slow/fails
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>(getDeviceId(adbStore.device) || '');

    // Keep local selectedDeviceId in sync when the store's device changes
    useEffect(() => {
        const id = getDeviceId(adbStore.device) || '';
        if (id !== selectedDeviceId) {
            setSelectedDeviceId(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adbStore.device]);

    // Generic helper to call possible store setters safely.
    // Try calling with the provided arg (object or id). If that fails and arg is an object,
    // also try calling with the normalized id string.
    const callStoreSetter = (names: string[], arg: any) => {
        for (const name of names) {
            const fn = (adbStore as any)[name];
            if (typeof fn === 'function') {
                try {
                    fn(arg);
                    return true;
                } catch {
                    // ignore
                }
                if (arg && typeof arg === 'object') {
                    const id = getDeviceId(arg);
                    if (id) {
                        try {
                            fn(id);
                            return true;
                        } catch {
                            // ignore
                        }
                    }
                }
            }
        }
        return false;
    };

    const tryCallDeviceSetter = (deviceOrId: any) => {
        return callStoreSetter(
            ['setDevice', 'setDeviceId', 'selectDevice', 'selectDeviceById', 'setSelectedDevice'],
            deviceOrId
        );
    };

    // default to first device when devices become available and none selected
    useEffect(() => {
        const current = getDeviceId(adbStore.device);
        if ((!current || current === '') && devices.length > 0) {
            const first = devices[0];
            if (first) {
                tryCallDeviceSetter(first);
            }
        }
        // only re-run when devices length or selected device changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devices.length, adbStore.device]);

    // Audio / video encoder selects (minimal controlled implementation)
    // Use encoder `id` consistently for selection values. Initialize state from store if available,
    // otherwise pick the first available encoder from the currently selected device.
    const initialAudioId = adbStore.audioEncoderObj()?.id || audioEncoders[0]?.id || 'raw';
    const initialVideoId = adbStore.videoEncoderObj()?.id || videoEncoders[0]?.id || 'off';
    const [selectedAudio, setSelectedAudio] = useState<string>(initialAudioId);
    const [selectedVideo, setSelectedVideo] = useState<string>(initialVideoId);

    // When the selected device changes, refresh encoder lists and pick sensible defaults.
    useEffect(() => {
        // find matched device by id
        const matched = devices.find((d: any) => getDeviceId(d) === selectedDeviceId);

        // determine audio encoders from matched device if available, otherwise from store
        const aes = matched
            ? (matched.encoders || [])
                  .filter((e: any) => e.type === 'audio')
                  .map((e: any) => ({ ...e, id: e.name ?? e.id }))
            : adbStore.audioEncoders();

        const ves = matched
            ? (matched.encoders || [])
                  .filter((e: any) => e.type === 'video')
                  .map((e: any) => {
                      if ((e.codec || '').toLowerCase() === 'h264') {
                          return [
                              { ...e, id: `TinyH264@${e.name}`, decoder: 'TinyH264' },
                              { ...e, id: `WebCodecs@${e.name}`, decoder: 'WebCodecs' },
                          ];
                      }
                      return [{ ...e, id: `WebCodecs@${e.name}`, decoder: 'WebCodecs' }];
                  })
                  .flat()
            : adbStore.videoEncoders();

        // Update local encoder lists for rendering
        setLocalAudioEncoders(aes.map((a: any) => ({ ...a, id: a.id ?? a.name })));
        setLocalVideoEncoders(ves.map((v: any) => ({ ...v, id: v.id ?? v.name })));

        // pick sensible defaults from local lists or store
        const audioId = adbStore.audioEncoderObj()?.id || (aes[0] && (aes[0].id ?? aes[0].name)) || 'raw';
        const videoId = adbStore.videoEncoderObj()?.id || (ves[0] && (ves[0].id ?? ves[0].name)) || 'off';
        setSelectedAudio(audioId);
        setSelectedVideo(videoId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDeviceId, devices.length]);

    const handleAudioChange = (value: string) => {
        setSelectedAudio(value);
        callStoreSetter(['setAudioEncoder', 'setAudioEncoderName', 'selectAudioEncoder'], value);
    };

    const handleVideoChange = (value: string) => {
        setSelectedVideo(value);
        callStoreSetter(['setVideoEncoder', 'setVideoEncoderName', 'selectVideoEncoder'], value);
    };

    const handleStart = () => {
        // Determine codec strings for the selected encoder ids
        const audioObj = localAudioEncoders.find((a) => (a.id ?? a.name) === selectedAudio) || audioEncoders.find((a: any) => (a.id ?? a.name) === selectedAudio) || null;
        const videoObj = localVideoEncoders.find((v) => (v.id ?? v.name) === selectedVideo) || videoEncoders.find((v: any) => (v.id ?? v.name) === selectedVideo) || null;
        const audioCodec = audioObj?.codec ?? undefined;
        const videoCodec = videoObj?.codec ?? undefined;
        onStart({ maxFps, bitRate, audioEncoder: selectedAudio, audioCodec, videoEncoder: selectedVideo, videoCodec, device: selectedDeviceId });
    };

    const handlePrimary = () => {
        if (isWsOpen) {
            try {
                onDisconnect?.();
            } catch {
                // ignore
            }
            setMaxFps(DEAULT_MAX_FPS);
            setBitRate(DEAULT_BIT_RATE);
            setSelectedAudio(adbStore.audioEncoderObj()?.name || audioEncoders[0]?.name || '');
            setSelectedVideo(adbStore.videoEncoderObj()?.name || videoEncoders[0]?.name || '');
            tryCallDeviceSetter('');
        } else {
            handleStart();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', gap: 12, padding: 12 }}>
            <div style={controlRow}>
                <div style={fieldStyle}>
                    <label style={labelStyle}>Device</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <select
                            value={selectedDeviceId}
                            onChange={(e) => {
                                console.debug('[DeviceActions] select.onChange', { value: e.target.value });
                                const id = e.target.value;
                                setSelectedDeviceId(id);
                                const matched = devices.find((d: any) => getDeviceId(d) === id);
                                // prefer passing the full matched object (store setters may accept object),
                                // fall back to id string if not found.
                                const success = tryCallDeviceSetter(matched ?? id);
                                if (!success) {
                                    // Fallback: try direct assignment like older implementation
                                    try {
                                        // some stores allow direct assignment to `device`
                                        (adbStore as any).device = matched ?? id;
                                    } catch (err) {
                                        // nothing we can do gracefully here; keep local state updated so UI responds
                                    }
                                }
                            }}
                            onClick={(e) => { console.debug('[DeviceActions] select.onClick'); e.stopPropagation(); }}
                            onFocus={(e) => { console.debug('[DeviceActions] select.onFocus'); e.stopPropagation(); }}
                            onMouseDownCapture={(e) => console.debug('[DeviceActions] select.onMouseDownCapture', e.type)}
                            onMouseUpCapture={(e) => console.debug('[DeviceActions] select.onMouseUpCapture', e.type)}
                            onMouseDown={(e) => { console.debug('[DeviceActions] select.onMouseDown'); e.stopPropagation(); }}
                            onKeyDown={(e) => { /* ensure arrow keys reach select */ e.stopPropagation(); }}
                            style={{
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                minWidth: '250px',
                                pointerEvents: 'auto',
                                position: 'relative',
                                zIndex: 9999,
                            }}
                        >
                            <option value="">-- select device --</option>
                            {devices.map((device: any) => {
                                const id = getDeviceId(device);
                                const label = typeof device === 'string'
                                    ? device
                                    : (device.displayName ?? device.name ?? device.serial ?? device.id ?? id);
                                return (
                                    <option key={id || label} value={id}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Audio Encoder</label>
                    <select
                        value={selectedAudio}
                        onChange={(e) => handleAudioChange(e.target.value)}
                        style={inputStyle}
                    >
                        {localAudioEncoders.map((a: any) => (
                            <option key={a.id ?? a.name} value={a.id ?? a.name}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Video Encoder</label>
                    <select
                        value={selectedVideo}
                        onChange={(e) => handleVideoChange(e.target.value)}
                        style={inputStyle}
                    >
                        {localVideoEncoders.map((v: any) => (
                            <option key={v.id ?? v.name} value={v.id ?? v.name}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={controlRow}>
                <div style={fieldStyle}>
                    <label style={labelStyle}>Max FPS</label>
                    <input
                        type="number"
                        value={maxFps}
                        onChange={(e) => setMaxFps(Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Bitrate</label>
                    <input
                        type="number"
                        value={bitRate}
                        onChange={(e) => setBitRate(Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button onClick={handlePrimary} style={buttonStyle}>
                        {isWsOpen ? 'Disconnect' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceActions;
