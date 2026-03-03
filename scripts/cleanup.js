import fs from 'fs';
import path from 'path';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('node_modules directory removed successfully');
} else {
  console.log('node_modules directory does not exist');
}
