import { describe, it, expect } from 'bun:test';

import { canPrompt } from '~/utils/cli/prompt';

describe('CLI prompt utils', () => {
  describe('canPrompt', () => {
    it('should return false if prompt is false', () => {
      expect(canPrompt({ prompt: false })).toBe(false);
    });

    it('should return true if prompt is not false', () => {
      if (process.env.CI) delete process.env.CI;
      if (process.env.NODE_ENV) delete process.env.NODE_ENV;

      expect(canPrompt({ prompt: true })).toBe(true);
      expect(canPrompt({})).toBe(true);
    });

    it('should return false if CI is true', () => {
      process.env.CI = 'true';
      expect(canPrompt({})).toBe(false);
      delete process.env.CI;
    });

    it('should return false if NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(canPrompt({})).toBe(false);
      delete process.env.NODE_ENV;
    });

    it('should return true if CI is not true and NODE_ENV is not production', () => {
      expect(canPrompt({})).toBe(true);
    });
  });
});
