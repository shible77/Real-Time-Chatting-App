import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import roomRouter from "./routes/room.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});
