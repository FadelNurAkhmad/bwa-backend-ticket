import type { Response } from "express";
import type { CustomRequest } from "../types/Request";
import { transactionSchema } from "../utils/zodSchema";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import TransactionSeat from "../models/TransactionSeat";

export const transactionTicket = async (req: CustomRequest, res: Response) => {
  try {
    // ✅ 1. Validasi body request menggunakan Zod
    const parse = transactionSchema.parse(req.body);

    // ✅ 2. Cari wallet user berdasarkan ID dari req.user
    // req.user biasanya di-inject oleh middleware auth (seperti JWT). Di sini kita cari dompet pengguna untuk cek saldo.
    const wallet = await Wallet.findOne({
      user: req.user?.id,
    });

    // ❌ 3. Jika wallet tidak ditemukan, atau saldo kurang, kirim error
    if (!wallet || (wallet && wallet.balance < parse.total)) {
      return res.status(400).json({
        status: "failed",
        message: "Insufficient balance, please top up your balance first",
        data: null,
      });
    }

    // ✅ 4. Buat entitas transaksi baru (belum disimpan ke database)
    // Membuat data transaksi tiket (film, teater, biaya, pajak, dll.) — tapi belum save() ke database.
    // transaction.id sudah tersedia langsung setelah new Transaction() karena Mongoose otomatis menghasilkan _id.
    // tidak perlu menunggu .save() untuk mengakses ID-nya.
    const transaction = new Transaction({
      bookingFee: parse.bookingFee,
      total: parse.total,
      subtotal: parse.subtotal,
      theater: parse.theaterId,
      movie: parse.movieId,
      tax: parse.tax,
      user: req.user?.id, // ID user pembeli tiket
      date: parse.date, // Tanggal transaksi
    });

    // ✅ 5. Simpan tiap kursi ke koleksi TransactionSeat
    // Looping semua kursi yang dipilih user, lalu simpan masing-masing ke database sebagai entri TransactionSeat.
    // transaction.id sudah tersedia langsung setelah new Transaction() karena Mongoose otomatis menghasilkan _id.
    // tidak perlu menunggu .save() untuk mengakses ID-nya.
    for (const seat of parse.seats) {
      const newSeat = new TransactionSeat({
        transaction: transaction.id, // ID transaksi sebagai foreign key
        seat: seat, // Nomor kursi
      });

      await newSeat.save(); // Simpan ke DB
    }

    // ✅ 6. Ambil kembali semua kursi yang berkaitan dengan transaksi tadi
    const transactionSeats = await TransactionSeat.find({
      transaction: transaction.id,
    });

    // ✅ 7. Hubungkan ID TransactionSeat ke field `seats` di transaction
    // Menambahkan array ID TransactionSeat ke dalam field seats di transaction.
    transaction.seats = transactionSeats.map((va) => va._id);
    // .map() Membuat array baru, dengan nilai yang diubah/ditransformasi dari array sebelumnya
    // Ambil array transactionSeats
    // Ubah isinya menjadi array baru yang hanya berisi field _id dari setiap kursi
    // Assign array tersebut ke field seats milik transaction
    // ✅ Hasil akhirnya transaction.seats berisi array seperti: ['idkursi1', 'idkursi2', 'idkursi3']

    // ✅ 8. Hitung saldo terkini dan kurangi dengan total pembayaran
    const currBalance = wallet.balance ?? 0;

    // Saldo wallet dikurangi dengan total harga pembelian. Perubahan disimpan langsung ke database.
    await Wallet.findByIdAndUpdate(wallet.id, {
      balance: currBalance - parse.total,
    });

    // ✅ 9. Simpan transaksi ke database setelah semua siap
    await transaction.save();

    // ✅ 10. Kirim respon sukses ke client
    return res.json({
      message: "success transaction ticket",
      status: "success",
    });
  } catch (error) {
    // ❌ 11. Tangkap dan tampilkan error jika ada kegagalan
    console.log(error);
    return res.status(500).json({
      message: "Failed to transaction ticket",
      data: null,
      status: "failed",
    });
  }
};

export const getOrders = async (req: CustomRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({
      user: req.user?.id,
    })
      .select("seats movie theater date status")
      .populate({
        path: "movie",
        select: "thumbnail title genre -_id",
        populate: {
          path: "genre",
          select: "name -_id",
        },
      })
      .populate({
        path: "seats",
        select: "seat -_id",
      })
      .populate({
        path: "theater",
        select: "name city -_id",
      });

    return res.json({
      status: "success",
      data: transactions,
      message: "success get data",
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

export const getOrderDetail = async (req: CustomRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)

      .populate({
        path: "movie",
        select: "thumbnail price bonus title genre -_id",
        populate: {
          path: "genre",
          select: "name -_id",
        },
      })
      .populate({
        path: "seats",
        select: "seat -_id",
      })
      .populate({
        path: "theater",
        select: "name city -_id",
      });

    return res.json({
      status: "success",
      data: transaction,
      message: "success get data",
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
