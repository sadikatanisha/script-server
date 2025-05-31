import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./config/db";
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin.route";
import userRouter from "./routes/user.route";
import paymentRouter from "./routes/payment.route";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

connectDB();

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome!");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/payment", paymentRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
