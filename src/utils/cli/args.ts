import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const isSilent = (args: Record<string, unknown>): boolean => args.silent === true || process.env.NODE_ENV === 'production';

export const isUrl = (str: string): boolean => {
  try {
    const parsed = new URL(str);
    // On Windows, a path like "C:" was resolved as correct protocol, so the scheme needs to be checked precisely
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const normalizeSpecLink = (rawValue: string): string => {
  let value = rawValue.trim();
  while (
    value.length >= 2 &&
    ['"', "'", '`'].includes(value[0]) &&
    value[0] === value.at(-1)
  ) {
    value = value.slice(1, -1).trim();
  }
  if (!value) {
    throw new Error('OpenAPI specification link cannot be empty.');
  }
  if (value.startsWith('file:')) {
    return fileURLToPath(value);
  }
  if (isUrl(value)) {
    return value;
  }
  if (value === '~') {
    return homedir();
  }
  if (value.startsWith('~/') || value.startsWith('~\\')) {
    value = resolve(homedir(), value.slice(2));
  }
  return resolve(value);
}
