import type { Request, Response } from "express";
import { authSchema } from "../utils/zodSchema";
import User from "../models/User";
import bcrypt from "bcrypt"; // ➤ Library untuk hashing dan verifikasi password (https://www.npmjs.com/package/bcrypt)
import jwt from "jsonwebtoken"; // ➤ Library untuk membuat dan memverifikasi JSON Web Token (JWT)

export const login = async (req: Request, res: Response) => {
  try {
    // omit = Menghapus field name dari validasi (karena login tidak butuh nama)
    const parse = authSchema
      .omit({
        name: true,
      })
      .parse(req.body); // Validasi isi dari req.body (data dari request)

    // Cari user dari koleksi MongoDB berdasarkan email dan role
    const checkUser = await User.findOne({
      email: parse.email,
      role: parse.role,
    });

    if (!checkUser) {
      return res.status(400).json({
        message: "Email not registered",
        data: null,
        status: "failed",
      });
    }

    // bcrypt.compareSync(...): Bandingkan password dari user input dengan hash di database
    // Gunakan metode sinkron (compareSync) agar langsung return boolean
    const comparePassword = bcrypt.compareSync(
      parse.password,
      checkUser.password
    );

    if (!comparePassword) {
      return res.status(400).json({
        message: "Email / Password incorrect",
        data: null,
        status: "failed",
      });
    }

    const secretKey = process.env.SECRET_KEY ?? ""; // Ambil SECRET_KEY dari .env

    // jwt.sign(...): Buat token yang berisi id user
    // Output: Token string yang bisa digunakan di Authorization Header
    const token = jwt.sign(
      {
        data: {
          id: checkUser.id,
        },
      },
      secretKey,
      { expiresIn: "24h" } // expiresIn: "24h": Token berlaku selama 24 jam
    );

    // Kirimkan respons dengan data user dan token untuk otentikasi selanjutnya.
    return res.json({
      message: "Success login",
      data: {
        name: checkUser.name,
        email: checkUser.email,
        role: checkUser.role,
        photoUrl: checkUser.photoUrl,
        token,
      },
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login",
      data: null,
      status: "failed",
    });
  }
};
