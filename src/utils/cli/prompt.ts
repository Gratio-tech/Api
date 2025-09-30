export const canPrompt = (args: Record<string, unknown>): boolean =>
  args.prompt !== false && process.env.CI !== 'true' && process.env.NODE_ENV !== 'production';
