# Быстрый старт с @gratio/api

## 🚀 Установка

```bash
npm install @gratio/api
```

## 📝 Базовое использование

### 1. Импорт типов

```typescript
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '@gratio/api';
```

### 2. Типизация API ответов

```typescript
// Успешный ответ
const successResponse: ApiResponse<string> = {
  success: true,
  data: "Hello World"
};

// Ответ с ошибкой
const errorResponse: ApiResponse<string> = {
  success: false,
  errors: "Something went wrong"
};
```

### 3. Обработка ответов

```typescript
function handleResponse<T>(response: ApiResponse<T>): T {
  if (response.success) {
    return response.data!;
  } else {
    throw new Error(`API Error: ${response.errors}`);
  }
}
```

## 🔧 Генерация типов для проекта

### Способ 1: Глобальная установка

```bash
# Установка
npm install -g @gratio/api

# Генерация из URL
gratio-generate-types --url https://api.example.com/openapi.json

# Генерация из файла
gratio-generate-types --file ./schema.json
```

### Способ 2: Локальное использование

```bash
# Генерация через npx
npx @gratio/api generate-types --url https://api.example.com/openapi.json
```

### Способ 3: Автоматизация в package.json

```json
{
  "scripts": {
    "generate-types": "gratio-generate-types --url https://api.example.com/openapi.json --output ./src/types/api.ts",
    "prebuild": "npm run generate-types"
  }
}
```

## 📁 Структура проекта

```
my-project/
├── src/
│   ├── types/
│   │   ├── api.ts          # Сгенерированные типы
│   │   └── index.ts        # Экспорт типов
│   └── api/
│       └── client.ts       # API клиент
├── package.json
└── tsconfig.json
```

## 🔗 Создание API клиента

```typescript
import type { ApiResponse, User } from '../types';

class ApiClient {
  constructor(private baseUrl: string) {}

  async getUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    return response.json();
  }
}
```

## 📚 Дополнительная документация

- **[README.md](README.md)** - Основная документация
- **[USAGE.md](USAGE.md)** - Подробное руководство
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Инструкции по развертыванию

## 🆘 Получение помощи

```bash
# Справка по скрипту генерации
gratio-generate-types --help

# Проверка версии
npm list @gratio/api
```

## 💡 Примеры

### React компонент

```typescript
import React, { useState, useEffect } from 'react';
import type { ApiResponse, User } from '../types';

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then((response: ApiResponse<User>) => {
        if (response.success) {
          setUser(response.data!);
        } else {
          setError(Array.isArray(response.errors) ? response.errors.join(', ') : response.errors);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Node.js сервер

```typescript
import type { ApiResponse, User } from './types';

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUserById(parseInt(req.params.id));
    
    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    
    res.json(response);
  } catch (error) {
    const response: ApiResponse<User> = {
      success: false,
      errors: error.message
    };
    
    res.status(500).json(response);
  }
});
```