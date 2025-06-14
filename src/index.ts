import express, { type Express, type Request, type Response } from "express";
import connectDB from "./utils/database";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/api/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
