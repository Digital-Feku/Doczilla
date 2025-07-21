import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express()
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

app.use(express.static(path.join(projectRoot, 'weather')));

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});