import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
    it('returns an empty string when called with no arguments', () => {
        expect(cn()).toBe('');
    });

    it('returns a single class unchanged', () => {
        expect(cn('foo')).toBe('foo');
    });

    it('merges multiple classes', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('deduplicates conflicting Tailwind classes (last wins)', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });

    it('ignores falsy values', () => {
        expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar');
    });

    it('supports conditional object syntax', () => {
        expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
    });

    it('supports array syntax', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('merges tailwind background colors correctly (last wins)', () => {
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
});
