#!/usr/bin/env node

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import Table from 'cli-table3';
import { fileURLToPath } from 'url';

const WORKER_COUNT = 16;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function displayResults(results) {
  if (results.size === 0) {
    console.log(chalk.yellow('\nNo imports found.'));
    return;
  }

  // Group results by file type
  const groupedResults = new Map();
  for (const [file, matches] of results) {
    const ext = path.extname(file);
    if (!groupedResults.has(ext)) {
      groupedResults.set(ext, new Map());
    }
    groupedResults.get(ext).set(file, matches);
  }

  // Display results by group using cli-table3
  for (const [ext, filesMap] of groupedResults) {
    console.log(chalk.green(`\n�� ${ext.slice(1).toUpperCase()} Files:`));
    
    const table = new Table({
      head: ['File', 'Import Statement'],
      style: {
        head: ['cyan'],
        border: ['gray']
      },
      wordWrap: true,
      wrapOnWordBoundary: false
    });

    for (const [file, matches] of filesMap) {
      matches.forEach((match, idx) => {
        table.push([
          idx === 0 ? chalk.white(file) : '',  // Only show filename once
          chalk.yellow(match.trim())
        ]);
      });
    }

    console.log(table.toString());
  }

  const pulse = chalkAnimation.pulse(`\n✨ Found imports in ${results.size} files`);
  await sleep(1500);
  pulse.stop();
}

if (isMainThread) {
  const packageName = process.argv[2];
  
  if (!packageName) {
    console.log(chalk.red('Usage: whatImports <package-name>'));
    process.exit(1);
  }

  // Create animated header
  (async () => {
    const rainbow = chalkAnimation.rainbow(`🔍 Searching for imports of '${packageName}'...`);
    await sleep(1500);
    rainbow.stop();
  })();

  const patterns = {
    js: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', '**/*.vue'].map(p => ({ 
      pattern: p, 
      regex: `(import[^'"]*['"]([^'"]*${packageName}[^'"]*)|require\\([^)]*${packageName}[^)]*\\))` 
    })),
    py: ['**/*.py'].map(p => ({ 
      pattern: p, 
      regex: `(import\\s+${packageName}|from\\s+${packageName}\\s+import|from\\s+[\\w\\.]*${packageName}\\s+import)` 
    })),
    package: ['**/package.json'].map(p => ({ 
      pattern: p, 
      regex: `"${packageName}"\\s*:\\s*"[^"]*"` 
    }))
  };

  const workers = [];
  const results = new Map();
  let completedWorkers = 0;

  for (let i = 0; i < WORKER_COUNT; i++) {
    const worker = new Worker(fileURLToPath(import.meta.url), {
      workerData: { workerId: i, totalWorkers: WORKER_COUNT, patterns, packageName }
    });

    worker.on('message', (data) => {
      for (const [file, matches] of Object.entries(data)) {
        results.set(file, matches);
      }
    });

    worker.on('error', (err) => {
      console.error(chalk.red(`Worker ${i} error:`, err));
    });

    worker.on('exit', () => {
      completedWorkers++;
      if (completedWorkers === WORKER_COUNT) {
        displayResults(results);
      }
    });

    workers.push(worker);
  }
} else {
  const { workerId, totalWorkers, patterns, packageName } = workerData;
  const results = {};

  async function searchFiles() {
    for (const [type, typePatterns] of Object.entries(patterns)) {
      for (const { pattern, regex } of typePatterns) {
        const files = await glob(pattern, { 
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
          nodir: true
        });

        const workerFiles = files.filter((_, index) => index % totalWorkers === workerId);

        for (const file of workerFiles) {
          try {
            const content = await fs.readFile(file, 'utf8');
            const matches = content.match(new RegExp(regex, 'g'));
            if (matches) {
              results[file] = matches;
            }
          } catch (err) {
            // Skip files we can't read
          }
        }
      }
    }
    
    parentPort.postMessage(results);
  }

  searchFiles();
}
 
