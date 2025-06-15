import express from "express";
import { getGenres, postGenre } from "../../controllers/genreController";
import { validateRequest } from "../../middlewares/validateRequest";
import { genreSchema } from "../../utils/zodSchema";
const genreRoutes = express.Router();

genreRoutes.get("/genres", getGenres);
genreRoutes.post("/genres", validateRequest(genreSchema), postGenre);

export default genreRoutes;
