import { unlinkSync, readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { describe, it, expect, afterAll } from 'bun:test';

import { createTemplate } from '~/utils/template';

const templatePath = join(import.meta.dir, 'test.template');
const outputPath = join(import.meta.dir, 'output.txt');

describe('createTemplate', () => {
  afterAll(() => {
    // Clean up created files
    if (existsSync(outputPath)) {
      unlinkSync(outputPath);
    }
    if (existsSync(templatePath)) {
      unlinkSync(templatePath);
    }
  });

  it('should create a template, fill it, and write the output', () => {
    writeFileSync(templatePath, 'Hello {{ name }}!');

    const template = createTemplate(templatePath.replace('.template', ''));

    template.fill('name', 'World').write(outputPath);

    const outputContent = readFileSync(outputPath, 'utf-8');
    expect(outputContent).toBe('Hello World!');
  });

  it('should handle raw string templates', () => {
    const rawTemplate = 'This is a {{ raw }} template.';
    const template = createTemplate(rawTemplate, true);

    template.fill('raw', 'test').write(outputPath);

    const outputContent = readFileSync(outputPath, 'utf-8');
    expect(outputContent).toBe('This is a test template.');
  });

  it('get() should return the current state of the template', () => {
    const template = createTemplate('Initial content', true);
    expect(template.get()).toBe('Initial content');
    template.fill('key', 'value'); // This won't do anything as there's no placeholder
    expect(template.get()).toBe('Initial content');
    const template2 = createTemplate('Hello {{ name }}', true);
    template2.fill('name', 'Bun');
    expect(template2.get()).toBe('Hello Bun');
  });

  it('should throw an error if template file does not exist', () => {
    expect(() => {
      createTemplate('nonexistent/path');
    }).toThrow("ENOENT: no such file or directory, open 'nonexistent/path.template'");
  });
});
