import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import Document from '../models/Document.js';

/* ---------- Multer Storage ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${buf.toString('hex')}${ext}`);
    });
  }
});

/* ---------- File Filter ---------- */
const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
const fileFilter = (req, file, cb) =>
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Invalid file type'), false);

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('document');

/* ---------- Upload Controller ---------- */
export const uploadDocument = asyncHandler(async (req, res) => {
  const doc = await Document.create({
    project: req.params.pid,
    path: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user._id
  });
  res.status(201).json({ document: doc });
});

export const projectDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ project: req.params.pid });
  res.json({ documents });
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  const filePath = path.join('uploads', doc.path);
  res.download(filePath, doc.originalName);
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  fs.unlinkSync(path.join('uploads', doc.path));
  res.status(204).send();
});
