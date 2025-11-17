# Changelog

Все важные изменения в этом проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [3.1.2] - 2025-11-16

### Исправлено

- URL теперь правильно собирается в утилите `parseApiRequest`, включая префикс

## [3.1.1] - 2025-11-08

### Исправлено

- Исправлен парсинг path-параметров в утилите `parseApiRequest`, чтобы корректно обрабатывать фигурные скобки в URL

## [3.1.0] - 2025-11-06

### Добавлено

- Добавлена утилита `parseApiRequest` для упрощения создания запросов к API на основе спецификации OpenAPI и эндпоинтов

### Исправлено

- Исправлена генерация типов в корневой папке проекта при использовании команды генерации типов

## [3.0.0] - 2025-10-30

### Изменено

- Обновлена документация для улучшения понимания возможностей пакета
- Названия переменных окружения теперь лучше отражают их назначение
  - `GRATIO_TYPES_LINK` → `OPENAPI_TYPES_LINK`
  - `GRATIO_TYPES_TOKEN` → `OPENAPI_TYPES_TOKEN`
  - `GRATIO_TYPES_OUTPUT` → `OPENAPI_TYPES_OUTPUT`
  - `GRATIO_ENDPOINTS_LINK` → `OPENAPI_ENDPOINTS_LINK`
  - `GRATIO_ENDPOINTS_TOKEN` → `OPENAPI_ENDPOINTS_TOKEN`
  - `GRATIO_ENDPOINTS_OUTPUT` → `OPENAPI_ENDPOINTS_OUTPUT`

## Структура пакета

```
@gratio/api/
├── LICENSE                 # Лицензия
├── README.md               # Основная документация
├── dist/                   # Скомпилированные TypeScript файлы
└── package.json            # Конфигурация пакета
```

## [2.0.0] - 2025-09-25

### Добавлено

- Перепись CLI для улучшения UX
- Команда `gen types`/`gen t`
- Команда `gen endpoints`/`gen ep`
- Улучшенный CI/CD

## Структура пакета

```
@gratio/api/
├── LICENSE                 # Лицензия
├── README.md               # Основная документация
├── dist/                   # Скомпилированные TypeScript файлы
└── package.json            # Конфигурация пакета
```

## [1.0.0] - 2025-01-25

### Добавлено

- Базовые типы API: `ApiResponse<T>`, `ApiSuccessResponse<T>`, `ApiErrorResponse`
- Скрипт генерации типов `generate-types.js` с поддержкой URL и локальных файлов
- Исполняемый файл `gratio-generate-types` для глобальной установки
- Подробная документация

## Структура пакета

```
@gratio/api/
├── dist/                   # Скомпилированные TypeScript файлы
├── generate-types.js       # Скрипт генерации типов
├── README.md               # Основная документация
├── USAGE.md                # Подробное руководство
└── package.json            # Конфигурация пакета
```

## Breaking Changes

Версия 1.0.0 является первой публичной версией пакета. Breaking changes не ожидаются.
