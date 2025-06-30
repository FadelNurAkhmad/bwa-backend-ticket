import type { Request, Response } from "express";
import { authSchema } from "../utils/zodSchema";
import User from "../models/User";
import bcrypt from "bcrypt"; // ➤ Library untuk hashing dan verifikasi password (https://www.npmjs.com/package/bcrypt)
import jwt from "jsonwebtoken"; // ➤ Library untuk membuat dan memverifikasi JSON Web Token (JWT)
import Wallet from "../models/Wallet";

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

export const register = async (req: Request, res: Response) => {
  try {
    const parse = authSchema
      .omit({
        role: true,
      })
      .safeParse(req.body);
    // .safeParse(req.body): validasi data req.body (hasil form input),
    // tapi tidak melempar error, melainkan mengembalikan objek { success, data/error }

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(400).json({
        message: "Invalid request",
        data: errorMessages,
        status: "failed",
      });
    }

    const emailExisted = await User.findOne({
      email: parse.data.email, // findOne(...): cari user dengan email yang sama
    });

    if (emailExisted) {
      return res.status(400).json({
        message: "Email already exist",
        data: null,
        status: "failed",
      });
    }

    // bcrypt adalah library untuk hashing password
    // hashSync(password, saltRounds): hash password secara sinkron
    // Salt rounds 12 adalah level keamanan hashing (semakin besar, semakin aman tapi lambat)
    const hashPassword = bcrypt.hashSync(parse.data.password, 12);

    // Buat dokumen baru untuk user
    const user = new User({
      name: parse.data.name,
      email: parse.data.email,
      password: hashPassword,
      role: "customer",
      photo: req.file?.filename, // req.file.filename berisi nama file yang disimpan ke disk
    });
    // Contoh Data req.file (Disediakan oleh multer) :
    // {
    //   fieldname: 'photo',
    //   originalname: 'myprofile.png',
    //   encoding: '7bit',
    //   mimetype: 'image/png',
    //   destination: 'public/uploads/photos',
    //   filename: 'photo-1719056235000-843213342.png',
    //   path: 'public/uploads/photos/photo-1719056235000-843213342.png',
    //   size: 35400
    // }

    const wallet = new Wallet({
      balance: 0,
      user: user._id,
    });

    // Simpan dokumen user dan wallet ke MongoDB
    await user.save();
    await wallet.save();

    return res.json({
      message: "Success sign up",
      data: {
        name: user.name,
        email: user.email,
      },
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to register",
      data: null,
      status: "failed",
    });
  }
};
