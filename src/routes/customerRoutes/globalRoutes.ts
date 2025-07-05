import express from "express";
import {
  getAvailableSeats,
  getGenre,
  getMovieDetail,
  getMovies,
  getMoviesFilter,
} from "../../controllers/globalController";

const globalroutes = express.Router();

globalroutes.get("/movies", getMovies);
globalroutes.get("/genres", getGenre);
globalroutes.get("/movies/:id", getMovieDetail);
globalroutes.get("/check-seats/:movieId", getAvailableSeats);
globalroutes.get("/browse-movies/:genreId", getMoviesFilter);

export default globalroutes;
