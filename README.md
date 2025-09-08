# LangGraph API Tester

CLI tool для тестирования LangGraph API по адресу `http://147.45.231.108:2024`.

Особенности:
- **Интерактивный анализ питания** - простой режим для тестирования nutrition-агента
- **Быстрый анализ** - автоматическое подтверждение для простых запросов  
- **Полный API доступ** - все операции с ассистентами, потоками, запусками и хранилищем
- **Красивый вывод** - цветной интерфейс и структурированные результаты
- **Автоматическая обработка HITL** - умная обработка прерываний и подтверждений

## Установка

```bash
npm install
```

## Быстрый старт

```bash
# Установить зависимости
npm install

# Интерактивный режим анализа питания
node cli.js nutrition

# Быстрый анализ одного продукта
node cli.js quick-nutrition "chicken breast 150g"

# Проверить здоровье API
node cli.js system health
```

## Использование

```bash
node cli.js [command] [options]
```

или сделать исполняемым:

```bash
chmod +x cli.js
./cli.js [command] [options]
```

## Интерактивный режим анализа питания

**Самый простой способ тестирования** - интерактивный режим для анализа питания:

```bash
node cli.js nutrition
```

Этот режим автоматически:
- Создает новую сессию (thread)
- Обрабатывает все прерывания (interrupts) 
- Показывает красивые результаты анализа питания
- Позволяет продолжать анализ в той же сессии

### Пример использования:

```bash
$ node cli.js nutrition

Welcome to Interactive Nutrition Analysis!
Type food items (e.g., "chicken breast 150g", "apple", "pasta with tomatoes")
Type "exit" to quit

Enter food items: chicken breast 150g
Creating new session...
Session ID: abc123-def4-5678-9012-345678901234

Analyzing nutrition...

--- Iteration 1 ---

Please review the parsed food data and confirm if it's correct:

Parsed food data:
Products:
  1. chicken breast - 150g
Total items: 1

? What would you like to do? Correct - proceed with nutrition analysis

Nutrition Analysis Complete!

1. Chicken Breast (150g)
   Calories: 248 kcal
   Protein: 46.2g
   Fat: 5.4g
   Carbs: 0g
   Confidence: 95.0%

Enter food items: apple, banana 120g
Analyzing nutrition...
...
```

### Быстрый анализ питания

Для простых запросов без интерактивности:

```bash
node cli.js quick-nutrition "chicken breast 150g"
node cli.js quick-nutrition "apple, banana 120g"
```

Эта команда автоматически подтверждает все прерывания типа "confirmation", но останавливается при необходимости дополнительной информации.

## Команды

### Система

#### Проверка здоровья системы
```bash
node cli.js system health
node cli.js system health --check-db
```

#### Информация о сервере
```bash
node cli.js system info
```

#### Метрики системы
```bash
node cli.js system metrics
node cli.js system metrics --format json
```

### Ассистенты

#### Создать ассистента
```bash
# Простое создание
node cli.js assistant create

# С параметрами
node cli.js assistant create \
  --name "My Assistant" \
  --description "Test assistant" \
  --config '{"recursion_limit": 50}' \
  --metadata '{"version": "1.0"}'
```

#### Получить ассистента по ID
```bash
node cli.js assistant get <assistant-id>
```

#### Список ассистентов
```bash
node cli.js assistant list
node cli.js assistant list --limit 20 --offset 10
node cli.js assistant list --graph-id nutrition-agent
node cli.js assistant list --sort-by created_at --sort-order desc
```

#### Обновить ассистента
```bash
node cli.js assistant update <assistant-id> \
  --name "Updated Assistant" \
  --description "Updated description"
```

#### Удалить ассистента
```bash
node cli.js assistant delete <assistant-id>
```

#### Получить граф ассистента
```bash
node cli.js assistant graph <assistant-id>
node cli.js assistant graph <assistant-id> --xray
node cli.js assistant graph <assistant-id> --xray 2
```

#### Получить схемы ассистента
```bash
node cli.js assistant schemas <assistant-id>
```

### Потоки (Threads)

#### Создать поток
```bash
# Простое создание
node cli.js thread create

# С параметрами
node cli.js thread create \
  --thread-id "my-thread-id" \
  --metadata '{"user": "test"}' \
  --ttl-minutes 60
```

#### Получить поток по ID
```bash
node cli.js thread get <thread-id>
```

#### Список потоков
```bash
node cli.js thread list
node cli.js thread list --status idle --limit 20
node cli.js thread list --metadata '{"user": "test"}'
```

