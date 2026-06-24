import { describe, it, expect } from 'vitest';
import { getFileSizeInMb, getFileUrl } from '@/services/adb-streamer/utils/file.js';

describe('getFileSizeInMb', () => {
    it('returns 0 when file has no size', () => {
        expect(getFileSizeInMb({ size: 0 })).toBe(0);
        expect(getFileSizeInMb({})).toBe(0);
    });

    it('returns an integer when the result is a whole number', () => {
        const oneMb = 1 * 1024 ** 2;
        const result = getFileSizeInMb({ size: oneMb });
        expect(result).toBe(1);
        expect(Number.isInteger(result)).toBe(true);
    });

    it('returns a string with two decimal places for fractional sizes', () => {
        const bytes = 1.5 * 1024 ** 2; // 1.5 MB
        const result = getFileSizeInMb({ size: bytes });
        expect(result).toBe('1.50');
    });

    it('handles files larger than 1 GB', () => {
        const twoGb = 2 * 1024 ** 3;
        const result = getFileSizeInMb({ size: twoGb });
        // 2 GB = 2048 MB (exact integer)
        expect(result).toBe(2048);
    });
});

describe('getFileUrl', () => {
    it('builds a proper file URL', () => {
        expect(getFileUrl('https://api.example.com', '42')).toBe('https://api.example.com/api/file/42');
    });

    it('works with numeric file IDs', () => {
        expect(getFileUrl('https://host', 123)).toBe('https://host/api/file/123');
    });
});
