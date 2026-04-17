import path from 'path';
import { startServer } from './index';

const rootPath = path.resolve(process.cwd(), '..', '..');

console.log(`Starting API server in DEV mode targeting ${rootPath}...`);
startServer(rootPath, 4000, '0.0.0.0');
