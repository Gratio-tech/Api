import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export function createTemplate(path: string, isRaw = false) {
  let template = isRaw ? path : readFileSync(`${path}.template`, 'utf-8');

  if (!template) {
    throw new Error(`Template not found at path: ${path}`);
  }

  const get = () => template;

  const write = (outputPath: string): void => {
    try {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, template);
      console.info(`✓ ${outputPath}`);
    } catch {
      console.error(`✖ ${outputPath}`);
    }
  };

  const fill = (key: string, value: string) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    template = template.replace(regex, value);

    return {
      get,
      write,
      fill,
    };
  };

  return {
    get,
    write,
    fill,
  };
}
