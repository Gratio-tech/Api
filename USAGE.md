# Руководство по использованию @gratio/api

## Установка

```bash
npm install @gratio/api
```

## Базовое использование типов

```typescript
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@gratio/api';

// Типизация ответа API
const response: ApiResponse<string> = {
  success: true,
  data: "Hello World"
};

// Обработка ответа
if (response.success) {
  console.log(response.data); // TypeScript знает, что data существует
} else {
  console.error(response.errors); // TypeScript знает, что errors существует
}
```

## Генерация типов для конкретных проектов

### Способ 1: Глобальная установка (рекомендуется)

```bash
# Установка глобально
npm install -g @gratio/api

# Использование
gratio-generate-types --url https://api.example.com/openapi.json
gratio-generate-types --file ./schema.json
```

### Способ 2: Локальное использование

```bash
# Использование через npx
npx @gratio/api generate-types --url https://api.example.com/openapi.json
npx @gratio/api generate-types --file ./schema.json
```

### Способ 3: Добавление в package.json проекта

```json
{
  "scripts": {
    "generate-types": "gratio-generate-types --url https://api.example.com/openapi.json --output ./src/types/api.ts",
    "prebuild": "npm run generate-types"
  }
}
```

## Опции скрипта генерации

| Опция | Короткая | Описание | Пример |
|-------|----------|----------|---------|
| `--url` | `-u` | URL к OpenAPI спецификации | `--url https://api.example.com/openapi.json` |
| `--file` | `-f` | Путь к локальному файлу схемы | `--file ./schema.json` |
| `--output` | `-o` | Путь для выходного файла | `--output ./src/types/api.ts` |
| `--format` | `--fmt` | Формат выходного файла | `--format json` |
| `--help` | `-h` | Показать справку | `--help` |

## Примеры использования

### Генерация из URL

```bash
gratio-generate-types --url https://petstore.swagger.io/v2/swagger.json --output ./pet-types.ts
```

### Генерация из локального файла

```bash
gratio-generate-types --file ./openapi-spec.json --output ./api-types.ts
```

### Генерация в формате JSON

```bash
gratio-generate-types --file ./schema.json --format json --output ./schema-copy.json
```

### Автоматическая генерация перед сборкой

```json
{
  "scripts": {
    "generate-types": "gratio-generate-types --url https://api.example.com/openapi.json --output ./src/types/api.ts",
    "prebuild": "npm run generate-types",
    "build": "tsc",
    "dev": "npm run generate-types && tsc --watch"
  }
}
```

## Интеграция с CI/CD

### GitHub Actions

```yaml
name: Generate Types
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  generate-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @gratio/api
      - run: gratio-generate-types --url ${{ secrets.API_URL }} --output ./src/types/api.ts
      - run: git config --local user.email "action@github.com"
      - run: git config --local user.name "GitHub Action"
      - run: git add ./src/types/api.ts
      - run: git commit -m "Update generated types" || exit 0
      - run: git push
```

### GitLab CI

```yaml
generate-types:
  stage: build
  image: node:18
  script:
    - npm install -g @gratio/api
    - gratio-generate-types --url $API_URL --output ./src/types/api.ts
  artifacts:
    paths:
      - src/types/api.ts
```

## Структура проекта с типами

```
my-project/
├── src/
│   ├── types/
│   │   ├── api.ts          # Сгенерированные типы
│   │   └── index.ts        # Экспорт типов
│   ├── api/
│   │   └── client.ts       # API клиент
│   └── components/
│       └── UserList.tsx    # React компонент
├── package.json
└── tsconfig.json
```

### src/types/index.ts

```typescript
// Экспорт базовых типов
export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@gratio/api';

// Экспорт сгенерированных типов
export type { User, UserListResponse, ErrorResponse } from './api';
```

### src/api/client.ts

```typescript
import type { ApiResponse, User, UserListResponse } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUsers(): Promise<ApiResponse<UserListResponse>> {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return response.json();
  }
}

export default ApiClient;
```

## Обработка ошибок

```typescript
import type { ApiResponse, ErrorResponse } from '../types';

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
  const users = handleApiResponse(await apiClient.getUsers());
  console.log('Users:', users);
} catch (error) {
  console.error('API call failed:', error.message);
}
```

## Типизация с дженериками

```typescript
class TypedApiClient {
  constructor(private baseUrl: string) {}

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
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

const users = await client.get<UserListResponse>('/users');
const newUser = await client.post<{ name: string; email: string }, User>(
  '/users',
  { name: 'John', email: 'john@example.com' }
);
```

## Лучшие практики

1. **Автоматизация**: Настройте автоматическую генерацию типов перед каждой сборкой
2. **Версионирование**: Коммитьте сгенерированные типы в репозиторий
3. **Валидация**: Проверяйте корректность схемы перед генерацией
4. **Документация**: Документируйте изменения в API схеме
5. **Тестирование**: Тестируйте типы на реальных данных

## Устранение неполадок

### Ошибка "Необходимо указать --url или --file"

Убедитесь, что вы передаете один из обязательных параметров:

```bash
# Правильно
gratio-generate-types --url https://api.example.com/openapi.json

# Неправильно
gratio-generate-types
```

### Ошибка загрузки схемы по URL

Проверьте:
- Доступность URL
- Корректность JSON схемы
- Наличие CORS заголовков

### Ошибка чтения файла

Проверьте:
- Существование файла
- Права доступа
- Корректность JSON

### Типы не генерируются

Убедитесь, что в схеме есть секция `components.schemas`:

```json
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "name": { "type": "string" }
        }
      }
    }
  }
}
```