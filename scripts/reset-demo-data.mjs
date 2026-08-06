import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(projectRoot, 'src/data/resetVersion.ts');
const version = new Date().toISOString();

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `export const DEMO_DATA_RESET_VERSION = '${version}';\n`, 'utf8');

console.log(`Demo data reset version updated: ${version}`);
console.log('Refresh the open CRM page. If the dev server is running, Vite usually reloads it automatically.');
