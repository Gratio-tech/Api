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

export async function getSpecContents(
  url: string,
  args: Record<string, unknown>,
  envName: string
): Promise<string> {
  const rawUrl = url.includes('/blob/')
    ? url.replace('/blob/', '/raw/')
    : url;

  if (!isUrl(rawUrl)) {
    return readFile(rawUrl, 'utf-8');
  }

  type FetchResult = {
    response: Response;
    contents?: string;
  };

  const isOpenApi3Json = (contents: string): boolean => {
    try {
      const value = JSON.parse(contents) as {
        openapi?: unknown;
        paths?: unknown;
      };

      return (
        value !== null &&
        typeof value === 'object' &&
        typeof value.openapi === 'string' &&
        value.openapi.startsWith('3.') &&
        value.paths !== null &&
        typeof value.paths === 'object'
      );
    } catch {
      return false;
    }
  };

  const decodeResponse = async (response: Response): Promise<string> => {
    const responseUrl = response.url || rawUrl;

    /** Используется GitLab Repository Files API. */
    if (responseUrl.includes('/api/v4/projects')) {
      const json = (await response.json()) as { content?: unknown };

      if (typeof json.content !== 'string') {
        throw new Error('GitLab API response does not contain file content.');
      }

      return atob(json.content);
    }

    /** Используется GitHub Contents API. */
    if (
      responseUrl.includes('api.github.com/repos') ||
      rawUrl.includes('api.github.com/repos')
    ) {
      const json = (await response.json()) as { content?: unknown };

      if (typeof json.content !== 'string') {
        throw new Error('GitHub API response does not contain file content.');
      }

      return atob(json.content);
    }

    return response.text();
  };

  const fetchSpec = async (pat?: string): Promise<FetchResult> => {
    const headers: HeadersInit = {};

    if (pat) {
      if (rawUrl.includes('gitlab')) {
        headers['Private-Token'] = pat;
      } else {
        headers.Authorization = `token ${pat}`;
      }
    }

    // Fetch сам следует redirect-ам. Сам по себе redirect не является ошибкой.
    const response = await fetch(rawUrl, { headers });

    if (!response.ok) {
      return { response };
    }

    return { response, contents: await decodeResponse(response) };
  };

  const requireSuccess = (result: FetchResult): string => {
    if (!result.response.ok) {
      throw new Error(
        `Failed to fetch spec: ${result.response.status} ${result.response.statusText}`
      );
    }

    if (result.contents === undefined) {
      throw new Error('Failed to fetch spec: response body is missing.');
    }

    return result.contents;
  };

  const tokenFromArgs =
    typeof args.token === 'string' && args.token
      ? args.token
      : undefined;

  const suppliedToken = tokenFromArgs ?? process.env[envName];

  // Если PAT явно предоставлен, не делаем лишний анонимный запрос.
  // Это также поддерживает сервисы, скрывающие приватные ресурсы за 404.
  if (suppliedToken) {
    return requireSuccess(await fetchSpec(suppliedToken));
  }

  const anonymousResult = await fetchSpec();

  if (anonymousResult.response.ok) {
    const contents = requireSuccess(anonymousResult);

    // Обычный успешный ответ принимаем сразу.
    if (!anonymousResult.response.redirected) {
      return contents;
    }

    // Публичные GitHub/CDN redirect-ы возвращают нормальную спецификацию.
    if (isOpenApi3Json(contents)) {
      return contents;
    }

    // Redirect привёл к HTML/JSON страницы авторизации.
    // Конкретный URL авторизации может называться как угодно.
    const token = await getToken(args, envName);
    return requireSuccess(await fetchSpec(token));
  }

  // Только эти статусы однозначно означают недостаток авторизации.
  if (
    anonymousResult.response.status === 401 ||
    anonymousResult.response.status === 403
  ) {
    const token = await getToken(args, envName);
    return requireSuccess(await fetchSpec(token));
  }

  // Не превращаем опечатку в URL, rate limit или падение сервера
  // в ошибку «требуется PAT».
  return requireSuccess(anonymousResult);
}

export const parseSpec = (specContents: string): OpenAPI3 => JSON.parse(specContents);

export const isRef = (item: object | undefined): item is ReferenceObject => !!item && '$ref' in item;
