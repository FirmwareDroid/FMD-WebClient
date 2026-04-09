import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAdbStore } from '@/stores/adb';

// Mock the adbService so the store can be tested without HTTP calls
vi.mock('@/services/adb-streamer/adb/adb-service.ts', () => ({
    adbService: {
        metainfo: vi.fn(),
    },
}));

import { adbService } from '@/services/adb-streamer/adb/adb-service.ts';

const mockedMetainfo = vi.mocked(adbService.metainfo);

const INITIAL_STATE = {
    features: [],
    devices: [],
    device: null,
    display: null,
    audioEncoder: 'raw',
    videoEncoder: null,
};

beforeEach(() => {
    useAdbStore.setState(INITIAL_STATE);
    vi.clearAllMocks();
});

describe('useAdbStore – initial state', () => {
    it('has correct defaults', () => {
        const state = useAdbStore.getState();
        expect(state.features).toEqual([]);
        expect(state.devices).toEqual([]);
        expect(state.device).toBeNull();
        expect(state.display).toBeNull();
        expect(state.audioEncoder).toBe('raw');
        expect(state.videoEncoder).toBeNull();
    });
});

describe('useAdbStore.metainfo', () => {
    it('populates devices, features, device and display from API response', async () => {
        mockedMetainfo.mockResolvedValue({
            data: {
                features: ['feature-a', 'feature-b'],
                devices: [
                    {
                        name: 'device-1',
                        serial: 'SERIAL1',
                        displays: [{ id: 0, resolution: '1080x1920' }],
                        encoders: [],
                    },
                ],
            },
        } as any);

        await useAdbStore.getState().metainfo();
        const state = useAdbStore.getState();

        expect(state.features).toEqual(['feature-a', 'feature-b']);
        expect(state.devices).toHaveLength(1);
        expect(state.device).toBe('device-1');
        expect(state.display).toBe('0');
    });

    it('falls back to serial when name is absent', async () => {
        mockedMetainfo.mockResolvedValue({
            data: {
                features: [],
                devices: [
                    {
                        serial: 'SERIAL-ONLY',
                        displays: [],
                        encoders: [],
                    },
                ],
            },
        } as any);

        await useAdbStore.getState().metainfo();
        expect(useAdbStore.getState().device).toBe('SERIAL-ONLY');
    });

    it('handles empty device list gracefully', async () => {
        mockedMetainfo.mockResolvedValue({ data: { features: [], devices: [] } } as any);

        await useAdbStore.getState().metainfo();
        const state = useAdbStore.getState();
        expect(state.device).toBeNull();
        expect(state.display).toBeNull();
    });

    it('handles null/undefined API response gracefully', async () => {
        mockedMetainfo.mockResolvedValue(null as any);

        await useAdbStore.getState().metainfo();
        const state = useAdbStore.getState();
        expect(state.features).toEqual([]);
        expect(state.devices).toEqual([]);
    });
});

describe('useAdbStore.deviceObj', () => {
    it('returns undefined when devices list is empty', () => {
        expect(useAdbStore.getState().deviceObj()).toBeUndefined();
    });

    it('finds device by name', () => {
        useAdbStore.setState({
            devices: [{ name: 'dev-a', displays: [], encoders: [] }],
            device: 'dev-a',
        });
        expect(useAdbStore.getState().deviceObj()?.name).toBe('dev-a');
    });

    it('finds device by serial as fallback', () => {
        useAdbStore.setState({
            devices: [{ serial: 'S123', displays: [], encoders: [] }],
            device: 'S123',
        });
        expect(useAdbStore.getState().deviceObj()?.serial).toBe('S123');
    });
});

describe('useAdbStore.displayObj', () => {
    it('returns undefined when no device is selected', () => {
        expect(useAdbStore.getState().displayObj()).toBeUndefined();
    });

    it('returns the correct display when device and display are set', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [
                        { id: 0, resolution: '1080x1920' },
                        { id: 1, resolution: '720x1280' },
                    ],
                    encoders: [],
                },
            ],
            device: 'dev-a',
            display: '1',
        });
        const disp = useAdbStore.getState().displayObj();
        expect(disp?.resolution).toBe('720x1280');
    });

    it('coerces numeric display ids (server sends number)', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [{ id: 2, resolution: '800x600' }],
                    encoders: [],
                },
            ],
            device: 'dev-a',
            display: '2',
        });
        expect(useAdbStore.getState().displayObj()?.resolution).toBe('800x600');
    });
});

describe('useAdbStore.displaySize', () => {
    it('returns {width:0, height:0} when no display selected', () => {
        expect(useAdbStore.getState().displaySize()).toEqual({ width: 0, height: 0 });
    });

    it('parses resolution string correctly', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [{ id: 0, resolution: '1920x1080' }],
                    encoders: [],
                },
            ],
            device: 'dev-a',
            display: '0',
        });
        expect(useAdbStore.getState().displaySize()).toEqual({ width: 1920, height: 1080 });
    });
});

describe('useAdbStore.audioEncoders', () => {
    it('always includes off and raw encoders', () => {
        const encoders = useAdbStore.getState().audioEncoders();
        const ids = encoders.map((e) => e.id);
        expect(ids).toContain('off');
        expect(ids).toContain('raw');
    });

    it('includes device audio encoders when a device is selected', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [],
                    encoders: [{ type: 'audio', id: 'aac1', codec: 'aac', name: 'aac-enc' }],
                },
            ],
            device: 'dev-a',
        });
        const encoders = useAdbStore.getState().audioEncoders();
        const ids = encoders.map((e) => e.id);
        expect(ids).toContain('aac-enc'); // name is used as id
    });
});

describe('useAdbStore.videoEncoders', () => {
    it('always includes off encoder', () => {
        const encoders = useAdbStore.getState().videoEncoders();
        expect(encoders[0].id).toBe('off');
    });

    it('creates TinyH264 and WebCodecs variants for h264 encoders', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [],
                    encoders: [{ type: 'video', id: 'v1', codec: 'h264', name: 'h264-enc' }],
                },
            ],
            device: 'dev-a',
            videoEncoder: null,
        });
        const encoders = useAdbStore.getState().videoEncoders();
        const ids = encoders.map((e) => e.id);
        expect(ids).toContain('TinyH264@h264-enc');
        expect(ids).toContain('WebCodecs@h264-enc');
    });

    it('uses WebCodecs only for non-h264 codecs', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [],
                    encoders: [{ type: 'video', id: 'v1', codec: 'av1', name: 'av1-enc' }],
                },
            ],
            device: 'dev-a',
            videoEncoder: null,
        });
        const encoders = useAdbStore.getState().videoEncoders();
        const ids = encoders.map((e) => e.id);
        expect(ids).toContain('WebCodecs@av1-enc');
        expect(ids).not.toContain('TinyH264@av1-enc');
    });

    it('auto-selects TinyH264 as default video encoder when videoEncoder is null', () => {
        useAdbStore.setState({
            devices: [
                {
                    name: 'dev-a',
                    displays: [],
                    encoders: [{ type: 'video', id: 'v1', codec: 'h264', name: 'h264-enc' }],
                },
            ],
            device: 'dev-a',
            videoEncoder: null,
        });
        useAdbStore.getState().videoEncoders(); // trigger side effect
        expect(useAdbStore.getState().videoEncoder).toBe('TinyH264@h264-enc');
    });
});
