import express from "express";
import multer from "multer"; // Middleware upload file
import {
  createMovie,
  deleteMovie,
  getMovieDetail,
  getMovies,
  updateMovie,
} from "../../controllers/movieController";
import { imageFilter, thumbnailStorage } from "../../utils/multer";

// Inisialisasi Middleware Multer
// storage: menggunakan diskStorage → menyimpan file ke harddisk (lokal)
// fileFilter: menyaring file hanya jika MIME type-nya termasuk jpg, jpeg, png
const upload = multer({ storage: thumbnailStorage(), fileFilter: imageFilter });

const movieRoutes = express.Router();

movieRoutes.get("/movies", getMovies);
movieRoutes.get("/movies/:id", getMovieDetail);
movieRoutes.post("/movies", upload.single("thumbnail"), createMovie); // Artinya: hanya menerima 1 file dengan field name thumbnail
movieRoutes.put("/movies/:id", upload.single("thumbnail"), updateMovie);
movieRoutes.delete("/movies/:id", deleteMovie);

export default movieRoutes;
