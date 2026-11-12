require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const tarotRouter = require("./routes/tarot");
const configRouter = require("./routes/config");
const shareRouter = require("./routes/share");
const harmonySocket = require("./socket/harmony");

const app = express();
// Caddy(로컬 리버스 프록시)가 넘겨주는 X-Forwarded-Proto를 믿어야 req.protocol이 https가 된다
app.set("trust proxy", "loopback");
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["polling", "websocket"],
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/tarot", tarotRouter);
app.use("/config", configRouter);
app.use("/share", shareRouter);

// Android App Links verification
app.get("/.well-known/assetlinks.json", (_, res) => {
  res.sendFile(path.join(__dirname, "well-known/assetlinks.json"));
});

app.set("io", io);
harmonySocket.setup(io);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, () => {
  console.log(`TarotServer 실행 중 → http://localhost:${PORT}`);
});
