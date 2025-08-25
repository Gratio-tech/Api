#!/usr/bin/env node

/**
 * Скрипт для автоматической генерации типов из OpenAPI спецификации
 * Использует openapi-typescript для конвертации OpenAPI в TypeScript типы
 */

const fs = require('fs');
const path = require('path');

// Функция для генерации типов из OpenAPI JSON
function generateTypesFromOpenAPI() {
  try {
    // Путь к OpenAPI спецификации
    const openAPIPath = path.join(__dirname, '../docs/openapi.json');
    const outputPath = path.join(__dirname, 'generated-types.ts');
    
    if (!fs.existsSync(openAPIPath)) {
      console.error('OpenAPI файл не найден:', openAPIPath);
      return;
    }

    const openAPIContent = fs.readFileSync(openAPIPath, 'utf8');
    const openAPI = JSON.parse(openAPIContent);

    // Генерируем TypeScript типы
    const typesContent = generateTypeScriptTypes(openAPI);
    
    // Записываем в файл
    fs.writeFileSync(outputPath, typesContent, 'utf8');
    
    console.log('Типы успешно сгенерированы в:', outputPath);
    
  } catch (error) {
    console.error('Ошибка при генерации типов:', error);
  }
}

// Функция для генерации TypeScript типов из OpenAPI схем
function generateTypeScriptTypes(openAPI) {
  const schemas = openAPI.components?.schemas || {};
  let typesContent = `// Автоматически сгенерированные типы из OpenAPI спецификации
// Не редактируйте этот файл вручную!

`;

  // Генерируем типы для каждой схемы
  Object.entries(schemas).forEach(([schemaName, schema]) => {
    typesContent += generateSchemaType(schemaName, schema);
    typesContent += '\n\n';
  });

  return typesContent;
}

// Функция для генерации типа конкретной схемы
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

// Запуск генерации
if (require.main === module) {
  generateTypesFromOpenAPI();
}

module.exports = { generateTypesFromOpenAPI };