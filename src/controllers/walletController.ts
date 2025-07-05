import type { Request, Response } from "express";
import Wallet from "../models/Wallet";
import type { CustomRequest } from "../types/Request";
import WalletTransaction from "../models/WalletTransaction";

// Fungsi utama: Ambil saldo/balance dari user yang sedang login
// CustomRequest adalah request yang sudah ditambahkan properti user
// Nilai user diisi dari proses middleware JWT (verifyToken)
// Properti ini menyimpan data user hasil decode token: id, email, role, name
export const getBalance = async (req: CustomRequest, res: Response) => {
  try {
    const wallet = await Wallet.findOne({
      user: req.user?.id, // ✅ Ambil ID user dari token JWT yang didecode dan disisipkan oleh middleware
    });

    // wallet?.balance ?? 0: menggunakan optional chaining dan nullish coalescing
    // Jika wallet tidak ada (null), maka balance dianggap 0
    return res.json({
      status: true,
      message: "success get data",
      data: {
        balance: wallet?.balance ?? 0, // ✅ Jika wallet ditemukan → ambil saldonya, jika tidak → default 0
      },
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

export const getTopupHistory = async (req: CustomRequest, res: Response) => {
  try {
    const wallet = await Wallet.findOne({
      user: req.user?.id,
    });

    const data = await WalletTransaction.find({
      wallet: wallet?._id,
    }).select("wallet price createdAt status");

    return res.json({
      status: true,
      message: "success get data",
      data: data,
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
