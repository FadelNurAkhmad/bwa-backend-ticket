import express from "express";
import { getTheaters, postTheater } from "../../controllers/theaterController";
import { validateRequest } from "../../middlewares/validateRequest";
import { theaterSchema } from "../../utils/zodSchema";

const theaterRoutes = express.Router();

theaterRoutes.get("/theaters", getTheaters);
theaterRoutes.post("/theaters", validateRequest(theaterSchema), postTheater);

export default theaterRoutes;
