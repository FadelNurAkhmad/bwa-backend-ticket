import express from "express";
import { login } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { authSchema } from "../utils/zodSchema";

const authRoutes = express.Router();

authRoutes.post(
  "/auth/login",
  validateRequest(authSchema.omit({ name: true })),
  login
);

export default authRoutes;
