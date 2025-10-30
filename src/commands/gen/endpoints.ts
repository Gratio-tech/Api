import { defineCommand } from 'krosh';

import { isSilent } from '~/utils/cli/args';
import { getSpecContents, getSpecLink, isRef, parseSpec } from '~/utils/cli/openApi';
import { createTemplate } from '~/utils/template';

import type { Method, OpenAPI3, OperationObject } from 'openapi-typescript';

/**
 * Extracts all paths and their corresponding HTTP methods from an OpenAPI specification.
 * @returns [string, Method, OperationObject][] - A tuple containing the path, its method & operations.
 * @example
 * ```
 * getPaths(spec); // returns [['/users', 'get', {...}], ['/users/{id}', 'post', {...}], ...]
 * ```
 */
function getPaths(spec: OpenAPI3): [string, Method, OperationObject][] {
  const paths = Object.keys(spec.paths || {});

  if (paths.length === 0) {
    throw new Error('No paths found in the OpenAPI spec.');
  }

  return paths.flatMap(path => {
    const methods = Object.keys(spec.paths?.[path] || {}).filter(method =>
      ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method.toLowerCase())
    ) as Method[];
    const getOperations = (method: Method): OperationObject =>
      spec.paths && !isRef(spec.paths[path]) && method in spec.paths[path] && !isRef(spec.paths[path][method])
        ? spec.paths[path][method] || {}
        : {};
    return methods.map(method => [path, method, getOperations(method)]) as [string, Method, OperationObject][];
  });
}

/** Gets the first successful response code (2xx) from an OperationObject. Defaults to '200' if none found. */
function getFirstSuccessfulResponse(operations: OperationObject): string {
  const responses = operations.responses ?? {};
  const successCodes = Object.keys(responses).filter(code => code.startsWith('2'));
  return successCodes[0] ?? '200';
}

/** Converts a path and method to PascalCase format for use as an enum key. */
function pathToPascalCase(path: string, method: Method): string {
  return [method, ...path.split(/\W|_/g).filter(Boolean)].map(segment => segment.charAt(0).toUpperCase() + segment.slice(1)).join('');
}

/** Converts paths to enum entries. */
function pathsToEndpoints(paths: ReturnType<typeof getPaths>): string {
  return paths.map(([path, method]) => `  ${pathToPascalCase(path, method)},`).join('\n');
}

/** Converts paths to endpoint response mappings. */
function pathsToResponses(paths: ReturnType<typeof getPaths>): string {
  return paths
    .map(([path, method, operations]) =>
      [
        `  [Endpoint.${pathToPascalCase(path, method)}]: {`,
        `    path: '${path}',`,
        `    method: '${method}',`,
        `    status: '${getFirstSuccessfulResponse(operations)}',`,
        '  } as const,',
      ].join('\n')
    )
    .join('\n');
}

export default defineCommand({
  description: 'Generates endpoint enum with data from OpenAPI 3 specification.',
  alias: ['ep'],
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
      description: 'The URL to the OpenAPI specification (OPENAPI_ENDPOINTS_LINK).',
      short: 'l',
    },
    token: {
      type: 'string',
      description: 'Personal Access Token with api scope (OPENAPI_ENDPOINTS_TOKEN).',
      short: 'P',
    },
    output: {
      type: 'string',
      description: 'The output path for the generated endpoint file (OPENAPI_ENDPOINTS_OUTPUT).',
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

    try {
      const specLink = await getSpecLink(args, 'OPENAPI_ENDPOINTS_LINK');

      const specContents = await getSpecContents(specLink, args, 'OPENAPI_ENDPOINTS_TOKEN');
      const spec = parseSpec(specContents);
      const paths = getPaths(spec);

      const outputPath = args.output ?? process.env.OPENAPI_ENDPOINTS_OUTPUT;

      const template = createTemplate(
        [
          'export interface ApiResponse {',
          '  path: string;',
          '  method: string;',
          '  status: string;',
          '}',
          '',
          'export enum Endpoint {',
          '{{endpoints}}',
          '};',
          '',
          'export const EndpointResponse = {',
          '{{responses}}',
          '};',
          '',
        ].join('\n'),
        true
      )
        .fill('endpoints', pathsToEndpoints(paths))
        .fill('responses', pathsToResponses(paths));

      if (outputPath === 'stdout') {
        console.log(template.get());
        return;
      }

      if (typeof outputPath === 'string') template.write(outputPath);
    } catch (error) {
      console.error('Error generating endpoints:', error);
      process.exit(1);
    }
  },
});
