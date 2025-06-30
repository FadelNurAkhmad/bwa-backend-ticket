import express from "express";
import { login, register } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { authSchema } from "../utils/zodSchema";
import multer from "multer";
import { imageFilter, thumbnailStorage } from "../utils/multer";

const authRoutes = express.Router();

// Inisialisasi Middleware Multer
// storage: menggunakan diskStorage → menyimpan file ke harddisk (lokal)
// fileFilter: menyaring file hanya jika MIME type-nya termasuk jpg, jpeg, png
const upload = multer({
  storage: thumbnailStorage("public/uploads/photos"),
  fileFilter: imageFilter,
});

authRoutes.post(
  "/auth/login",
  validateRequest(authSchema.omit({ name: true })),
  login
);
// upload.single("photo") File yang diunggah akan tersedia di req.file saat handler register dipanggil.
authRoutes.post("/auth/register", upload.single("photo"), register); // Artinya: hanya menerima 1 file dengan field name photo

export default authRoutes;
