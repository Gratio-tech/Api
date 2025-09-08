#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

const program = new Command();

// Base URL for the API
const BASE_URL = 'http://147.45.231.108:2024';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Helper function to handle API responses
function handleResponse(response, successMessage) {
  console.log(chalk.green(`✓ ${successMessage}`));
  if (response.data) {
    console.log(chalk.cyan('Response:'));
    console.log(JSON.stringify(response.data, null, 2));
  }
  if (response.headers['content-location']) {
    console.log(chalk.yellow(`Content-Location: ${response.headers['content-location']}`));
  }
}

// Helper function to handle API errors
function handleError(error) {
  console.error(chalk.red('✗ Error:'));
  if (error.response) {
    console.error(chalk.red(`Status: ${error.response.status}`));
    console.error(chalk.red(`Message: ${JSON.stringify(error.response.data, null, 2)}`));
  } else if (error.request) {
    console.error(chalk.red('No response received'));
    console.error(chalk.red(error.message));
  } else {
    console.error(chalk.red(error.message));
  }
}

// Helper function to parse JSON safely
function parseJSON(jsonString) {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(chalk.red('Invalid JSON format'));
    process.exit(1);
  }
}

program
  .name('langgraph-test')
  .description('CLI tool to test LangGraph API')
  .version('1.0.0');

// Assistant commands
const assistantCmd = program
  .command('assistant')
  .description('Assistant operations');

