import { describe, it, expect } from 'bun:test';

import { parseSpec, isRef } from '~/utils/cli/openApi';

import type { ReferenceObject } from 'openapi-typescript';

describe('OpenAPI utils', () => {
  describe('parseSpec', () => {
    it('should parse a valid JSON string into an OpenAPI3 object', () => {
      const specString = '{"openapi":"3.0.0","info":{"title":"My API","version":"1.0.0"},"paths":{}}';
      const spec = parseSpec(specString);
      expect(spec.openapi).toBe('3.0.0');
      expect(spec.info.title).toBe('My API');
    });

    it('should throw an error for an invalid JSON string', () => {
      const invalidSpecString = '{"openapi":"3.0.0"';
      expect(() => parseSpec(invalidSpecString)).toThrow();
    });
  });

  describe('isRef', () => {
    it('should return true for a valid ReferenceObject', () => {
      const refObject: ReferenceObject = { $ref: '#/components/schemas/User' };
      expect(isRef(refObject)).toBe(true);
    });

    it('should return false for an object that is not a ReferenceObject', () => {
      const notRefObject = { type: 'string' };
      expect(isRef(notRefObject)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRef(undefined)).toBe(false);
    });

    it('should return false for a null object', () => {
      const nullObject = null;
      // @ts-expect-error testing invalid input
      expect(isRef(nullObject)).toBe(false);
    });
  });
});
