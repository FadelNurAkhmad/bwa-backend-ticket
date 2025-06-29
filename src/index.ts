import express, { type Express, type Request, type Response } from "express";
import connectDB from "./utils/database";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

// menggunakan middleware pakai app.use dan bersifat sinkronus
app.use(bodyParser.json()); // <- parsing data dari API ke JSON

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
