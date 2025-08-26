# @gratio/api

TypeScript типы для API ответов и запросов в проектах Gratio. Пакет предоставляет базовые типы для работы с API и включает в себя скрипт для автоматической генерации типов из OpenAPI спецификаций.

## Возможности
- **Базовые типы API**: `ApiResponse<T>`, `ApiSuccessResponse<T>`, `ApiErrorResponse`
- **Автоматическая генерация типов**: Скрипт для создания TypeScript типов из OpenAPI схем
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
  data: "Hello World"
};
```

### Генерация типов для проекта

```bash
# Использование npx (не требует установки)
npx @gratio/api generate-types --url https://api.example.com/openapi.json

# Глобальная установка для постоянного использования
npm install -g @gratio/api
gratio-generate-types --url https://api.example.com/openapi.json

# Генерация из локального файла схемы
npx @gratio/api generate-types --file ./api/schema.json
```

## Документация

- **[Подробное руководство](USAGE.md)** - Полное описание возможностей и примеров
- **[Примеры использования](#примеры-использования-в-проектах)** - Базовые примеры в этом README

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

## Генерация типов для конкретных проектов

Для получения типов конкретного проекта используйте встроенный скрипт генерации типов:

```bash
# Установка глобально
npm install -g @gratio/api
gratio-generate-types --url https://api.example.com/openapi.json

# Без установки
npx @gratio/api generate-types --url https://api.example.com/openapi.json
```

## Опции скрипта генерации

| Опция | Короткая | Описание | Пример |
|-------|----------|----------|---------|
| `--url` | `-u` | URL к OpenAPI спецификации | `--url https://api.example.com/openapi.json` |
| `--file` | `-f` | Путь к локальному файлу схемы | `--file ./schema.json` |
| `--output` | `-o` | Путь для выходного файла | `--output ./src/types/api.ts` |
| `--format` | `--fmt` | Формат выходного файла | `--format json` |
| `--help` | `-h` | Показать справку | `--help` |

### Примеры команд:

```bash
# Генерация из URL (основной способ использования)
npx @gratio/api generate-types --url https://api.example.com/openapi.json

# Генерация из локального файла
npx @gratio/api generate-types --file ./api/schema.json

# Указание выходного файла (по умолчанию: ./generated-types.ts)
npx @gratio/api generate-types --url https://api.example.com/openapi.json --output ./types/api.ts

# Генерация в формате JSON (для отладки)
npx @gratio/api generate-types --file ./schema.json --format json --output ./schema-debug.json

# Справка по использованию
npx @gratio/api generate-types --help
```

### Интеграция в проект

Добавьте скрипт в ваш `package.json` для автоматической генерации типов:

```json
{
  "scripts": {
    "generate-types": "npx @gratio/api generate-types --url https://your-api.example.com/openapi.json --output ./generated/api.ts",
    "build": "npm run generate-types && tsc"
  }
}
```

Теперь вы можете генерировать типы командой:
```bash
npm run generate-types
```

## Использование сгенерированных типов в коде

   ```typescript
   import type { ApiResponse } from '@gratio/api';
   import type { User, CreateUserRequest } from './types/api';

   const createUser = async (userData: CreateUserRequest): Promise<ApiResponse<User>> => {
     const response = await fetch('/api/users', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(userData)
     });
     return response.json();
   };
   ```

### Типизация API клиента

```typescript
import type { ApiResponse, ApiResponseCrypted } from '@gratio/api';
import type { User, Product, CreateOrderRequest, Order } from './types/api'; // Сгенерированные типы

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Получение пользователей
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }

  // Создание заказа
  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  }

  // Получение зашифрованных данных
  async getEncryptedData(): Promise<ApiResponseCrypted> {
    const response = await fetch(`${this.baseUrl}/secure-api`);
    return response.json();
  }
}
```

### Обработка ошибок

```typescript
function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data!;
  } else {
    const errorMessage = Array.isArray(response.errors)
      ? response.errors.join(', ')
      : response.errors;

    throw new Error(`API Error: ${errorMessage}`);
  }
}

// Использование
try {
  const data = handleApiResponse(await apiClient.getEncryptedData());
  console.log('Success:', data);
} catch (error) {
  console.error('API call failed:', error.message);
}
```

### Типизация с дженериками

```typescript
// Создание типизированного API клиента
class TypedApiClient<T> {
  constructor(private baseUrl: string) {}

  async get<TResponse>(endpoint: string): Promise<ApiResponse<TResponse>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    return response.json();
  }

  async post<TRequest, TResponse>(
    endpoint: string,
    data: TRequest
  ): Promise<ApiResponse<TResponse>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Использование
const client = new TypedApiClient('http://localhost:3000');

// Типизированные вызовы
const encryptedData = await client.get<CryptedData>('/secure-api');
const leadResult = await client.post<{ id: string }, { leadID: string }>(
  '/secure-api/addLeadByID',
  { id: '123' }
);
```

#### Пример package.json scripts для проекта

```json
{
  "scripts": {
    "types:generate": "npx @gratio/api generate-types --url https://api.example.com/openapi.json --output ./generated/api.ts",
    "types:generate:local": "npx @gratio/api generate-types --file ./schema.json --output ./generated/api.ts",
    "prebuild": "npm run types:generate",
    "build": "tsc",
    "dev": "npm run types:generate && npm run dev:start"
  }
}
```

## Разработка

```bash
# Установка зависимостей
npm install

# Сборка
npm run build

# Показать справку по генерации типов
npm run generate-types
```

## Основные принципы разработки

### 1. Обратная совместимость

- Не удалять существующие типы
- Добавлять новые типы как опциональные
- Использовать union типы для расширения

### 2. Документация

- Поддерживаем актуальность README
- Добавляем примеры использования при обновлении
- Описывать breaking changes

## Публикация пакета

### 1. Подготовка к публикации

```bash
npm install
npm run build
```

### 2. Проверка содержимого

```bash
npm pack --dry-run
```

### 3. Публикация

```bash
npm login
npm publish
```

### 4. Обновление версии

```bash
npm version patch  # или minor, major
npm publish
```

## Лицензия

MIT
