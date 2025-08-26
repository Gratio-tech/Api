# Развертывание @gratio/api

## Подготовка к публикации

### 1. Проверка сборки

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Проверка содержимого dist/
ls -la dist/
```

### 2. Проверка package.json

Убедитесь, что в `package.json` корректно настроены:

- `name`: `@gratio/api`
- `version`: Актуальная версия
- `main`: `dist/index.js`
- `types`: `dist/index.d.ts`
- `bin`: `gratio-generate-types`
- `files`: Включает `dist` и `generate-types.js`

### 3. Проверка содержимого пакета

```bash
# Предварительный просмотр содержимого
npm pack --dry-run

# Создание локального пакета для проверки
npm pack
tar -tzf gratio-api-*.tgz
```

## Публикация

### 1. Авторизация

```bash
npm login
# Введите логин, пароль и email
```

### 2. Публикация

```bash
npm publish
```

### 3. Проверка публикации

```bash
# Проверка на npmjs.com
npm view @gratio/api

# Установка в тестовый проект
npm install @gratio/api
```

## Обновление версии

### 1. Выбор типа версии

```bash
# Патч (исправления)
npm version patch

# Минорная версия (новые функции)
npm version minor

# Мажорная версия (breaking changes)
npm version major
```

### 2. Публикация обновления

```bash
npm publish
```

## Тестирование после публикации

### 1. Создание тестового проекта

```bash
mkdir test-package
cd test-package
npm init -y
```

### 2. Установка пакета

```bash
npm install @gratio/api
```

### 3. Тестирование функциональности

```bash
# Проверка базовых типов
node -e "console.log(require('@gratio/api'))"

# Проверка скрипта генерации
npx @gratio/api generate-types --help
```

## Troubleshooting

### Ошибка "Package name too similar"

Если npm отказывается публиковать из-за похожего имени:

1. Проверьте уникальность имени
2. Рассмотрите альтернативные имена
3. Обратитесь в поддержку npm

### Ошибка "You must be logged in"

```bash
npm login
# Проверьте логин
npm whoami
```

### Ошибка "Package already exists"

```bash
# Проверьте текущую версию
npm view @gratio/api version

# Обновите версию
npm version patch
npm publish
```

## CI/CD интеграция

### GitHub Actions

```yaml
name: Publish Package
on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### GitLab CI

```yaml
publish:
  stage: deploy
  image: node:18
  script:
    - npm ci
    - npm run build
    - npm publish
  only:
    - tags
  environment:
    name: production
```

## Безопасность

### 1. NPM токены

- Используйте токены с ограниченными правами
- Не коммитьте токены в репозиторий
- Регулярно обновляйте токены

### 2. Проверка зависимостей

```bash
# Проверка уязвимостей
npm audit

# Обновление зависимостей
npm update
npm audit fix
```

## Мониторинг

### 1. Статистика загрузок

```bash
npm stats @gratio/api
```

### 2. Зависимости

```bash
npm ls @gratio/api
```

### 3. Устаревшие пакеты

```bash
npm outdated
```