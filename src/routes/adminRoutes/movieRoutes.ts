import express from "express";
import { getMovies } from "../../controllers/movieController";

const movieRoutes = express.Router();

movieRoutes.get("/movies", getMovies);

export default movieRoutes;
