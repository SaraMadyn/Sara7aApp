import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Message/message.controller.js";
import { globalErrorHandler } from "./Utils/errorHandler.units.js";
import connectDB from "./DB/connection.js";
import cors from "cors";
import path from "node:path";
import morgan from "morgan";
import { attachRouterWithLogger } from "./Utils/logger/logger.utils.js";
import helmet from "helmet";
import { corsOption } from "./Utils/cors/cors.utils.js";
import {rateLimit} from "express-rate-limit";
const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(cors(corsOption()));
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 5, 
    message: {
      statusCode: 429,
      message: "Too many requests from this IP, please try again after 15 minutes"
    },
    legacyHeaders: false,
  });
  app.use(limiter);

  await connectDB();
  attachRouterWithLogger(app, "/api/v1/auth", authRouter, "auth.log");
  attachRouterWithLogger(app, "/api/v1/user", userRouter, "users.log");
  attachRouterWithLogger(app, "/api/v1/message", messageRouter, "messages.log");


  app.get("/", (req, res) => {
    return res.status(200).json({ message: "Done" });
  });


  app.use("/uploads", express.static((path.resolve("./src/uploads"))));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/message", messageRouter);

  app.use((req, res) => {
    return res.status(404).json({ message: "Not Found Handler!!!" });
  });

  app.use(globalErrorHandler);
};

export default bootstrap;


