import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

const dirsToDel = [
  path.join(projectRoot, 'node_modules'),
  path.join(projectRoot, '.next'),
  path.join(projectRoot, '.cache'),
  path.join(projectRoot, '.swc'),
];

const filesToDel = [
  path.join(projectRoot, 'yarn.lock'),
  path.join(projectRoot, 'package-lock.json'),
];

console.log('[v0] Iniciando limpieza completa...');

// Eliminar directorios
for (const dir of dirsToDel) {
  if (fs.existsSync(dir)) {
    console.log(`[v0] Eliminando directorio: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Eliminar archivos de bloqueo
for (const file of filesToDel) {
  if (fs.existsSync(file)) {
    console.log(`[v0] Eliminando archivo: ${file}`);
    fs.unlinkSync(file);
  }
}

console.log('[v0] Limpieza completada. Las dependencias se reinstalarán automáticamente.');
