import express from "express";
import { getGenres } from "../../controllers/genreController";
const genreRoutes = express.Router();

genreRoutes.get("/genres", getGenres);

export default genreRoutes;
