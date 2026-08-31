import cloudinary from "./src/config/cloudinary.config.js";
import express from "express";
import connectDB from "./src/config/dbConnection.config.js";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";
import CommonRouter from "./src/router/common.route.js";
import RestaurantRouter from "./src/router/restaurant.route.js";
import CustomerRouter from "./src/router/customer.route.js";
import RiderRouter from "./src/router/rider.route.js";
import AdminRouter from "./src/router/admin.route.js";
import OrderRouter from "./src/router/order.route.js";
import PaymentRouter from "./src/router/payment.route.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);app.use(express.json());
app.use(cookieParser());

app.use(morgan("dev"));

app.use("/auth", AuthRouter);
app.use("/public", PublicRouter);
app.use("/common", CommonRouter);
app.use("/restaurant", RestaurantRouter);
app.use("/customer", CustomerRouter);
app.use("/rider", RiderRouter);
app.use("/admin", AdminRouter);
app.use("/order", OrderRouter);

app.use("/payment", PaymentRouter);
//Default API
app.get("/", (req, res) => {
  console.log("Default Get API Hit");
  res.json({ message: "Welcome to my Cravings Project" });
});

//Default Error Handler
app.use((err, req, res, _next) => {
  console.error("Server Error:", err.stack || err.message);
  let ErrStatusCode = err.statusCode || 500;
  let ErrMessage = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    ErrStatusCode = 400;
    ErrMessage =
      Object.values(err.errors || {})
        .map((e) => e.message)
        .join(", ") || err.message;
  } else if (err.name === "CastError") {
    ErrStatusCode = 400;
    ErrMessage = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(ErrStatusCode).json({ message: ErrMessage });
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log("Server Started on port:", port);
  connectDB();
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary Connected :");
    console.log(result);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
});
