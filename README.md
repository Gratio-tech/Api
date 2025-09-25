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

## `@gratio/api gen types --help`

```
Usage: @gratio/api gen types [...flags] [...args]
Alias: @gratio/api gen t

Generates types using OpenAPI 3 specification.

Flags:
  -s, --silent     Suppresses all console output except errors.
  -p, --prompt     Whether to prompt for missing information like spec URL or PAT.
  -l, --link       The URL to the OpenAPI specification (GRATIO_TYPES_LINK).
  -P, --token      Personal Access Token with api scope (GRATIO_TYPES_TOKEN).
  -o, --output     The output path for the generated types file (GRATIO_TYPES_OUTPUT).
```

## `@gratio/api gen endpoints --help`

```
Usage: @gratio/api gen endpoints [...flags] [...args]
Alias: @gratio/api gen ep

Generates endpoint enum with data from OpenAPI 3 specification.

Flags:
  -s, --silent     Suppresses all console output except errors.
  -p, --prompt     Whether to prompt for missing information like spec URL or PAT.
  -l, --link       The URL to the OpenAPI specification (GRATIO_ENDPOINTS_LINK).
  -P, --token      Personal Access Token with api scope (GRATIO_ENDPOINTS_TOKEN).
  -o, --output     The output path for the generated endpoint file (GRATIO_ENDPOINTS_OUTPUT).
```

## Лицензия

Этот проект находится под лицензией [MIT](https://choosealicense.com/licenses/mit/). Вы можете свободно использовать его в своих целях.
