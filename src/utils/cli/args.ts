export const isSilent = (args: Record<string, unknown>): boolean => args.silent === true || process.env.NODE_ENV === 'production';

export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};
