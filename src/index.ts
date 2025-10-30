import express, { type Express, type Request, type Response } from "express";
import connectDB from "./utils/database";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// menggunakan middleware pakai app.use dan bersifat sinkronus
app.use(bodyParser.json()); // <- parsing data dari API ke JSON
app.use(cors());
app.use(express.static("public")); // Semua file yang berada di folder public/ akan tersedia di URL root (/) tanpa perlu membuat route khusus.
// digunakan untuk menyajikan (serve) file statis seperti: Gambar (.jpg, .png, .svg)

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
