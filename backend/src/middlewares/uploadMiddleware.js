import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    let ext = path.extname(file.originalname || '');
    if (!ext && file.mimetype) {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') ext = '.jpg';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/svg+xml') ext = '.svg';
      else if (file.mimetype === 'image/gif') ext = '.gif';
      else if (file.mimetype.startsWith('image/')) ext = `.${file.mimetype.split('/')[1]}`;
    }
    if (!ext) ext = '.png';
    const rawName = (file.originalname || 'image').replace(path.extname(file.originalname || ''), '');
    const safeName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60) || 'image';
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

const blockedExtensions = ['.exe', '.bat', '.cmd', '.sh', '.vbs', '.msi', '.com', '.scr', '.pif'];

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (blockedExtensions.includes(ext)) {
    cb(new Error(`Extension de archivo no permitida: ${ext}`), false);
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 10
  }
});

export const handleUpload = (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo excede el tamaño máximo permitido de 25MB' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'No puedes subir más de 10 archivos a la vez' });
      }
      return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message || 'Error al procesar los archivos' });
    }
    next();
  });
};
