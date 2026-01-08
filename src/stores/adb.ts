import { create } from 'zustand';
import { adbService } from '@/services/adb-streamer/adb/adb-service.ts';

interface Display {
  id: string;
  resolution: string;
}

interface Encoder {
  type: string;
  id: string;
  codec: string;
  name: string;
  encoder?: string;
  decoder?: string;
}

interface Device {
  serial: string;
  displays: Display[];
  encoders: Encoder[];
}

interface AdbState {
  features: string[];
  devices: Device[];
  device: string | null;
  display: string | null;
  audioEncoder: string;
  videoEncoder: string | null;
  metainfo: () => Promise<void>;
  deviceObj: () => Device | undefined;
  displayObj: () => Display | undefined;
  displaySize: () => { width: number; height: number };
  audioEncoders: () => Encoder[];
  audioEncoderObj: () => Encoder | undefined;
  videoEncoders: () => Encoder[];
  videoEncoderObj: () => Encoder | undefined;
}

export const useAdbStore = create<AdbState>((set, get) => ({
  features: [],
  devices: [],
  device: null,
  display: null,
  audioEncoder: 'raw',
  videoEncoder: null,

  metainfo: async () => {
    const result = await adbService.metainfo();
    const features = result?.data?.features || [];
    const devices = result?.data?.devices || [];

    let deviceInitial: Device | undefined;
    let deviceSerial: string | null = null;
    if (devices.length) {
      deviceInitial = devices[0];
      deviceSerial = devices[0].serial;
    }

    let displayInitial: Display | undefined;
    let displayId: string | null = null;
    if (deviceInitial?.displays?.length) {
      displayInitial = deviceInitial.displays[0];
      displayId = displayInitial.id;
    }

    set({
      features,
      devices,
      device: deviceSerial,
      display: displayId,
    });
  },

  deviceObj: () => {
    const state = get();
    return state.devices?.find((d) => d.serial === state.device);
  },

  displayObj: () => {
    const state = get();
    const deviceObj = state.deviceObj();
    return deviceObj?.displays.find((d) => d.id === state.display);
  },

  displaySize: () => {
    const state = get();
    const displayObj = state.displayObj();
    const parts = displayObj ? displayObj.resolution.split('x') : ['0', '0'];
    const width = Number.parseInt(parts[0]) || 0;
    const height = Number.parseInt(parts[1]) || 0;

    return { width, height };
  },

  audioEncoders: () => {
    const state = get();
    const deviceObj = state.deviceObj();
    return [
      { type: 'audio', id: 'off', codec: 'off', name: 'off' },
      { type: 'audio', id: 'raw', codec: 'raw', name: 'raw' },
      ...(deviceObj?.encoders.filter((e) => e.type === 'audio') || []).map(
        (e) => ({ ...e, id: e.name })
      ),
    ];
  },

  audioEncoderObj: () => {
    const state = get();
    const audioEncoders = state.audioEncoders();
    return audioEncoders.find((e) => e.id === state.audioEncoder);
  },

  videoEncoders: () => {
    const state = get();
    const deviceObj = state.deviceObj();
    const encoders = deviceObj?.encoders.filter((e) => e.type === 'video') || [];
    const list: Encoder[] = [];

    for (const encoder of encoders) {
      if (encoder.codec?.toLowerCase() === 'h264') {
        const tinyH264 = {
          ...encoder,
          id: `TinyH264@${encoder.name}`,
          decoder: 'TinyH264',
        };
        list.push(tinyH264);
        const webcodecs = {
          ...encoder,
          id: `WebCodecs@${encoder.name}`,
          decoder: 'WebCodecs',
        };
        list.push(webcodecs);
      } else {
        list.push({
          ...encoder,
          id: `WebCodecs@${encoder.name}`,
          decoder: 'WebCodecs',
        });
      }
    }

    const result = [
      { type: 'video', codec: 'off', name: 'off', decoder: 'off', id: 'off' },
      ...list,
    ];

    const currentState = get();
    const defaultVideoEncoder = result.find(
      (e) => e.codec === 'h264' && e.decoder === 'TinyH264'
    );
    if (defaultVideoEncoder && !currentState.videoEncoder) {
      set({ videoEncoder: defaultVideoEncoder.id });
    }

    return result;
  },

  videoEncoderObj: () => {
    const state = get();
    const videoEncoders = state.videoEncoders();
    return videoEncoders.find((e) => e.id === state.videoEncoder);
  },
}));
