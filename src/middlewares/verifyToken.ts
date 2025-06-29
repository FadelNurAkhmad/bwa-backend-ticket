import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import type { CustomRequest } from "../types/Request"; // 📦 Tipe request yang telah diperluas dengan field user

// Tipe untuk Data Token
type JWTPayload = {
  data: { id: string };
};

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const secretKey = process.env.SECRET_KEY ?? ""; // Ambil secret key dari environment
  // Digunakan untuk memverifikasi token (harus sama dengan saat membuat JWT di login).

  // Cek apakah header Authorization tersedia dan pakai skema "JWT"
  // Format header: Authorization: JWT <token> // Validasi prefix JWT.
  if (req.headers?.authorization?.split(" ")[0] === "JWT") {
    const token = req.headers?.authorization?.split(" ")[1]; // Ambil token dari header // Ambil token setelah kata JWT.
    const decoded = (await jwt.verify(token, secretKey)) as JWTPayload;
    // jwt.verify() dari jsonwebtoken digunakan untuk memastikan token valid dan belum kedaluwarsa.
    // Mengembalikan payload, lalu dikonversi ke tipe JWTPayload.

    const user = await User.findById(decoded.data.id); // Cari user berdasarkan ID yang ada di dalam token.

    // Cek apakah user ada
    if (!user) {
      return res.status(401).json({
        message: "Token invalid",
      });
    }

    // Simpan data user ke dalam request
    // Data user yang telah diverifikasi disimpan di req.user agar bisa digunakan di middleware berikutnya atau controller.
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next(); // Lanjut ke middleware berikutnya
  } else {
    // Handle jika header authorization tidak valid
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};

export const verifyRole =
  (type: "admin" | "customer") =>
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Cek apakah role user sesuai
    if (req?.user?.role === type) {
      next(); // Jika role cocok (misalnya "admin"), lanjut ke fungsi berikutnya.

      return;
    }

    // Jika role tidak sesuai, kembalikan status unauthorized.
    return res.status(401).json({
      message: "Unauthorized",
    });
  };
