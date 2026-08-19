import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

import { isUrl, normalizeSpecLink } from '~/utils/cli/args';
import { canPrompt } from '~/utils/cli/prompt';

import type { OpenAPI3, ReferenceObject } from 'openapi-typescript';

// createPromptInterface helper needed to ensure normal development in the Node environment.
// process.stdin in Bun types has a weaker AsyncIterator, while node:readline/promises requires
// a Node-compatible NodeJS.ReadableStream with AsyncIterableIterator. At Node runtime, this is the normal stdin.
function createPromptInterface() {
  return createInterface({
    input: process.stdin as unknown as NodeJS.ReadableStream,
    output: process.stdout as unknown as NodeJS.WritableStream,
  });
}

export async function getSpecLink(args: Record<string, unknown>, envKey: string): Promise<string> {
  const fromArgs = typeof args.link === 'string' ? args.link : undefined;
  // First, need to check the CLI arguments, they should have maximum priority,
  // and only then try to read .env and ask for input.
  const fromEnv = process.env[envKey];
  const rawLink = fromArgs ?? fromEnv;

  if (rawLink) {
    return normalizeSpecLink(rawLink) as string;
  }

  if (!canPrompt(args)) {
    throw new Error(`OpenAPI link (or path to local file) is required: pass --link or set ${envKey}.`);
  }

  const rl = createPromptInterface();

  try {
    const promptedLink = await rl.question(
      `Please enter the link (or path to local file) to the OpenAPI spec (${envKey}): `
    );
    return normalizeSpecLink(promptedLink);
  } finally {
    rl.close();
  }
}

export async function getToken(args: Record<string, unknown>, tokenEnvKey: string): Promise<string> {
  const token = args.token ?? process.env[tokenEnvKey];

  if (token) {
    return token as string;
  }

  if (!canPrompt(args)) {
    throw new Error(`Personal Access Token (PAT) for GitLab or GitHub is required: pass --token or set ${tokenEnvKey}.`);
  }

  const rl = createPromptInterface();

  try {
    return await rl.question(`PAT is required. Please enter Personal Access Token for GitLab or GitHub (${tokenEnvKey}): `);
  } finally {
    rl.close();
  }
}

export async function getSpecContents(url: string, args: Record<string, unknown>, envName: string): Promise<string> {
  const rawUrl = url.includes('/blob/') ? url.replace('/blob/', '/raw/') : url;

  const fetchWithPat = async (pat?: string) => {
    const headers: HeadersInit = {};
    if (pat) {
      if (rawUrl.includes('gitlab')) headers['Private-Token'] = pat;
      else headers['Authorization'] = `token ${pat}`;
    }

    const response = await fetch(rawUrl, { headers });

    // response.redirected === true => the URL was redirected to auth.
    if (response.redirected || !response.ok) throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`);

    /** Gitlab API is used. @see {@link https://docs.gitlab.com/api/repository_files/#get-file-from-repository} */
    if (rawUrl.includes('/api/v4/projects')) {
      const json = await response.json();
      // Base64 decoding
      return atob(json.content);
    }

    /** Github API is used. @see {@link https://docs.github.com/en/rest/repos/contents#get-repository-content} */
    if (rawUrl.includes('api.github.com/repos')) {
      const json = await response.json();
      // Base64 decoding
      return atob(json.content);
    }

    return response.text();
  };

  if (!isUrl(rawUrl)) {
    return readFile(rawUrl, 'utf-8');
  }

  try {
    // Try fetching without PAT first
    const spec = await fetchWithPat();
    return spec;
  } catch {
    return fetchWithPat(await getToken(args, envName));
  }
}

export const parseSpec = (specContents: string): OpenAPI3 => JSON.parse(specContents);

export const isRef = (item: object | undefined): item is ReferenceObject => !!item && '$ref' in item;
