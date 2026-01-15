import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./utils/globalError";

const app = express();
app.use(cors());

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  })
);

app.use(express.static("public"));

app.use(cookieParser());

// importing router as named imports
import authRouter from "./routes/auth.route";
import userRouter from "./routes/user.route";
import transactionRouter from "./routes/transaction.route";
import authenticateJWT from "./middleware/authenticateJWT";

// non-protected routes
app.use("/api/auth", authRouter);

// protected routes
app.use(authenticateJWT);
app.use("/api/user", userRouter);
app.use("/api/transaction", transactionRouter);

// global error
app.use(globalErrorHandler);
export { app };