#### Обновить поток
```bash
node cli.js thread update <thread-id> \
  --metadata '{"updated": true}'
```

#### Удалить поток
```bash
node cli.js thread delete <thread-id>
```

#### Получить состояние потока
```bash
node cli.js thread state <thread-id>
node cli.js thread state <thread-id> --subgraphs
```

#### Обновить состояние потока
```bash
node cli.js thread update-state <thread-id> \
  --values '{"key": "value"}' \
  --as-node "node_name"
```

#### История потока
```bash
node cli.js thread history <thread-id>
node cli.js thread history <thread-id> --limit 20
```

### Запуски (Runs)

#### Создать фоновый запуск
```bash
node cli.js run create <thread-id> \
  --assistant-id <assistant-id> \
  --input '{"message": "Hello"}' \
  --metadata '{"test": true}'
```

#### Создать запуск без состояния
```bash
node cli.js run create-stateless \
  --assistant-id <assistant-id> \
  --input '{"message": "Hello"}' \
  --on-completion keep
```

#### Создать запуск и ждать завершения
```bash
node cli.js run wait <thread-id> \
  --assistant-id <assistant-id> \
  --input '{"message": "Hello"}'
```

#### Создать запуск без состояния и ждать завершения
```bash
node cli.js run wait-stateless \
  --assistant-id <assistant-id> \
  --input '{"message": "Hello"}'
```

#### Получить запуск по ID
```bash
node cli.js run get <thread-id> <run-id>
```

#### Список запусков для потока
```bash
node cli.js run list <thread-id>
node cli.js run list <thread-id> --status running --limit 20
```

#### Отменить запуск
```bash
node cli.js run cancel <thread-id> <run-id>
node cli.js run cancel <thread-id> <run-id> --action rollback --wait
```

#### Удалить запуск
```bash
node cli.js run delete <thread-id> <run-id>
```

### Хранилище (Store)

#### Сохранить элемент
```bash
node cli.js store put \
  --key "my-key" \
  --value '{"data": "value"}' \
  --namespace "ns1,ns2"
```

#### Получить элемент
```bash
node cli.js store get "my-key"
node cli.js store get "my-key" --namespace "ns1,ns2"
```

#### Удалить элемент
```bash
node cli.js store delete "my-key"
node cli.js store delete "my-key" --namespace "ns1,ns2"
```

#### Поиск элементов
```bash
node cli.js store search
node cli.js store search --namespace-prefix "ns1,ns2" --limit 20
node cli.js store search --filter '{"type": "document"}' --query "search text"
```

#### Список пространств имен
```bash
node cli.js store namespaces
node cli.js store namespaces --prefix "ns1" --max-depth 3
```

## Примеры полного workflow

### 1. Создание и тестирование ассистента
```bash
# Создать ассистента
node cli.js assistant create --name "Test Assistant"

# Получить ID из ответа и использовать его
ASSISTANT_ID="<полученный-id>"

# Получить информацию об ассистенте
node cli.js assistant get $ASSISTANT_ID

# Получить схемы
node cli.js assistant schemas $ASSISTANT_ID
```

### 2. Работа с потоками и запусками
```bash
# Создать поток
node cli.js thread create --metadata '{"test": "workflow"}'

# Получить ID потока из ответа
THREAD_ID="<полученный-id>"

# Создать и выполнить запуск
node cli.js run wait $THREAD_ID \
  --assistant-id $ASSISTANT_ID \
  --input '{"message": "Hello, world!"}'

# Посмотреть историю потока
node cli.js thread history $THREAD_ID
```

### 3. Работа с хранилищем
```bash
# Сохранить данные
node cli.js store put \
  --key "config" \
  --value '{"setting": "value"}' \
  --namespace "app,settings"

# Получить данные
node cli.js store get "config" --namespace "app,settings"

# Найти все элементы в пространстве имен
node cli.js store search --namespace-prefix "app"
```

## Формат ответов

Все команды возвращают JSON-ответы в читаемом формате. Успешные операции отображаются зеленым цветом, ошибки - красным.

## Обработка ошибок

CLI автоматически обрабатывает ошибки API и показывает:
- Статус код ошибки
- Сообщение об ошибке
- Детали ошибки в JSON формате

## Требования

- Node.js 14+
- npm

## Зависимости

- `axios` - для HTTP запросов
- `commander` - для парсинга аргументов CLI
- `chalk` - для цветного вывода
- `uuid` - для генерации UUID
- `inquirer` - для интерактивных промптов (зарезервировано для будущих версий)