import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { env } from "../config/env.js";
import { ValidationError } from "../errors/AppError.js";

const uploadsDir = env.STORAGE_LOCAL_DIR;
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const FILE_EXTS = new Set([
  ...IMAGE_EXTS,
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
]);

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const FILE_MIMES = new Set([
  ...IMAGE_MIMES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
]);

const safeExt = (originalname, allowed) => {
  const ext = path.extname(originalname || "").toLowerCase();
  return allowed.has(ext) ? ext : ".bin";
};

const storageFor = (allowedExts) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) =>
      cb(null, `${crypto.randomUUID()}${safeExt(file.originalname, allowedExts)}`),
  });

const accept = (allowedMimes, message) => (_req, file, cb) => {
  if (allowedMimes.has(file.mimetype)) cb(null, true);
  else cb(new ValidationError(message));
};

export const uploadSingle = (field) =>
  multer({
    storage: storageFor(IMAGE_EXTS),
    fileFilter: accept(IMAGE_MIMES, "Only JPG, PNG, GIF, or WebP images are allowed."),
    limits: { fileSize: 5 * 1024 * 1024 },
  }).single(field);

export const uploadMessageFile = multer({
  storage: storageFor(FILE_EXTS),
  fileFilter: accept(FILE_MIMES, "Unsupported file type."),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("file");
