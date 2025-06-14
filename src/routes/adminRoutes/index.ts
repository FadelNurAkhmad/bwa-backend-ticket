import express from "express";
import genreRoutes from "./genreRoutes";

const adminRoutes = express.Router();

adminRoutes.use(genreRoutes);

export default adminRoutes;
