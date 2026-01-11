const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const path = require("path");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

const PORT = process.env.PORT || 8787;

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

app.get("/cards", async (req, res) => {
  if (!supabase) return res.status(500).json({ error: "supabase not configured" });
  const { data, error } = await supabase.from("cards").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

app.get("/pack", async (req, res) => {
  if (!supabase) {
    return res.status(500).json({ error: "supabase not configured" });
  }

  const count = Number.parseInt(req.query.count || "5", 10);
  const pullCount = Number.isNaN(count) || count < 1 ? 5 : count;

  const { data, error } = await supabase.from("cards").select("*");
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const cards = data || [];
  if (cards.length <= pullCount) {
    return res.json({ cards });
  }

  const shuffled = cards
    .map((card) => ({ card, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.card);

  res.json({ cards: shuffled.slice(0, pullCount) });
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
