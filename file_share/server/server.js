const express = require('express');
const path = require('path'); 
const multer = require('multer');
const fs = require('fs')

const app = express();
const PORT = 3000;

const projectRoot = path.resolve(__dirname, '..');

app.use(express.static(path.join(projectRoot, 'client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'client', 'index.html'));
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }
})

app.post('/upload', upload.single('file'), (req, res) => {
res.json({
    success: true,
    filename: req.file.originalname,
    size: req.file.size
})
  
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(path.join(projectRoot, 'storage'), filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Ошибка загрузки:', err);
                res.status(500).send('Файл не может быть скачан');
            }
        });
    } else {
        res.status(404).send('Файл не найден');
    }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});