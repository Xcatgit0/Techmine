import express from "express";
import path from "path";
import pkg from "http-proxy";
const { createProxyServer } = pkg;
import { createServer } from "http";
import { spawn } from "child_process";
import { fileURLToPath } from 'url';
// --- รันเกมเซิร์ฟเวอร์แบบแยก process ---
const gameServer = spawn("node", ["./src/Server/Main.js"], {
  stdio: ["ignore", "pipe", "pipe"], // stdout/stderr เป็น pipe
});

gameServer.stdout.on("data", (data) => {
  process.stdout.write(`[SRVR] ${data}`);
});

gameServer.stderr.on("data", (data) => {
  process.stderr.write(`[SRVR] ${data}`);
});

gameServer.on("exit", (code, signal) => {
  console.log(`[SRVR] Game server exited with code ${code}, signal ${signal}`);
});
// --- Express setup ---
const app = express();
const port = 3000;

// --- 1) Log HTTP request ---
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// เซิร์ฟไฟล์จากโฟลเดอร์ปัจจุบัน
app.use(express.static(__dirname));


// สร้าง HTTP server สำหรับ Express
const server = createServer(app);

// --- 2) WebSocket Proxy ---
const wsProxy = createProxyServer({
  target: "ws://localhost:3080", // ServerGame ของคุณ
  ws: true,
});

// Log WebSocket traffic
wsProxy.on("proxyReqWs", (proxyReq, req, socket, options, head) => {
  console.log(`[WS]   Client connected: ${req.socket.remoteAddress} ${req.url}`);
});

wsProxy.on("open", (proxySocket) => {
  console.log("[WS]   Connection opened to target server");
});

wsProxy.on("proxyRes", (proxyRes, req, res) => {
  console.log(`[WS]   Proxy response from target`);
});

wsProxy.on("error", (err, req, res) => {
  console.error(`[WS]   Proxy error:`, err);
});

// Handle upgrade (WebSocket)
server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/GameServer")) {
    wsProxy.ws(req, socket, head);
  }
});

// Start server
server.listen(port, () => {
  console.log(`HTTP + WebSocket proxy running at http://localhost:${port}`);
  console.log(`WebSocket proxy path: /GameServer -> ws://localhost:3080`);
});
