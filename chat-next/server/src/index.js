import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server);

const upload = multer({ dest: "uploads/" });

app.use(cors());

let history = [];

// servir archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// obtener historial
app.get("/history", (req, res) => {
  res.json(history);
});

// subir archivo
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const fileUrl = `/uploads/${req.file.filename}`;
  const newMessage = {
    from: "server",
    body: fileUrl,
    type: req.file.mimetype,
    timestamp: new Date(),
  };

  history.push(newMessage);
  io.emit("message", newMessage);

  res.json(newMessage);
});

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("message", (body) => {
    console.log(body);
    const newMessage = {
      body,
      from: socket.id.slice(6),
      type: "text",
      timestamp: new Date(),
    };
    history.push(newMessage);
    socket.broadcast.emit("message", newMessage);
    // socket.broadcast.emit("message", {
    //   body,
    //   from: socket.id.slice(6),
    //   type: "text",
    //   timestamp: new Date(),
    // });
  });
});

server.listen(3000);
console.log("server on port", 3000);
