import express from "express";
import multer from "multer"; // Middleware upload file
import { createMovie, getMovies } from "../../controllers/movieController";
import { imageFilter, thumbnailStorage } from "../../utils/multer";

// Inisialisasi Middleware Multer
// storage: menggunakan diskStorage → menyimpan file ke harddisk (lokal)
// fileFilter: menyaring file hanya jika MIME type-nya termasuk jpg, jpeg, png
const upload = multer({ storage: thumbnailStorage(), fileFilter: imageFilter });

const movieRoutes = express.Router();

movieRoutes.get("/movies", getMovies);
movieRoutes.post("/movies", upload.single("thumbnail"), createMovie); // Artinya: hanya menerima 1 file dengan field name thumbnail

export default movieRoutes;
