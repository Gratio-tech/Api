# @gratio/api

TypeScript типы для API ответов и запросов в проектах Gratio. Пакет предоставляет базовые типы для работы с API и включает в себя CLI для автоматической генерации типов из OpenAPI спецификаций.

## Возможности

- **Базовые типы API**: `ApiResponse<T>`, `ApiSuccessResponse<T>`, `ApiErrorResponse`
- **Автоматическая генерация типов**: Скрипт для создания TypeScript типов из OpenAPI схемы
- **Автоматическая генерация эндпоинтов**: Скрипт для создания TypeScript enum для каждого эндпоинта из OpenAPI схемы
- **Гибкость источников**: Поддержка URL и локальных файлов схем
- **Готовность к продакшену**: Типизированные ответы с обработкой ошибок

## Установка

```bash
npm install @gratio/api
# Для использования шифрованных запросов:
npm install @gratio/crypt
```

## Быстрый старт

### Использование базовых типов

```typescript
import type { ApiResponse } from '@gratio/api';

const response: ApiResponse<string> = {
  success: true,
  data: 'Hello World',
};
```

### Генерация типов для проекта

```bash
# Использование npx (не требует установки)
npx @gratio/api gen types --link https://api.example.com/openapi.json

# Глобальная установка для постоянного использования
npm install -g @gratio/api
api gen types --link https://api.example.com/openapi.json

# Генерация из локального файла схемы
npx @gratio/api gen types --link ./api/schema.json
```

### Генерация эндпоинтов для проекта

```bash
# Использование npx (не требует установки)
npx @gratio/api gen endpoints --link https://api.example.com/openapi.json

# Глобальная установка для постоянного использования
npm install -g @gratio/api
api gen endpoints --link https://api.example.com/openapi.json

# Генерация из локального файла схемы
npx @gratio/api gen endpoints --link ./api/schema.json
```

## Конфигурация через .env

Если флаг `--link` не указан, CLI берёт значение из переменных окружения, которые автоматически подгружаются из файла `.env` в корне проекта (используется dotenv). Для команд действуют такие переменные:

- Для `gen types`: `OPENAPI_TYPES_LINK`, `OPENAPI_TYPES_TOKEN`, `OPENAPI_TYPES_OUTPUT`
- Для `gen endpoints`: `OPENAPI_ENDPOINTS_LINK`, `OPENAPI_ENDPOINTS_TOKEN`, `OPENAPI_ENDPOINTS_OUTPUT`

Пример файла `.env`:

```
# OpenAPI источник (URL или локальный файл)
OPENAPI_TYPES_LINK=https://api.example.com/openapi.json
OPENAPI_ENDPOINTS_LINK=./api/schema.json

# Токены доступа (нужны для приватных репозиториев GitHub/GitLab)
OPENAPI_TYPES_TOKEN=ghp_your_token_here
OPENAPI_ENDPOINTS_TOKEN=glpat_your_token_here

# Куда писать результат (по умолчанию выводится в stdout)
OPENAPI_TYPES_OUTPUT=src/types/api.ts
OPENAPI_ENDPOINTS_OUTPUT=src/types/endpoints.ts
```

Примечание: если переменные не заданы и включены подсказки (`--prompt` по умолчанию), CLI спросит недостающие значения интерактивно. В CI/production режиме подсказки отключаются.

## Доступные типы

### Основные типы API

- `ApiResponse<T>` - Общий тип ответа API
- `ApiSuccessResponse<T>` - Успешный ответ с данными
- `ApiErrorResponse` - Ответ с ошибкой

### Типы для шифрованных данных

- `CryptedData` - Структура шифрованных данных
- `ApiResponseCrypted` - Ответ с шифрованными данными

## Использование типов

