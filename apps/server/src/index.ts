import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { createServer } from "http";
import { Server } from "socket.io";
import puppeteer from "puppeteer";
import { Queue, Worker } from "bullmq";
import RedisModule from "ioredis";
import { sampleQuestionPaper } from "./sample.js";
import {
  connectMongo,
  deleteAssignment,
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
const clientUrl = process.env.CLIENT_URL || process.env.WEB_URL || "http://localhost:3000";
const io = new Server(httpServer, {
  cors: {
    origin: clientUrl,
    credentials: true,
  },
});
const port = Number(process.env.PORT || 4000);
const webUrl = clientUrl;
const MAX_TOTAL_MARKS = 100;
const MAX_TOTAL_QUESTIONS = 40;
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_SOURCE_TEXT_LENGTH = 12000;
const assignments = new Map<string, unknown>();
let mongoEnabled = false;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (_request, file, callback) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      callback(null, true);
      return;
    }
    callback(new Error("Invalid file type"));
  },
});

app.use(
  cors({
    origin: webUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Due-Date"],
  })
);
app.use(express.json());

// Health check endpoint
app.get("/health", (request, response) => {
  response.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

// BullMQ connection options
const bullmqConnection = {
  url: redisUrl,
  maxRetriesPerRequest: null,
} as unknown as { host: string; port: number; maxRetriesPerRequest: null };

const queue = new Queue("assignment-generation", {
  connection: bullmqConnection as unknown as any,
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
  { connection: bullmqConnection as unknown as any },
);

app.post("/assignments", upload.single("file"), async (request, response) => {
  const assignmentId = `assignment-${Date.now()}`;
  const totalQuestions = Number(request.body.totalQuestions || 10);
  const totalMarks = Number(request.body.totalMarks || 20);
  const sourceText = await extractSourceText(request.file);
  let questionTypes: Array<{ type: string; count: number; marks: number }> = [];
  try {
    questionTypes = JSON.parse(request.body.questionTypes || "[]");
  } catch {
    // fallback if invalid JSON
  }
  const input = {
    subject: request.body.subject || "Science",
    className: request.body.className || "8",
    totalQuestions,
    totalMarks,
    instructions: request.body.instructions,
    sourceText,
    questionTypes,
  };

  if (input.totalMarks > MAX_TOTAL_MARKS) {
    response.status(400).json({ message: "Total marks exceeded" });
    return;
  }

  if (input.totalQuestions > MAX_TOTAL_QUESTIONS) {
    response.status(400).json({ message: "Total questions exceeded" });
    return;
  }

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

app.delete("/assignments/:id", async (request, response) => {
  const assignmentId = request.params.id;
  try {
    // Delete from memory cache
    const deletedFromMemory = assignments.delete(assignmentId);
    logger.info(`Delete request for ${assignmentId}: Removed from memory cache = ${deletedFromMemory}`);
    
    // Delete from MongoDB
    const dbResult = await deleteAssignment(assignmentId, mongoEnabled);
    logger.info(`Database delete result: ${JSON.stringify(dbResult)}`);
    
    response.status(204).send();
  } catch (error) {
    logger.error(`Error deleting assignment ${assignmentId}: ${error}`);
    response.status(500).json({ message: "Failed to delete assignment", error: String(error) });
  }
});

app.get("/assignments/:id/pdf", async (request, response) => {
  let browser: puppeteer.Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    const assignmentId = request.params.id;
    await page.goto(`${webUrl}/assignments/${assignmentId}/print`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader(
      "Content-Disposition",
      "attachment; filename=veda-ai-assignment.pdf",
    );
    response.send(pdf);
  } catch (err) {
    logger.error(`PDF generation error for ${request.params.id}:`, err);
    const message = err instanceof Error ? err.message : String(err);
    response.status(500).json({ message: "PDF generation failed", error: message });
  } finally {
    if (browser) await browser.close();
  }
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError) {
      response.status(400).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message === "Invalid file type") {
      response.status(400).json({ message: "Invalid file type" });
      return;
    }

    response.status(500).json({ message: "Something went wrong" });
  },
);

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
    sourceText?: string;
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

async function extractSourceText(file?: Express.Multer.File) {
  if (!file) {
    return "";
  }

  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf8").slice(0, MAX_SOURCE_TEXT_LENGTH);
  }

  if (file.mimetype === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: file.buffer });
    try {
      const data = await parser.getText({ first: 8 });
      return data.text
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_SOURCE_TEXT_LENGTH);
    } finally {
      await parser.destroy();
    }
  }

  return "";
}
