import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

import authRoutes from "./src/server/interfaces/routes/authRoutes";
import { errorHandler } from "./src/server/interfaces/middlewares/errorHandler";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security & Logging
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json());
  app.use(morgan("combined")); // Professional logging

  // 2. API Routes
  app.use("/api/auth", authRoutes);

  // Health Check
  app.get("/api/health", (req, res) =>
    res.json({ status: "ok", timestamp: new Date() }),
  );

  // 3. Vite Middleware / Static Files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) =>
      res.sendFile(path.resolve(distPath, "index.html")),
    );
  }

  // 4. Global Error Handler (Must be last)
  app.use(errorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
================================================
🚀 ESQUADRIASCALC PRO - SERVER ONLINE
📡 Port: ${PORT}
🌍 Mode: ${process.env.NODE_ENV || "development"}
================================================
    `);
  });
}

startServer().catch((err) => {
  console.error("CRITICAL: Server failed to start:", err);
  process.exit(1);
});
