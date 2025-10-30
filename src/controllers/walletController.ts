import type { Request, Response } from "express";
import Wallet from "../models/Wallet";
import type { CustomRequest } from "../types/Request";
import WalletTransaction from "../models/WalletTransaction";
import { topupSchema } from "../utils/zodSchema";

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

// Fungsi utama controller untuk melakukan top up saldo
export const topupBalance = async (req: CustomRequest, res: Response) => {
  try {
    // Validasi body request menggunakan Zod (wajib ada dan minimal 1000)
    const parse = topupSchema.parse(req.body);

    // Ambil konfigurasi Midtrans dari environment (.env)
    const midtransUrl = process.env.MIDTRANS_TRANSACTION_URL ?? "";
    const midtransAuth = process.env.MIDTRANS_AUTH_STRING ?? "";

    // Ambil data wallet user dari database berdasarkan user ID
    const wallet = await Wallet.findOne({
      user: req?.user?.id, // req.user di-inject dari middleware verifyToken
    });

    // Buat entitas transaksi top up (belum disimpan ke database)
    const topup = new WalletTransaction({
      wallet: wallet?.id, // ID wallet yang terhubung dengan transaksi ini
      price: parse.balance, // Jumlah nominal yang ingin di-topup
      status: "success", // Status awal transaksi
    });

    // Buat request POST ke API Midtrans Snap
    // new Request(url, options) adalah bagian dari Fetch API,
    // digunakan untuk membuat permintaan HTTP (mirip axios() tapi berbasis native API).
    // Ini menggunakan Web Fetch API-style Request dari Node.js v18+ atau undici/polyfill
    const midtransRequest = new Request(midtransUrl, {
      method: "POST",
      body: JSON.stringify({
        transaction_details: {
          order_id: topup.id, // ID transaksi digunakan sebagai order ID
          gross_amount: parse.balance, // Jumlah pembayaran
        },
        credit_card: {
          secure: true, // Mengaktifkan 3D Secure
        },
        customer_details: {
          email: req.user?.email, // Email user untuk Midtrans
        },
        callbacks: {
          finish: process.env.SUCCESS_PAYMENT_REDIRECT, // URL redirect setelah selesai
        },
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `BASIC ${midtransAuth}`, // Autentikasi ke Midtrans
      },
    });

    // Kirim request ke Midtrans dan tunggu responsnya
    const midtransResponse = await fetch(midtransRequest);

    // Ambil respons dalam bentuk JSON (berisi token dan URL Snap)
    const midtransJson = await midtransResponse.json();

    // Simpan data transaksi top up ke database "walletTransactions"
    await topup.save();

    // Kirim respons sukses ke client, termasuk data dari Midtrans
    return res.json({
      status: true,
      message: "topup success",
      data: midtransJson, // Ini biasanya berisi token & redirect_url dari Snap
    });
  } catch (error) {
    // Jika terjadi error, tampilkan di console dan kirim respons gagal
    console.log(error);
    return res.status(500).json({
      message: "Failed to topup balance",
      data: null,
      status: "failed",
    });
  }
};
