require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const tarotRouter = require("./routes/tarot");
const configRouter = require("./routes/config");
const harmonySocket = require("./socket/harmony");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["polling", "websocket"],
});

app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/tarot", tarotRouter);
app.use("/config", configRouter);

// Android App Links verification
app.get("/.well-known/assetlinks.json", (_, res) => {
  res.sendFile(path.join(__dirname, "well-known/assetlinks.json"));
});

harmonySocket.setup(io);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`TarotServer 실행 중 → http://localhost:${PORT}`);
});
