import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import puppeteer from "puppeteer";
import { Queue, Worker } from "bullmq";
import RedisModule from "ioredis";
import { sampleQuestionPaper } from "./sample.js";
import {
  connectMongo,
  findAssignment,
  saveAssignment,
} from "./assignment-model.js";
import { generateQuestionPaper } from "./generate-paper.js";

dotenv.config();

const logger = {
  info: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") console.error(...args);
  },
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.WEB_URL || "http://localhost:3000" },
});
const port = Number(process.env.PORT || 4000);
const webUrl = process.env.WEB_URL || "http://localhost:3000";
const assignments = new Map<string, unknown>();
let mongoEnabled = false;

app.use(cors({ origin: webUrl }));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("assignment:join", (assignmentId: string) => {
    socket.join(assignmentId);
  });
});

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const RedisCtor = RedisModule as unknown as new (
  url: string,
  options: { maxRetriesPerRequest: null },
) => RedisModule.Redis;
const connection = new RedisCtor(redisUrl, { maxRetriesPerRequest: null });
connection.on("error", () => undefined);
let redisReady = false;
connection.on("ready", () => {
  redisReady = true;
});
connection.on("close", () => {
  redisReady = false;
});
const queue = new Queue("assignment-generation", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
});

new Worker(
  "assignment-generation",
  async (job) => {
    const assignmentId = job.data.assignmentId;
    try {
      io.to(assignmentId).emit("processing", { assignmentId });
      const paper = await generateQuestionPaper(job.data.input);
      io.to(assignmentId).emit("structuring", { assignmentId });
      await new Promise((resolve) => setTimeout(resolve, 350));
      io.to(assignmentId).emit("saving", { assignmentId });
      assignments.set(assignmentId, paper);
      await saveAssignment(assignmentId, paper, mongoEnabled);
      io.to(assignmentId).emit("completed", { assignmentId });
    } catch (error) {
      io.to(assignmentId).emit("failed", { assignmentId });
      throw error;
    }
  },
  { connection },
);

app.post("/assignments", async (request, response) => {
  const assignmentId = `assignment-${Date.now()}`;
  const input = {
    subject: request.body.subject || "Science",
    className: request.body.className || "8",
    totalQuestions: request.body.totalQuestions || 10,
    totalMarks: request.body.totalMarks || 20,
    instructions: request.body.instructions,
  };

  io.to(assignmentId).emit("queued", { assignmentId });
  try {
    if (!redisReady) {
      void simulateWithoutRedis(assignmentId, input);
    } else {
      await Promise.race([
        queue.add("generate", { assignmentId, input }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis queue timeout")), 1500),
        ),
      ]);
    }
  } catch {
    void simulateWithoutRedis(assignmentId, input);
  }

  response.status(201).json({ assignmentId });
});

app.get("/assignments/:id", async (request, response) => {
  const fromMemory = assignments.get(request.params.id);
  if (fromMemory) {
    response.json(fromMemory);
    return;
  }

  const fromMongo = await findAssignment(request.params.id, mongoEnabled);
  response.json(fromMongo || sampleQuestionPaper);
});

app.get("/assignments/:id/pdf", async (request, response) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const assignmentId = request.params.id;
    await page.goto(`${webUrl}/assignments/${assignmentId}/output`, {
      waitUntil: "networkidle0",
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
    });
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=veda-ai-assignment.pdf",
    );
    response.send(pdf);
  } finally {
    await browser.close();
  }
});

httpServer.listen(port, () => {
  logger.info(`VedaAI server running on http://localhost:${port}`);
});

connectMongo()
  .then((enabled) => {
    mongoEnabled = enabled;
    if (enabled) {
      logger.info("MongoDB connected");
    }
  })
  .catch((error) => {
    mongoEnabled = false;
    logger.warn(`MongoDB disabled: ${error}`);
  });

connection
  .ping()
  .then(() => {
    redisReady = true;
  })
  .catch(() => {
    redisReady = false;
  });

async function simulateWithoutRedis(
  assignmentId: string,
  input: {
    subject: string;
    className: string;
    totalQuestions: number;
    totalMarks: number;
    instructions?: string;
  },
) {
  try {
    io.to(assignmentId).emit("processing", { assignmentId });
    const paper = await generateQuestionPaper(input);
    io.to(assignmentId).emit("structuring", { assignmentId });
    await new Promise((resolve) => setTimeout(resolve, 350));
    io.to(assignmentId).emit("saving", { assignmentId });
    assignments.set(assignmentId, paper);
    await saveAssignment(assignmentId, paper, mongoEnabled);
    io.to(assignmentId).emit("completed", { assignmentId });
  } catch {
    io.to(assignmentId).emit("failed", { assignmentId });
  }
}
