import express from "express";
import {
  getAvailableSeats,
  getGenre,
  getMovieDetail,
  getMovies,
} from "../../controllers/globalController";

const globalroutes = express.Router();

globalroutes.get("/movies", getMovies);
globalroutes.get("/genres", getGenre);
globalroutes.get("/movies/:id", getMovieDetail);
globalroutes.get("/check-seats/:movieId", getAvailableSeats);

export default globalroutes;
