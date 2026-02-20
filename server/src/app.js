import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

/* ---------- SECURITY & PARSING ---------- */
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

/* ---------- CORS (COOKIE SAFE) ---------- */
app.use(
  cors({
    origin: process.env.CLIENT_URL || true, // 🔥 safe for prod + dev
    credentials: true
  })
);

/* ---------- LOGGING ---------- */
app.use(morgan("dev"));

/* ---------- ROUTES ---------- */
app.use("/api", routes);

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

export default app;
