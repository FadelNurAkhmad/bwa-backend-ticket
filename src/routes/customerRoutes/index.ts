import express from "express";
import globalroutes from "./globalRoutes";
import { verifyRole, verifyToken } from "../../middlewares/verifyToken";

const customerRoutes = express.Router();

customerRoutes.use(verifyToken);
customerRoutes.use(verifyRole("customer"));
customerRoutes.use(globalroutes);

export default customerRoutes;
