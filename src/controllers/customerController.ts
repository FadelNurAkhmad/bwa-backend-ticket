import type { Request, Response } from "express";
import User from "../models/User";
import WalletTransaction from "../models/WalletTransaction";
import Transaction from "../models/Transaction";

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await User.find({ role: "customer" }).select(
      "name email"
    );

    return res.json({
      data: customers,
      message: "Success get data",
      status: "Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get data",
      data: null,
      status: "failed",
    });
  }
};

export const getWalletTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await WalletTransaction.find().populate({
      path: "wallet", // Ambil data dari field `wallet` (ObjectId ke koleksi Wallet)
      select: "user -_id", // Hanya ambil field `user`, dan hilangkan jangan tampilkan `_id` dari wallet
      populate: {
        path: "user", // Dari field `user` di dalam `wallet`, ambil datanya dari koleksi User
        select: "name", // Hanya ambil field `name` dari user
      },
    });

    return res.json({
      data: transactions,
      message: "Success get data",
      status: "Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get data",
      data: null,
      status: "failed",
    });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: "user",
        select: "name -_id", // Hanya ambil field `name`, dan jangan tampilkan `_id` dari user
      })
      .populate({
        path: "movie",
        select: "title -_id",
      })
      .populate({
        path: "theater",
        select: "name -_id",
      });

    return res.json({
      data: transactions,
      message: "Success get data",
      status: "Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get data",
      data: null,
      status: "failed",
    });
  }
};
