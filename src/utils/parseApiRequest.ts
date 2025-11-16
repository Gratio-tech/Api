interface ApiResponse {
  path: string;
  method: string;
  status: string;
}

interface ApiRequest extends ApiResponse {
  baseUrl: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown> | FormData;
  queryParams?: Record<string, string>;
  pathParams?: Record<string, string>;
}

/** Parse ApiRequest to a Request object. */
export function parseApiRequest(request: ApiRequest): Request {
  // Parse query parameters
  const url = new URL(request.baseUrl + request.path);
  if (request.queryParams) {
    for (const [key, value] of Object.entries(request.queryParams)) {
      url.searchParams.append(key, String(value));
    }
  }

  // Parse path parameters
  for (const [key, value] of Object.entries(request.pathParams || {})) {
    // %7B = {
    // %7D = }
    url.pathname = url.pathname.replace(new RegExp(`%7B${key}%7D`, 'g'), encodeURIComponent(String(value)));
  }

  // Parse headers
  const headers = new Headers(request.headers || {});
  if (request.body && !(request.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }

  return new Request(url.toString(), {
    method: request.method.toUpperCase(),
    headers,
    body: request.body ? (request.body instanceof FormData ? request.body : JSON.stringify(request.body)) : undefined,
  });
}
