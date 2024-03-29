import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import winston from "winston";
import bodyParser from "body-parser";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";

import usersRouter from "../api/routes/users.js";
import authRoute from "../api/routes/auth.js";
import postRoute from "../api/routes/posts.js";
import commentRoute from "../api/routes/comments.js";
import typePetRoute from "../api/routes/typePets.js";
import searchRoute from "../api/routes/search.js";
import reportRoute from "../api/routes/report.js";

import validateToken from "./models/authMiddleware.js";

const app = express();

app.get('/api/auth/test', (req, res) => {
  res.send('This is a test endpoint for authentication.');
});

const port = 4000;
const server = app.listen(port, () => {
  console.log(`Backend server is running on port ${port}!`);
});

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Set your frontend URL here
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies to be sent
  },
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

dotenv.config();

app.use(cors()); // Enable CORS

// app.use(
//   "/images",
//   express.static(new URL("./public/images", import.meta.url).pathname)
// );

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json({ limit: "1000mb" }));

app.use(function (req, res, next) {
  var oneof = false;
  if (req.headers.origin) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    oneof = true;
  }
  if (req.headers["access-control-request-method"]) {
    res.header(
      "Access-Control-Allow-Methods",
      req.headers["access-control-request-method"]
    );
    oneof = true;
  }
  if (req.headers["access-control-request-headers"]) {
    res.header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"]
    );
    oneof = true;
  }
  if (oneof) {
    res.header("Access-Control-Max-Age", 60 * 60 * 24 * 365);
  }

  // intercept OPTIONS method
  if (oneof && req.method == "OPTIONS") {
    res.send(200);
  } else {
    next();
  }
});

app.get("/api/protected", validateToken, (req, res) => {
  // Access the user's information from req.user
  const userId = req.user.userId;
  console.log(`Accessing ${userId}`);
  // Handle the protected route logic here
  res.status(200).json({ userId });
  res.send(`Protected route accessed by user with ID: ${userId}`);
});

app.use("/api/auth", authRoute);
app.use("/api/users", usersRouter);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);
app.use("/api/typePets", typePetRoute);
app.use("/api/search", searchRoute);
app.use("/api/report", reportRoute);

app.use("*", (request, response, next) => {
  logger.warn(`Undefined route: ${request.originalUrl}`);
  next();
});

// ...

io.on("connection", (socket) => {
  console.log("Connected....");

  // Handle socket events
  socket.on("newPost", (newPost) => {
    // Emit the new post to all connected clients
    console.log(newPost);
    io.emit("newPost", newPost);
  });

  socket.on("likeUpdate", ({ id, member_id }) => {
    // Handle the like update logic here, e.g., update the like count in the database
    // You can emit an event to the specific post's room or to all connected clients
    // Example:
    // io.to(`post-${id}`).emit("likeUpdated", { id, member_id });
    socket.broadcast.emit("likeUpdated", { id, member_id });
  });

  socket.on("commentAdded", ({ postId, comment }) => {
    // Handle the new comment logic here
    // You can emit an event to the specific post's room or to all connected clients
    // Example:
    // io.to(`post-${postId}`).emit("commentAdded", { postId, comment });
    socket.broadcast.emit("commentAdded", { postId, comment });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // Handle other socket events...
});

