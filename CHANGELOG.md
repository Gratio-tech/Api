# Changelog

Все важные изменения в этом проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

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
