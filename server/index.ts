import express from "express";
import { createServer } from "http";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type EstimatePayload = {
  name?: string;
  phone?: string;
  email?: string;
  bestTime?: string;
  description?: string;
  projectTypes?: string[];
  source?: string;
};

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, app: "exterior-envelope-pros" });
  });

  app.post("/api/estimate", async (req, res) => {
    const payload = (req.body || {}) as EstimatePayload;
    if (!payload.name || !payload.phone || !payload.description) {
      return res.status(400).json({ ok: false, error: "Name, phone, and project description are required." });
    }

    const webhookUrl = process.env.EXTERIOR_ENVELOPE_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, receivedAt: new Date().toISOString() }),
        });
        if (!webhookResponse.ok) {
          return res.status(502).json({ ok: false, error: "Configured webhook did not accept the estimate request." });
        }
      } catch {
        return res.status(502).json({ ok: false, error: "Configured webhook could not be reached." });
      }
    }

    return res.json({ ok: true, stored: false, forwarded: Boolean(webhookUrl) });
  });

  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (req, res) => {
    const routeIndex = path.join(staticPath, req.path.replace(/^\/+/, ""), "index.html");
    if (existsSync(routeIndex)) {
      return res.sendFile(routeIndex);
    }
    return res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