```typescript
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@gratio/api';

// Если планируется использовать шифрованное апи в проекте
import type { CryptedData, ApiResponseCrypted } from '@gratio/crypt';

// Типизация ответа API
const response: ApiResponse<string> = {
  success: true,
  data: "Hello World"
};

// Типизация шифрованного ответа
// Фактически это ApiResponse<CryptedData>
const cryptedResponse: ApiResponseCrypted = {
  success: true,
  data: {
    v: "vector",
    data: "encrypted_data"
  }
};

// Получение зашифрованных данных
async getEncryptedData(): Promise<ApiResponseCrypted> {
  const response = await fetch(`${baseUrl}/secure-api`);
  return response.json();
}
```

## Утилита: parseApiRequest

`parseApiRequest` помогает собрать корректный `Request` для `fetch` из структурированного описания запроса: базовый URL, путь с параметрами, метод, заголовки, тело и query-параметры.

Импорт:

```ts
import { parseApiRequest } from '@gratio/api';
```

### Пример: GET с path и query параметрами

```ts
const request = parseApiRequest({
  baseUrl: 'https://api.example.com',
  path: '/users/{id}',
  method: 'get',
  status: '200',
  pathParams: { id: '123' },
  queryParams: { search: 'john', limit: '10' },
  headers: { Authorization: `Bearer ${token}` },
});

const response = await fetch(request);
const data = await response.json();
```

### Пример: POST с JSON-телом

```ts
type CreateUserDto = { name: string; email: string };

const request = parseApiRequest({
  baseUrl: 'https://api.example.com',
  path: '/users',
  method: 'post',
  status: '201',
  body: { name: 'John', email: 'john@example.com' } satisfies CreateUserDto,
});

const response = await fetch(request);
```

### Пример: POST с FormData

```ts
const form = new FormData();
form.append('avatar', file);

const request = parseApiRequest({
  baseUrl: 'https://api.example.com',
  path: '/users/{id}/avatar',
  method: 'post',
  status: '200',
  pathParams: { id: '123' },
  body: form, // Content-Type проставлять не нужно — браузер выставит boundary автоматически
});

await fetch(request);
```

Примечания:

- Если указан `FormData`, заголовок `Content-Type` не добавляется вручную.
- Путь может включать параметры вида `{id}` — они будут подставлены из `pathParams` с URL-экранированием. Query-параметры добавляются из `queryParams`.

## `@gratio/api gen types --help`

```
Usage: @gratio/api gen types [...flags] [...args]
Alias: @gratio/api gen t

Generates types using OpenAPI 3 specification.

Flags:
  -s, --silent     Suppresses all console output except errors.
  -p, --prompt     Whether to prompt for missing information like spec URL or PAT.
  -l, --link       The URL to the OpenAPI specification (OPENAPI_TYPES_LINK).
  -P, --token      Personal Access Token with api scope (OPENAPI_TYPES_TOKEN).
  -o, --output     The output path for the generated types file (OPENAPI_TYPES_OUTPUT).
```

Примечание: значение для `--link` может быть как URL, так и путём к локальному файлу (например, `./api/schema.json`).

## `@gratio/api gen endpoints --help`

```
Usage: @gratio/api gen endpoints [...flags] [...args]
Alias: @gratio/api gen ep

Generates endpoint enum with data from OpenAPI 3 specification.

Flags:
  -s, --silent     Suppresses all console output except errors.
  -p, --prompt     Whether to prompt for missing information like spec URL or PAT.
  -l, --link       The URL to the OpenAPI specification (OPENAPI_ENDPOINTS_LINK).
  -P, --token      Personal Access Token with api scope (OPENAPI_ENDPOINTS_TOKEN).
  -o, --output     The output path for the generated endpoint file (OPENAPI_ENDPOINTS_OUTPUT).
```

Примечание: значение для `--link` может быть как URL, так и путём к локальному файлу (например, `./api/schema.json`).

## Лицензия

Этот проект находится под лицензией [MIT](https://choosealicense.com/licenses/mit/). Вы можете свободно использовать его в своих целях.