assistantCmd
  .command('create')
  .description('Create a new assistant')
  .option('-g, --graph-id <id>', 'Graph ID (default: nutrition-agent)', 'nutrition-agent')
  .option('-n, --name <name>', 'Assistant name', 'Test Assistant')
  .option('-d, --description <desc>', 'Assistant description')
  .option('-c, --config <json>', 'Configuration JSON')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--context <json>', 'Context JSON')
  .option('--if-exists <action>', 'Action if exists (raise|do_nothing)', 'raise')
  .action(async (options) => {
    try {
      const payload = {
        graph_id: options.graphId,
        name: options.name,
        if_exists: options.ifExists,
      };
      
      if (options.description) payload.description = options.description;
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);

      const response = await api.post('/assistants', payload);
      handleResponse(response, 'Assistant created successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('get <id>')
  .description('Get assistant by ID')
  .action(async (id) => {
    try {
      const response = await api.get(`/assistants/${id}`);
      handleResponse(response, 'Assistant retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('list')
  .description('List assistants')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-o, --offset <number>', 'Number of results to skip', '0')
  .option('-g, --graph-id <id>', 'Filter by graph ID')
  .option('-m, --metadata <json>', 'Filter by metadata JSON')
  .option('--sort-by <field>', 'Sort by field (assistant_id|created_at|updated_at|name|graph_id)')
  .option('--sort-order <order>', 'Sort order (asc|desc)')
  .action(async (options) => {
    try {
      const payload = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      };

      if (options.graphId) payload.graph_id = options.graphId;
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.sortBy) payload.sort_by = options.sortBy;
      if (options.sortOrder) payload.sort_order = options.sortOrder;

      const response = await api.post('/assistants/search', payload);
      handleResponse(response, 'Assistants listed successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('update <id>')
  .description('Update assistant')
  .option('-n, --name <name>', 'New name')
  .option('-d, --description <desc>', 'New description')
  .option('-g, --graph-id <id>', 'New graph ID')
  .option('-c, --config <json>', 'New configuration JSON')
  .option('-m, --metadata <json>', 'New metadata JSON')
  .option('--context <json>', 'New context JSON')
  .action(async (id, options) => {
    try {
      const payload = {};
      
      if (options.name) payload.name = options.name;
      if (options.description) payload.description = options.description;
      if (options.graphId) payload.graph_id = options.graphId;
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);

      const response = await api.patch(`/assistants/${id}`, payload);
      handleResponse(response, 'Assistant updated successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('delete <id>')
  .description('Delete assistant')
  .action(async (id) => {
    try {
      const response = await api.delete(`/assistants/${id}`);
      handleResponse(response, 'Assistant deleted successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('graph <id>')
  .description('Get assistant graph')
  .option('--xray [depth]', 'Include subgraph representation')
  .action(async (id, options) => {
    try {
      const params = {};
      if (options.xray !== undefined) {
        params.xray = options.xray === true ? true : parseInt(options.xray);
      }

      const response = await api.get(`/assistants/${id}/graph`, { params });
      handleResponse(response, 'Assistant graph retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

assistantCmd
  .command('schemas <id>')
  .description('Get assistant schemas')
  .action(async (id) => {
    try {
      const response = await api.get(`/assistants/${id}/schemas`);
      handleResponse(response, 'Assistant schemas retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

// Thread commands
const threadCmd = program
  .command('thread')
  .description('Thread operations');

threadCmd
  .command('create')
  .description('Create a new thread')
  .option('-i, --thread-id <id>', 'Thread ID (auto-generated if not provided)')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--if-exists <action>', 'Action if exists (raise|do_nothing)', 'raise')
  .option('--ttl-strategy <strategy>', 'TTL strategy (delete)', 'delete')
  .option('--ttl-minutes <minutes>', 'TTL in minutes')
  .action(async (options) => {
    try {
      const payload = {
        if_exists: options.ifExists,
      };

      if (options.threadId) payload.thread_id = options.threadId;
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      
      if (options.ttlMinutes) {
        payload.ttl = {
          strategy: options.ttlStrategy,
          ttl: parseFloat(options.ttlMinutes),
        };
      }

      const response = await api.post('/threads', payload);
      handleResponse(response, 'Thread created successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('get <id>')
  .description('Get thread by ID')
  .action(async (id) => {
    try {
      const response = await api.get(`/threads/${id}`);
      handleResponse(response, 'Thread retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('list')
  .description('List threads')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-o, --offset <number>', 'Number of results to skip', '0')
  .option('-s, --status <status>', 'Filter by status (idle|busy|interrupted|error)')
  .option('-m, --metadata <json>', 'Filter by metadata JSON')
  .option('-v, --values <json>', 'Filter by values JSON')
  .option('--sort-by <field>', 'Sort by field')
  .option('--sort-order <order>', 'Sort order (asc|desc)')
  .action(async (options) => {
    try {
      const payload = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      };

      if (options.status) payload.status = options.status;
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.values) payload.values = parseJSON(options.values);
      if (options.sortBy) payload.sort_by = options.sortBy;
      if (options.sortOrder) payload.sort_order = options.sortOrder;

      const response = await api.post('/threads/search', payload);
      handleResponse(response, 'Threads listed successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('update <id>')
  .description('Update thread')
  .option('-m, --metadata <json>', 'New metadata JSON')
  .action(async (id, options) => {
    try {
      const payload = {};
      
      if (options.metadata) payload.metadata = parseJSON(options.metadata);

      const response = await api.patch(`/threads/${id}`, payload);
      handleResponse(response, 'Thread updated successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('delete <id>')
  .description('Delete thread')
  .action(async (id) => {
    try {
      const response = await api.delete(`/threads/${id}`);
      handleResponse(response, 'Thread deleted successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('state <id>')
  .description('Get thread state')
  .option('--subgraphs', 'Include subgraphs')
  .action(async (id, options) => {
    try {
      const params = {};
      if (options.subgraphs) params.subgraphs = true;

      const response = await api.get(`/threads/${id}/state`, { params });
      handleResponse(response, 'Thread state retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('update-state <id>')
  .description('Update thread state')
  .option('-v, --values <json>', 'State values JSON')
  .option('--as-node <node>', 'Update as if this node executed')
  .option('--checkpoint <json>', 'Checkpoint config JSON')
  .action(async (id, options) => {
    try {
      const payload = {};

      if (options.values) payload.values = parseJSON(options.values);
      if (options.asNode) payload.as_node = options.asNode;
      if (options.checkpoint) payload.checkpoint = parseJSON(options.checkpoint);

      const response = await api.post(`/threads/${id}/state`, payload);
      handleResponse(response, 'Thread state updated successfully');
    } catch (error) {
      handleError(error);
    }
  });

threadCmd
  .command('history <id>')
  .description('Get thread history')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-b, --before <checkpoint>', 'Before checkpoint')
  .action(async (id, options) => {
    try {
      const params = {
        limit: parseInt(options.limit),
      };

      if (options.before) params.before = options.before;

      const response = await api.get(`/threads/${id}/history`, { params });
      handleResponse(response, 'Thread history retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

// Run commands
const runCmd = program
  .command('run')
  .description('Run operations');

runCmd
  .command('create <threadId>')
  .description('Create a background run')
  .requiredOption('-a, --assistant-id <id>', 'Assistant ID or graph name')
  .option('-i, --input <json>', 'Input JSON')
  .option('-c, --config <json>', 'Config JSON')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--context <json>', 'Context JSON')
  .option('--webhook <url>', 'Webhook URL')
  .option('--interrupt-before <nodes>', 'Comma-separated nodes to interrupt before')
  .option('--interrupt-after <nodes>', 'Comma-separated nodes to interrupt after')
  .option('--multitask-strategy <strategy>', 'Multitask strategy', 'enqueue')
  .action(async (threadId, options) => {
    try {
      const payload = {
        assistant_id: options.assistantId,
        multitask_strategy: options.multitaskStrategy,
      };

      if (options.input) payload.input = parseJSON(options.input);
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);
      if (options.webhook) payload.webhook = options.webhook;
      if (options.interruptBefore) {
        payload.interrupt_before = options.interruptBefore.split(',').map(s => s.trim());
      }
      if (options.interruptAfter) {
        payload.interrupt_after = options.interruptAfter.split(',').map(s => s.trim());
      }

      const response = await api.post(`/threads/${threadId}/runs`, payload);
      handleResponse(response, 'Run created successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('create-stateless')
  .description('Create a stateless run')
  .requiredOption('-a, --assistant-id <id>', 'Assistant ID or graph name')
  .option('-i, --input <json>', 'Input JSON')
  .option('-c, --config <json>', 'Config JSON')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--context <json>', 'Context JSON')
  .option('--webhook <url>', 'Webhook URL')
  .option('--on-completion <action>', 'On completion action (delete|keep)', 'delete')
  .action(async (options) => {
    try {
      const payload = {
        assistant_id: options.assistantId,
        on_completion: options.onCompletion,
      };

      if (options.input) payload.input = parseJSON(options.input);
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);
      if (options.webhook) payload.webhook = options.webhook;

      const response = await api.post('/runs', payload);
      handleResponse(response, 'Stateless run created successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('wait <threadId>')
  .description('Create run and wait for completion')
  .requiredOption('-a, --assistant-id <id>', 'Assistant ID or graph name')
  .option('-i, --input <json>', 'Input JSON')
  .option('-c, --config <json>', 'Config JSON')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--context <json>', 'Context JSON')
  .action(async (threadId, options) => {
    try {
      const payload = {
        assistant_id: options.assistantId,
      };

      if (options.input) payload.input = parseJSON(options.input);
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);

      const response = await api.post(`/threads/${threadId}/runs/wait`, payload);
      handleResponse(response, 'Run completed successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('wait-stateless')
  .description('Create stateless run and wait for completion')
  .requiredOption('-a, --assistant-id <id>', 'Assistant ID or graph name')
  .option('-i, --input <json>', 'Input JSON')
  .option('-c, --config <json>', 'Config JSON')
  .option('-m, --metadata <json>', 'Metadata JSON')
  .option('--context <json>', 'Context JSON')
  .action(async (options) => {
    try {
      const payload = {
        assistant_id: options.assistantId,
      };

      if (options.input) payload.input = parseJSON(options.input);
      if (options.config) payload.config = parseJSON(options.config);
      if (options.metadata) payload.metadata = parseJSON(options.metadata);
      if (options.context) payload.context = parseJSON(options.context);

      const response = await api.post('/runs/wait', payload);
      handleResponse(response, 'Stateless run completed successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('get <threadId> <runId>')
  .description('Get run by ID')
  .action(async (threadId, runId) => {
    try {
      const response = await api.get(`/threads/${threadId}/runs/${runId}`);
      handleResponse(response, 'Run retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('list <threadId>')
  .description('List runs for a thread')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-o, --offset <number>', 'Number of results to skip', '0')
  .option('-s, --status <status>', 'Filter by status')
  .action(async (threadId, options) => {
    try {
      const params = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      };

      if (options.status) params.status = options.status;

      const response = await api.get(`/threads/${threadId}/runs`, { params });
      handleResponse(response, 'Runs listed successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('cancel <threadId> <runId>')
  .description('Cancel a run')
  .option('--wait', 'Wait for cancellation to complete')
  .option('--action <action>', 'Cancellation action (interrupt|rollback)', 'interrupt')
  .action(async (threadId, runId, options) => {
    try {
      const params = {
        action: options.action,
      };

      if (options.wait) params.wait = true;

      const response = await api.post(`/threads/${threadId}/runs/${runId}/cancel`, null, { params });
      handleResponse(response, 'Run cancelled successfully');
    } catch (error) {
      handleError(error);
    }
  });

runCmd
  .command('delete <threadId> <runId>')
  .description('Delete a run')
  .action(async (threadId, runId) => {
    try {
      const response = await api.delete(`/threads/${threadId}/runs/${runId}`);
      handleResponse(response, 'Run deleted successfully');
    } catch (error) {
      handleError(error);
    }
  });

// Store commands
const storeCmd = program
  .command('store')
  .description('Store operations');

storeCmd
  .command('put')
  .description('Store or update an item')
  .requiredOption('-k, --key <key>', 'Item key')
  .requiredOption('-v, --value <json>', 'Item value JSON')
  .requiredOption('-n, --namespace <namespace>', 'Namespace (comma-separated)')
  .action(async (options) => {
    try {
      const payload = {
        key: options.key,
        value: parseJSON(options.value),
        namespace: options.namespace.split(',').map(s => s.trim()).filter(s => s.length > 0),
      };

      const response = await api.put('/store/items', payload);
      handleResponse(response, 'Item stored successfully');
    } catch (error) {
      handleError(error);
    }
  });

storeCmd
  .command('get <key>')
  .description('Get an item by key')
  .requiredOption('-n, --namespace <namespace>', 'Namespace (comma-separated)')
  .action(async (key, options) => {
    try {
      const params = { key };
      const namespaceArray = options.namespace.split(',').map(s => s.trim()).filter(s => s.length > 0);
      // For axios, array parameters need to be handled specially
      namespaceArray.forEach((ns, index) => {
        params[`namespace[${index}]`] = ns;
      });

      const response = await api.get('/store/items', { params });
      handleResponse(response, 'Item retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

storeCmd
  .command('delete <key>')
  .description('Delete an item')
  .requiredOption('-n, --namespace <namespace>', 'Namespace (comma-separated)')
  .action(async (key, options) => {
    try {
      const payload = { key };
      payload.namespace = options.namespace.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const response = await api.delete('/store/items', { data: payload });
      handleResponse(response, 'Item deleted successfully');
    } catch (error) {
      handleError(error);
    }
  });

storeCmd
  .command('search')
  .description('Search items')
  .option('-n, --namespace-prefix <prefix>', 'Namespace prefix (comma-separated)', '')
  .option('-f, --filter <json>', 'Filter JSON')
  .option('-q, --query <query>', 'Search query')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .option('-o, --offset <number>', 'Number of results to skip', '0')
  .action(async (options) => {
    try {
      const payload = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      };

      if (options.namespacePrefix) {
        payload.namespace_prefix = options.namespacePrefix.split(',').map(s => s.trim()).filter(s => s.length > 0);
      }
      if (options.filter) payload.filter = parseJSON(options.filter);
      if (options.query) payload.query = options.query;

      const response = await api.post('/store/items/search', payload);
      handleResponse(response, 'Items found successfully');
    } catch (error) {
      handleError(error);
    }
  });

storeCmd
  .command('namespaces')
  .description('List namespaces')
  .option('--prefix <prefix>', 'Prefix (comma-separated)', '')
  .option('--suffix <suffix>', 'Suffix (comma-separated)', '')
  .option('--max-depth <depth>', 'Maximum depth')
  .option('-l, --limit <number>', 'Maximum number of results', '100')
  .option('-o, --offset <number>', 'Number of results to skip', '0')
  .action(async (options) => {
    try {
      const payload = {
        limit: parseInt(options.limit),
        offset: parseInt(options.offset),
      };

      if (options.prefix) {
        payload.prefix = options.prefix.split(',').map(s => s.trim());
      }
      if (options.suffix) {
        payload.suffix = options.suffix.split(',').map(s => s.trim());
      }
      if (options.maxDepth) payload.max_depth = parseInt(options.maxDepth);

      const response = await api.post('/store/namespaces', payload);
      handleResponse(response, 'Namespaces listed successfully');
    } catch (error) {
      handleError(error);
    }
  });

// System commands
const systemCmd = program
  .command('system')
  .description('System operations');

systemCmd
  .command('health')
  .description('Check system health')
  .option('--check-db', 'Check database connectivity')
  .action(async (options) => {
    try {
      const params = {};
      if (options.checkDb) params.check_db = 1;

      const response = await api.get('/ok', { params });
      handleResponse(response, 'System is healthy');
    } catch (error) {
      handleError(error);
    }
  });

systemCmd
  .command('info')
  .description('Get server information')
  .action(async () => {
    try {
      const response = await api.get('/info');
      handleResponse(response, 'Server information retrieved successfully');
    } catch (error) {
      handleError(error);
    }
  });

systemCmd
  .command('metrics')
  .description('Get system metrics')
  .option('-f, --format <format>', 'Output format (prometheus|json)', 'prometheus')
  .action(async (options) => {
    try {
      const params = { format: options.format };
      const response = await api.get('/metrics', { params });
      
      console.log(chalk.green('✓ Metrics retrieved successfully'));
      if (options.format === 'json') {
        console.log(chalk.cyan('Response:'));
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(chalk.cyan('Metrics:'));
        console.log(response.data);
      }
    } catch (error) {
      handleError(error);
    }
  });

// Parse command line arguments
program.parse();