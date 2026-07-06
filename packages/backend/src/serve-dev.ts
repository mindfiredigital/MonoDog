import path from 'path';
import { startServer } from './index';

const customRoot = process.env.MONODOG_TARGET_ROOT;
const rootPath = customRoot
  ? path.resolve(customRoot)
  : path.resolve(process.cwd(), '..', '..');

console.log(`Starting API server in DEV mode targeting ${rootPath}...`);
startServer(rootPath, 4000, '0.0.0.0');
