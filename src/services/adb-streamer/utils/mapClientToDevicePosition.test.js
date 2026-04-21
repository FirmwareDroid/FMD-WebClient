import { describe, it, expect } from 'vitest';
import { mapClientToDevicePosition } from '@/services/adb-streamer/utils/mapClientToDevicePosition.js';

const makeRect = (x = 0, y = 0, width = 100, height = 200) => ({ x, y, width, height });

describe('mapClientToDevicePosition', () => {
    it('maps a centred pointer correctly with rotation 0', () => {
        const result = mapClientToDevicePosition({
            clientX: 50,
            clientY: 100,
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 0,
            width: 1080,
            height: 1920,
        });
        expect(result.x).toBeCloseTo(540);
        expect(result.y).toBeCloseTo(960);
    });

    it('maps top-left corner to (0, 0) with rotation 0', () => {
        const result = mapClientToDevicePosition({
            clientX: 0,
            clientY: 0,
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 0,
            width: 1080,
            height: 1920,
        });
        expect(result.x).toBe(0);
        expect(result.y).toBe(0);
    });

    it('maps bottom-right corner to (width, height) with rotation 0', () => {
        const result = mapClientToDevicePosition({
            clientX: 100,
            clientY: 200,
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 0,
            width: 1080,
            height: 1920,
        });
        expect(result.x).toBe(1080);
        expect(result.y).toBe(1920);
    });

    it('clamps pointer outside the client rect', () => {
        const result = mapClientToDevicePosition({
            clientX: -50,  // outside left edge
            clientY: 300,  // outside bottom edge
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 0,
            width: 1080,
            height: 1920,
        });
        expect(result.x).toBe(0);
        expect(result.y).toBe(1920);
    });

    it('swaps x/y axes for rotation 1 (90°)', () => {
        // With rotation 1, axes are swapped and the new Y is flipped.
        // viewX = 25/100 = 0.25, viewY = 50/200 = 0.25
        // After swap: viewX = 0.25, viewY = 0.25
        // case 1: viewY = 1 - 0.25 = 0.75
        // result: x = 0.25 * 1080 = 270, y = 0.75 * 1920 = 1440
        const result = mapClientToDevicePosition({
            clientX: 25,
            clientY: 50,
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 1,
            width: 1080,
            height: 1920,
        });
        expect(result.x).toBeCloseTo(270);
        expect(result.y).toBeCloseTo(1440);
    });

    it('inverts both axes for rotation 2 (180°)', () => {
        const result = mapClientToDevicePosition({
            clientX: 25,
            clientY: 50,
            clientRect: makeRect(0, 0, 100, 200),
            rotation: 2,
            width: 1080,
            height: 1920,
        });
        // viewX=0.25→1-0.25=0.75; viewY=0.25→1-0.25=0.75
        expect(result.x).toBeCloseTo(0.75 * 1080);
        expect(result.y).toBeCloseTo(0.75 * 1920);
    });

    it('handles a non-zero clientRect offset', () => {
        // rect starts at (10, 20)
        const result = mapClientToDevicePosition({
            clientX: 60,
            clientY: 120,
            clientRect: makeRect(10, 20, 100, 200),
            rotation: 0,
            width: 1000,
            height: 2000,
        });
        // (60-10)/100 = 0.5, (120-20)/200 = 0.5
        expect(result.x).toBeCloseTo(500);
        expect(result.y).toBeCloseTo(1000);
    });
});
