# API Types
TypeScript типы для API ответов и запросов в проектах Gratio

## Установка

```bash
npm install @gratio/api
# Для использования шифрованных запросов:
npm install @gratio/crypt
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

**Для генерации типов в проекте добавьте в секцию script**
```
node generate-types
```
И обновляйте типы перед каждой сборкой своего проекта


## Разработка

```bash
# Установка зависимостей
npm install

# Сборка
npm run build

# Очистка
npm run clean
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
cd types
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

## Использование в других проектах

```bash
npm install @gratio/api
```

## Лицензия

MIT
