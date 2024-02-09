import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
dotenv.config();

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/auth.js";
const uri = process.env.URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};
mongoose
  .connect(uri, clientOptions)
  .then(() => console.info("Database connection successful"))
  .catch((error) => {
    console.log("Database connection error:", error);
    process.exit(1);
  });

const app = express();
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/contacts", contactsRouter);
app.use("/users/register", authRouter)
app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

app.listen(3000, () => {
  console.log("Server is running. Use our API on port: 3000");
});
