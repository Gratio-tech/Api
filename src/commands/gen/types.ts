import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { dirname } from 'path';

import { defineCommand } from 'krosh';

import { isSilent } from '~/utils/cli/args';
import { getSpecContents, getSpecLink } from '~/utils/cli/openApi';

export default defineCommand({
  description: 'Generates types using OpenAPI 3 specification.',
  alias: ['t'],
  options: {
    silent: {
      type: 'boolean',
      description: 'Suppresses all console output except errors.',
      short: 's',
      default: false,
    },
    prompt: {
      type: 'boolean',
      description: 'Whether to prompt for missing information like spec URL or PAT.',
      short: 'p',
      default: true,
    },
    link: {
      type: 'string',
      description: 'The URL to the OpenAPI specification (GRATIO_TYPES_LINK).',
      short: 'l',
    },
    token: {
      type: 'string',
      description: 'Personal Access Token with api scope (GRATIO_TYPES_TOKEN).',
      short: 'P',
    },
    output: {
      type: 'string',
      description: 'The output path for the generated types file (GRATIO_TYPES_OUTPUT).',
      short: 'o',
      default: 'stdout',
    },
  },
  run: async ({ args }) => {
    if (isSilent(args)) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }

    // Defer import to speed up CLI startup time
    // TODO: Replace with modern syntax - https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html#support-for-import-defer
    const openApiImport = import('openapi-typescript');

    try {
      const specLink = await getSpecLink(args, 'GRATIO_TYPES_LINK');

      const specContents = await getSpecContents(specLink, args, 'GRATIO_TYPES_TOKEN');

      const { astToString, default: openapiTS } = await openApiImport;
      const ast = await openapiTS(specContents);
      const contents = astToString(ast);

      const outputPath = args.output ?? process.env.GRATIO_TYPES_OUTPUT;

      if (outputPath === 'stdout') {
        console.log(contents);
        return;
      }

      if (typeof outputPath === 'string') {
        mkdirSync(dirname(outputPath), { recursive: true });
        await writeFile(outputPath, contents);
        console.info(`✓ ${outputPath}`);
      }
    } catch (error) {
      console.error('Error generating types:', error);
      process.exit(1);
    }
  },
});
