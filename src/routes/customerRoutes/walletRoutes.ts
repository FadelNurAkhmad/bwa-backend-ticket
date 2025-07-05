import express from "express";
import {
  getBalance,
  getTopupHistory,
} from "../../controllers/walletController";

const walletRoutes = express.Router();

walletRoutes.get("/check-balance", getBalance);
walletRoutes.get("/topup-history", getTopupHistory);

export default walletRoutes;
