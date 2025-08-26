# Changelog

Все важные изменения в этом проекте будут документированы в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [1.0.0] - 2025-01-25

### Добавлено
- Базовые типы API: `ApiResponse<T>`, `ApiSuccessResponse<T>`, `ApiErrorResponse`
- Скрипт генерации типов `generate-types.js` с поддержкой URL и локальных файлов
- Исполняемый файл `gratio-generate-types` для глобальной установки
- Подробная документация по использованию и развертыванию
- Примеры интеграции с CI/CD

### Изменено
- Переработан `generate-types.js` для работы с внешними источниками схем
- Обновлен `package.json` с добавлением bin секции и скриптов
- Перенесены примеры использования из `CLIENT_USAGE.md` в `README.md`

### Удалено
- `CLIENT_USAGE.md` (информация перенесена в `README.md` и `USAGE.md`)

## Структура пакета

```
@gratio/api/
├── dist/                    # Скомпилированные TypeScript файлы
├── generate-types.js        # Скрипт генерации типов
├── README.md               # Основная документация
├── USAGE.md                # Подробное руководство
├── DEPLOYMENT.md           # Инструкции по развертыванию
└── package.json            # Конфигурация пакета
```

## Использование

### Установка
```bash
npm install @gratio/api
```

### Генерация типов
```bash
# Глобально
npm install -g @gratio/api
gratio-generate-types --url https://api.example.com/openapi.json

# Локально
npx @gratio/api generate-types --file ./schema.json
```

## Breaking Changes

Версия 1.0.0 является первой публичной версией пакета. Breaking changes не ожидаются.