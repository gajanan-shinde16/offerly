import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();


app.use(helmet());
app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);


app.use(morgan("dev"));


app.use("/api", routes);

app.use(errorHandler);

export default app;
