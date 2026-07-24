const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../../../apps/dashboard/dist');
const dest = path.resolve(__dirname, '../dist/dashboard');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log('[monodog] Dashboard assets successfully copied to dist/dashboard');
} else {
  console.warn('[Warning] Dashboard build not found at:', src);
}
