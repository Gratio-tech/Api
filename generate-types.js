#!/usr/bin/env node

/**
 * Скрипт для автоматической генерации типов из OpenAPI спецификации
 * Может работать как с URL, так и с локальными файлами схем
 *
 * Использование:
 * npx @gratio/api generate-types --url https://api.example.com/openapi.json
 * npx @gratio/api generate-types --file ./schema.json
 * gratio-generate-types --url https://api.example.com/openapi.json (если установлен глобально)
 * node generate-types.js --help
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Парсинг аргументов командной строки
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (arg === '--url' || arg === '-u') {
      if (i + 1 >= args.length) {
        console.error('Ошибка: Не указан URL после --url');
        process.exit(1);
      }
      options.url = args[++i];
    } else if (arg === '--file' || arg === '-f') {
      if (i + 1 >= args.length) {
        console.error('Ошибка: Не указан путь к файлу после --file');
        process.exit(1);
      }
      options.file = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      if (i + 1 >= args.length) {
        console.error('Ошибка: Не указан путь к выходному файлу после --output');
        process.exit(1);
      }
      options.output = args[++i];
    } else if (arg === '--format' || arg === '--fmt') {
      if (i + 1 >= args.length) {
        console.error('Ошибка: Не указан формат после --format');
        process.exit(1);
      }
      options.format = args[++i];
    } else if (arg === 'generate-types') {
      // Игнорируем команду generate-types для npx @gratio/api generate-types
      continue;
    } else {
      console.error(`Неизвестный аргумент: ${arg}`);
      console.log('Используйте --help для получения справки');
      process.exit(1);
    }
  }

  return options;
}

// Показать справку
function showHelp() {
  console.log(`Скрипт генерации TypeScript типов из OpenAPI спецификации

Использование:
  npx @gratio/api generate-types [опции]
  gratio-generate-types [опции]                    (если установлен глобально)
  node generate-types.js [опции]                   (локальное выполнение)

Опции:
  --url, -u <URL>           URL к OpenAPI спецификации
  --file, -f <путь>         Путь к локальному файлу схемы
  --output, -o <путь>       Путь для выходного файла (по умолчанию: ./generated-types.ts)
  --format, --fmt <формат>  Формат выходного файла: typescript, json (по умолчанию: typescript)
  --help, -h                Показать эту справку

Примеры использования:

  # Генерация из URL (рекомендуемый способ)
  npx @gratio/api generate-types --url https://api.example.com/openapi.json

  # Генерация из локального файла
  npx @gratio/api generate-types --file ./api-schema.json

  # Указание выходного файла
  npx @gratio/api generate-types --url https://api.example.com/openapi.json --output ./types/api.ts

  # Генерация в формате JSON (для отладки)
  npx @gratio/api generate-types --file ./schema.json --format json

  # Глобальная установка и использование
  npm install -g @gratio/api
  gratio-generate-types --url https://api.example.com/openapi.json

Совет: Для интеграции в проект добавьте скрипт в package.json:
  {
    "scripts": {
      "generate-types": "npx @gratio/api generate-types --url https://your-api.com/openapi.json"
    }
  }
`);
}

// Загрузка схемы по URL
function fetchSchema(url) {
  return new Promise((resolve, reject) => {
    // Валидация URL
    try {
      new URL(url);
    } catch (error) {
      reject(new Error(`Некорректный URL: ${url}`));
      return;
    }

    const protocol = url.startsWith('https:') ? https : http;

    console.log(`Загружаю схему из URL: ${url}`);

    const request = protocol.get(url, (res) => {
      // Обработка редиректов
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`🔄 Редирект на: ${res.headers.location}`);
        return fetchSchema(res.headers.location).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage} при загрузке ${url}`));
        return;
      }

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const schema = JSON.parse(data);
          console.log(`✅ Схема успешно загружена (${data.length} символов)`);
          resolve(schema);
        } catch (error) {
          reject(new Error(`Ошибка парсинга JSON из ${url}: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Ошибка загрузки схемы из ${url}: ${error.message}`));
    });

    // Таймаут для запроса
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Таймаут при загрузке схемы из ${url}`));
    });
  });
}

// Загрузка схемы из файла
function loadSchemaFromFile(filePath) {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      throw new Error(`Указанный путь не является файлом: ${filePath}`);
    }

    console.log(`Загружаю схему из файла: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const schema = JSON.parse(content);
    console.log(`✅ Схема успешно загружена из файла (${content.length} символов)`);
    return schema;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Ошибка парсинга JSON в файле ${filePath}: ${error.message}`);
    }
    throw new Error(`Ошибка чтения файла ${filePath}: ${error.message}`);
  }
}

// Генерация TypeScript типов
function generateTypeScriptTypes(openAPI) {
  const schemas = openAPI.components?.schemas || {};
  let typesContent = `// Автоматически сгенерированные типы из OpenAPI спецификации
// Не редактируйте этот файл вручную!
// Сгенерировано: ${new Date().toISOString()}
/////////////////////////////////////////////
`;

  // Генерируем типы для каждой схемы
  Object.entries(schemas).forEach(([schemaName, schema]) => {
    typesContent += generateSchemaType(schemaName, schema);
    typesContent += '\n\n';
  });

  return typesContent;
}

// Генерация типа конкретной схемы
function generateSchemaType(name, schema) {
  if (schema.type === 'object') {
    return generateObjectType(name, schema);
  } else if (schema.anyOf || schema.oneOf) {
    return generateUnionType(name, schema);
  } else {
    return generateBasicType(name, schema);
  }
}

// Генерация типа объекта
function generateObjectType(name, schema) {
  let typeContent = `export type ${name} = {\n`;

  if (schema.properties) {
    Object.entries(schema.properties).forEach(([propName, propSchema]) => {
      const isRequired = schema.required?.includes(propName);
      const propType = getPropertyType(propSchema);
      const optional = isRequired ? '' : '?';

      typeContent += `  ${propName}${optional}: ${propType};\n`;
    });
  }

  typeContent += '};';
  return typeContent;
}

// Генерация union типа
function generateUnionType(name, schema) {
  const unionTypes = [];

  if (schema.anyOf) {
    schema.anyOf.forEach(item => {
      if (item.$ref) {
        const refName = item.$ref.split('/').pop();
        unionTypes.push(refName);
      } else {
        unionTypes.push(getPropertyType(item));
      }
    });
  }

  return `export type ${name} = ${unionTypes.join(' | ')};`;
}

// Генерация базового типа
function generateBasicType(name, schema) {
  const type = getPropertyType(schema);
  return `export type ${name} = ${type};`;
}

// Получение типа свойства
function getPropertyType(schema) {
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }

  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map(v => `'${v}'`).join(' | ');
      }
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      const itemType = getPropertyType(schema.items);
      return `${itemType}[]`;
    case 'object':
      return 'Record<string, any>';
    default:
      return 'any';
  }
}

// Основная функция генерации
async function generateTypes(options) {
  try {
    let openAPI;

    // Определяем источник схемы
    if (options.url) {
      openAPI = await fetchSchema(options.url);
    } else if (options.file) {
      openAPI = loadSchemaFromFile(options.file);
    } else {
      throw new Error('Необходимо указать --url или --file');
    }

    // Валидация схемы OpenAPI
    if (!openAPI || typeof openAPI !== 'object') {
      throw new Error('Загруженная схема не является валидным JSON объектом');
    }

    if (!openAPI.openapi && !openAPI.swagger) {
      console.warn(' Предупреждение: Схема может не быть валидной OpenAPI/Swagger спецификацией');
    }

    // Определяем путь для выходного файла
    const outputPath = options.output || './generated-types.ts';

    // Создаем директорию для выходного файла, если она не существует
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Создана директория: ${outputDir}`);
    }

    // Генерируем типы
    let outputContent;
    if (options.format === 'json') {
      console.log('Генерирую JSON файл...');
      outputContent = JSON.stringify(openAPI, null, 2);
    } else {
      console.log('Генерирую TypeScript типы...');
      outputContent = generateTypeScriptTypes(openAPI);

      // Проверяем, что типы были сгенерированы
      if (!outputContent.trim()) {
        throw new Error('Не удалось сгенерировать типы - схема не содержит определений компонентов');
      }
    }

    // Записываем в файл
    fs.writeFileSync(outputPath, outputContent, 'utf8');
    const stats = fs.statSync(outputPath);
    console.log(`Типы успешно сгенерированы в: ${outputPath} (${stats.size} байт)`);

    // Дополнительная информация
    if (options.format !== 'json') {
      const schemas = openAPI.components?.schemas || {};
      const schemasCount = Object.keys(schemas).length;
      if (schemasCount > 0) {
        console.log(`Сгенерировано типов: ${schemasCount}`);
      } else {
        console.warn(' Предупреждение: В схеме не найдено определений типов (components.schemas)');
      }
    }

  } catch (error) {
    console.error('Ошибка при генерации типов:', error.message);
    console.error('\n Возможные решения:');
    console.error('   - Проверьте правильность URL или пути к файлу');
    console.error('   - Убедитесь, что схема является валидной OpenAPI спецификацией');
    console.error('   - Проверьте доступность сетевого ресурса');
    console.error('   - Используйте --help для получения справки');
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  const options = parseArgs();

  // Проверяем, что указан хотя бы один источник данных
  if (!options.url && !options.file) {
    console.error('Ошибка: Необходимо указать источник данных');
    console.error('Используйте --url для загрузки из интернета или --file для локального файла');
    console.log('\nИспользуйте --help для получения полной справки');
    process.exit(1);
  }

  // Валидация формата
  if (options.format && !['typescript', 'json'].includes(options.format)) {
    console.error('Ошибка: Неподдерживаемый формат. Используйте: typescript или json');
    process.exit(1);
  }

  generateTypes(options);
}

module.exports = {
  generateTypes,
  fetchSchema,
  loadSchemaFromFile,
  generateTypeScriptTypes
};
