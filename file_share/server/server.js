const express = require('express');
const path = require('path'); 
const multer = require('multer');

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
    let fileName = 'file';
    
    if (file.originalname && typeof file.originalname === 'string') {

      fileName = file.originalname;
      
      const timestamp = Date.now();
      const ext = path.extname(fileName);
      const nameWithoutExt = path.basename(fileName, ext);
      
      fileName = `${nameWithoutExt}_${timestamp}${ext}`;
    } else {
      const randomStr = Math.random().toString(36).substring(2, 10);
      fileName = `file_${Date.now()}_${randomStr}`;
    }
    cb(null, fileName);
  }
});


const upload = multer({
  storage: storage
})

app.post('/upload', upload.single('file'), (req, res) => {
res.json({
    success: true,
    filename: req.file.originalname,
    size: req.file.size
})
  
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});