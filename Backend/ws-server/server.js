const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json());

// In-memory status cache by client_id
const statusByClient = new Map();

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/status", (req, res) => {
  const clientId = req.query.client_id;
  if (!clientId) {
    return res.status(400).json({ error: "client_id is required" });
  }

  const entry = statusByClient.get(clientId);
  if (!entry) {
    return res.status(404).json({ error: "no status for client_id" });
  }

  res.json(entry);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    try {
      const payload = JSON.parse(message.toString());
      const { client_id, status } = payload;
      if (!client_id || !status) {
        return;
      }

      statusByClient.set(client_id, {
        client_id,
        status,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      // Ignore malformed messages
    }
  });
});

// Basic heartbeat to clear dead sockets
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`WS server listening on :${PORT}`);
});
