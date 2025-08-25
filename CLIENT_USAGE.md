# Использование типов API в клиентских проектах

## Установка пакета с типами

```bash
npm install @gratio/api
```

## Базовое использование

### Импорт типов

```typescript
import type { ApiResponse, CryptedData, ApiResponseCrypted } from '@gratio/api';
```

### Типизация API клиента

```typescript
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Получение зашифрованных данных
  async getEncryptedData(): Promise<ApiResponseCrypted> {
    const response = await fetch(`${this.baseUrl}/secure-api`);
    return response.json();
  }
}
```

### Использование в React компонентах




### Использование в Node.js проектах

## Обработка ошибок

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

## Типизация с дженериками

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
