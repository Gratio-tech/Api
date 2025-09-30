import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';

import { isUrl } from '~/utils/cli/args';
import { canPrompt } from '~/utils/cli/prompt';

import type { OpenAPI3, ReferenceObject } from 'openapi-typescript';

export async function getSpecLink(args: Record<string, unknown>, envName: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (!process.env[envName] && !canPrompt(args)) {
    console.warn('No link provided. Skipping.');
    process.exit(0);
  }

  const specLink = args.link ?? process.env[envName] ?? (await rl.question(`Please enter the link to the OpenAPI spec (${envName}): `));

  rl.close();

  return specLink as string;
}

export async function getToken(args: Record<string, unknown>, envName: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  if (!process.env[envName] && !canPrompt(args)) {
    console.warn('No PAT provided. Skipping.');
    process.exit(0);
  }

  const token =
    args.token ??
    process.env[envName] ??
    (await rl.question(`PAT is required. Please enter your Personal Access Token for GitLab or GitHub (${envName}): `));

  rl.close();

  return token as string;
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
