# Руководство по использованию @gratio/api

## Установка

```bash
npm install @gratio/api
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
// Фак��ически это ApiResponse<CryptedData>
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
