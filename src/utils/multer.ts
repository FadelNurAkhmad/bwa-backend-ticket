import type { Request } from "express";
import multer, { type FileFilterCallback } from "multer"; // Library untuk menangani upload file di Express
import { allowedFileTypes } from "./zodSchema";

export const thumbnailStorage = (path = "public/uploads/thumbnails") =>
  // multer.diskStorage = Method dari multer untuk menyimpan file secara fisik ke disk
  multer.diskStorage({
    // ke mana file akan disimpan (destination)
    destination: (req, file, cb) => {
      // cb = singkatan dari callback, yaitu fungsi yang dipanggil kembali oleh Multer
      // null = artinya tidak ada error
      cb(null, path); // default = public/uploads/thumbnails
    },
    // dan bagaimana nama filenya (filename)
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      // Format: {fieldname}-{timestamp-random}.{extension}
      // Contoh: thumbnail-1719056235000-843213342.png
      // mimetype = misalnya: "image/png" hasil: "png", split = Memotong string dengan regex
      const filename = `${file.fieldname}-${uniqueSuffix}.${
        file.mimetype.split("/")[1]
      }`;
      cb(null, filename);
    },
  });

export const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!allowedFileTypes.includes(file.mimetype)) {
    cb(null, false); // ❌ file tidak diterima
  }

  cb(null, true); // ✅ file diterima
};
