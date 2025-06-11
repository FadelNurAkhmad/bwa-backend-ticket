import express, { type Express, type Request, type Response } from "express";
import connectDB from "./utils/database";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
