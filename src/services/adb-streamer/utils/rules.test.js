import { describe, it, expect } from 'vitest';
import { rules } from '@/services/adb-streamer/utils/rules.js';

describe('rules.required', () => {
    it('returns a passing result for a non-empty value', () => {
        const [validate] = rules.required('Field');
        expect(validate('hello')).toBe(true);
    });

    it('returns an error message for an empty value', () => {
        const [validate] = rules.required('Username');
        expect(validate('')).toBe('Username is required');
    });

    it('returns an error message for undefined', () => {
        const [validate] = rules.required('Email');
        expect(validate(undefined)).toBe('Email is required');
    });
});

describe('rules.name', () => {
    const [required, minChars, maxChars, allowedChars] = rules.name('Name');

    it('passes for a valid name', () => {
        expect(required('valid-name')).toBe(true);
        expect(minChars('valid-name')).toBe(true);
        expect(maxChars('valid')).toBe(true);
        expect(allowedChars('valid-name')).toBe(true);
    });

    it('required: fails for empty value', () => {
        expect(required('')).toContain('required');
    });

    it('minChars: fails when fewer than 4 characters', () => {
        expect(minChars('ab')).toContain('greater than or equal to');
    });

    it('maxChars: fails when more than 20 characters', () => {
        expect(maxChars('a'.repeat(21))).toContain('less than');
    });

    it('allowedChars: fails for uppercase letters', () => {
        expect(allowedChars('Invalid')).toContain('Unallowed characters');
    });

    it('allowedChars: fails for special characters', () => {
        expect(allowedChars('hello world')).toContain('Unallowed characters');
    });

    it('allowedChars: passes for lowercase-alphanumeric with hyphens', () => {
        expect(allowedChars('my-app-123')).toBe(true);
    });
});

describe('rules.email', () => {
    const [required, emailFormat] = rules.email;

    it('required: fails for empty value', () => {
        expect(required('')).toContain('required');
    });

    it('emailFormat: passes for a valid email', () => {
        expect(emailFormat('user@example.com')).toBe(true);
    });

    it('emailFormat: fails for a string without @', () => {
        expect(emailFormat('notanemail')).toContain('Invalid email address');
    });
});

describe('rules.password', () => {
    const [required, minChars] = rules.password;

    it('required: fails for empty value', () => {
        expect(required('')).toContain('required');
    });

    it('minChars: fails for fewer than 4 characters', () => {
        expect(minChars('abc')).toContain('greater than or equal to');
    });

    it('minChars: passes for 4+ characters', () => {
        expect(minChars('abcd')).toBe(true);
    });
});

describe('rules.nekoPassword', () => {
    const [required, minChars] = rules.nekoPassword;

    it('required: fails for empty value', () => {
        expect(required('')).toContain('required');
    });

    it('minChars: passes for 4+ characters', () => {
        expect(minChars('abcd')).toBe(true);
    });
});
