import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

// non-protected routes
app.use("/api/auth", authRouter);

// protected routes
// app.use(verifyJWT)

export { app };
