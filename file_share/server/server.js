const express = require('express');
const path = require('path'); 
const multer = require('multer'); // Для обработки загрузки файлов
const fs = require('fs') // Для работы с файловой системой
const crypto = require('crypto'); // Для генерации хешей (уникальных ключей)
const app = express();
// Определяем корневую директорию проекта и порт
const projectRoot = path.resolve(__dirname, '..');
const PORT = 3000;
const DOWNLOAD_LINK_EXPIRY_DAYS = 30; // Срок действия ссылки (30 дней)
const LINKS_FILE = path.join(projectRoot, 'links.json');  // Файл для хранения ссылок
 // Функция загрузки сохраненных ссылок из файла
function loadLinks() {
  try {
    if (fs.existsSync(LINKS_FILE)) {
      return JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Ошибка чтения файла ссылок:', err);
  }
  return {}; // Возвращаем пустой объект, если файла нет или ошибка
}
// Функция сохранения ссылок в файл
function saveLinks(links) {
  try {
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2), 'utf8');
  } catch (err) {
    console.error('Ошибка сохранения ссылок:', err);
  }
}

// Загружаем существующие ссылки при старте
let linkStorage = loadLinks();
// Настраиваем статическую раздачу файлов из папки client
app.use(express.static(path.join(projectRoot, 'client')));
// Обработчик главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'client', 'index.html'));
});
// Генерация уникального ключа для ссылки на основе имени файла и времени
function generateLinkKey(filename) {
  return crypto.createHash('sha256')
    .update(filename + Date.now())
    .digest('hex');
}
// Проверка действительности ссылки (не истек ли срок)
function isLinkValid(createdAt) {
  const expiryDate = new Date(createdAt);
  expiryDate.setDate(expiryDate.getDate() + DOWNLOAD_LINK_EXPIRY_DAYS);
  return new Date() < expiryDate;
}
// Очистка просроченных ссылок
function cleanExpiredLinks() {
  const now = new Date();
  let changed = false;
  
  for (const key in linkStorage) {
    if (!isLinkValid(linkStorage[key].createdAt)) {
      delete linkStorage[key];
      changed = true;
    }
  }
  
  if (changed) {
    saveLinks(linkStorage); // Сохраняем изменения, если были удалены ссылки

  }
}
// Первоначальная очистка при запуске
cleanExpiredLinks();
// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage'); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    // Генерация уникального имени файла
    const fileExt = path.extname(file.originalname);
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueId + fileExt;

    cb(null, filename);
  }
});
// Инициализация multer с ограничением размера файла (2GB)
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
})
// Обработчик загрузки файла
app.post('/upload', upload.single('file'), (req, res) => {
  // Генерация уникального ключа для ссылки
const linkKey = generateLinkKey(req.file.filename);

  // Сохранение информации о файле
 linkStorage[linkKey] = {
    filename: req.file.filename, // Имя файла на сервере
    originalname: req.file.originalname, // Оригинальное имя файла
    createdAt: new Date().toISOString()  // Время создания
  };

  saveLinks(linkStorage);
  // Отправляем ответ клиенту с информацией о загруженном файле
res.json({
    success: true,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    expiresInDays: DOWNLOAD_LINK_EXPIRY_DAYS,
    downloadLink: `/download/${linkKey}`
})
  
});
// Обработчик скачивания файла
app.get('/download/:linkKey', (req, res) => {
    const linkData = linkStorage[req.params.linkKey];
  
  if (!linkData) {
    return res.status(404).send('Ссылка не найдена');
  }

  if (!isLinkValid(linkData.createdAt)) {
    return res.status(403).send('Срок действия ссылки истёк');
  }
  // Обновляем время создания (продлеваем срок действия)
   linkData.createdAt = new Date().toISOString();
  saveLinks(linkStorage); 

  const filePath = path.join(projectRoot, 'storage', linkData.filename);
   const originalFilename = linkData.originalname;

    if (fs.existsSync(filePath)) {
        res.download(filePath, originalFilename, (err) => {
            if (err) {
                console.error('Ошибка загрузки:', err);
                res.status(500).send('Файл не может быть скачан');
            }
        });
    } else {
        res.status(404).send('Файл не найден');
    }
});
// Ежедневная очистка просроченных ссылок
setInterval(cleanExpiredLinks, 24 * 60 * 60 * 1000);
// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});