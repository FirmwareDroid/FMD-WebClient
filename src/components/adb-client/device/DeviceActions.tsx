// typescript
import React, { useState, useEffect } from 'react';
import { useAdbStore } from '@/stores/adb';
import { DEAULT_BIT_RATE, DEAULT_MAX_FPS } from '@/services/adb-streamer/utils/constants';

interface DeviceActionsProps {
    isWsOpen: boolean;
    onStart: (params: { maxFps: number; bitRate: number }) => void;
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

    // Normalize device identifier: support string device entries and objects
    const getDeviceId = (d: any) => {
        if (!d) return '';
        if (typeof d === 'string') return d;
        return d.serial ?? d.id ?? d.name ?? '';
    };

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
        callStoreSetter(
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
    const initialAudio = (adbStore.audioEncoderObj()?.name) || (audioEncoders[0]?.name) || '';
    const initialVideo = (adbStore.videoEncoderObj()?.name) || (videoEncoders[0]?.name) || '';
    const [selectedAudio, setSelectedAudio] = useState<string>(initialAudio);
    const [selectedVideo, setSelectedVideo] = useState<string>(initialVideo);

    useEffect(() => {
        setSelectedAudio(adbStore.audioEncoderObj()?.name || audioEncoders[0]?.name || '');
        setSelectedVideo(adbStore.videoEncoderObj()?.name || videoEncoders[0]?.name || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adbStore, audioEncoders.length, videoEncoders.length]);

    const handleAudioChange = (value: string) => {
        setSelectedAudio(value);
        callStoreSetter(['setAudioEncoder', 'setAudioEncoderName', 'selectAudioEncoder'], value);
    };

    const handleVideoChange = (value: string) => {
        setSelectedVideo(value);
        callStoreSetter(['setVideoEncoder', 'setVideoEncoderName', 'selectVideoEncoder'], value);
    };

    const handleStart = () => {
        onStart({ maxFps, bitRate });
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
                    <select
                        value={getDeviceId(adbStore.device) || ''}
                        onChange={(e) => {
                            const id = e.target.value;
                            const matched = devices.find((d: any) => getDeviceId(d) === id);
                            // prefer passing the full matched object (store setters may accept object),
                            // fall back to id string if not found.
                            tryCallDeviceSetter(matched ?? id);
                        }}
                        style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            minWidth: '250px',
                        }}
                    >
                        <option value="">-- select device --</option>
                        {devices.map((device: any) => {
                            const id = getDeviceId(device);
                            const label = typeof device === 'string'
                                ? device
                                : (device.name ?? device.serial ?? device.id ?? id);
                            return (
                                <option key={id || label} value={id}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div style={fieldStyle}>
                    <label style={labelStyle}>Audio Encoder</label>
                    <select
                        value={selectedAudio}
                        onChange={(e) => handleAudioChange(e.target.value)}
                        style={inputStyle}
                    >
                        {audioEncoders.map((a: any) => (
                            <option key={a.name} value={a.name}>
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
                        {videoEncoders.map((v: any) => (
                            <option key={v.name} value={v.name}>
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
