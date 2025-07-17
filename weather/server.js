const express = require('express')
const path = require('path'); 

const app = express()
const PORT = 3000;
const projectRoot = path.resolve(__dirname, '..');

app.use(express.static(path.join(projectRoot, 'weather')));

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});