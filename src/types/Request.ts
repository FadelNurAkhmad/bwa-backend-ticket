import type { Request } from "express";
// 📦 Mengimpor tipe bawaan `Request` dari library Express.js

// Mendefinisikan struktur object user yang akan disimpan di dalam request.
type User = {
  id: string;
  name: string;
  role: "admin" | "customer"; // role hanya boleh bernilai "admin" atau "customer" (menggunakan union type).
  email: string;
};

// CustomRequest memperluas bawaan Request dari Express, dan menambahkan properti user (opsional).
// Properti ini nanti akan diisi setelah token berhasil diverifikasi.
export interface CustomRequest extends Request {
  user?: User;
}
