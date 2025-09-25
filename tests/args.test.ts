import { describe, it, expect } from 'bun:test';

import { isSilent, isUrl } from '~/utils/cli/args';

describe('CLI args utils', () => {
  describe('isSilent', () => {
    it('should return true if silent is true', () => {
      expect(isSilent({ silent: true })).toBe(true);
    });

    it('should return false if silent is false', () => {
      expect(isSilent({ silent: false })).toBe(false);
    });

    it('should return false if silent is not present', () => {
      expect(isSilent({})).toBe(false);
    });

    it('should return true if NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      expect(isSilent({})).toBe(true);
      delete process.env.NODE_ENV; // clean up
    });
  });

  describe('isUrl', () => {
    it('should return true for a valid URL', () => {
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('https://example.com')).toBe(true);
    });

    it('should return false for an invalid URL', () => {
      expect(isUrl('not a url')).toBe(false);
      expect(isUrl('example.com')).toBe(false);
    });
  });
});
