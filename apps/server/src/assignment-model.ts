import mongoose, { Schema } from "mongoose";
import type { QuestionPaper } from "../validators/question-paper.schema.js";

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

const QuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    difficulty: { type: String, required: true },
    marks: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const SectionSchema = new Schema(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false },
);

const AssignmentSchema = new Schema(
  {
    assignmentId: { type: String, required: true, unique: true },
    paper: {
      title: { type: String, required: true },
      subject: { type: String, required: true },
      className: { type: String, required: false },
      duration: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      sections: { type: [SectionSchema], required: true },
    },
  },
  { timestamps: true },
);

export const AssignmentModel =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);

export async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    return false;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    return true;
  } catch (error) {
    logger.warn(`MongoDB connection failed: ${error}`);
    return false;
  }
}

export async function saveAssignment(
  assignmentId: string,
  paper: QuestionPaper,
  mongoEnabled: boolean,
) {
  if (!mongoEnabled) {
    return;
  }

  await AssignmentModel.findOneAndUpdate(
    { assignmentId },
    { assignmentId, paper },
    { upsert: true, returnDocument: 'after' },
  );
}

export async function findAssignment(
  assignmentId: string,
  mongoEnabled: boolean,
) {
  if (!mongoEnabled) {
    return null;
  }

  const assignment = await AssignmentModel.findOne({ assignmentId }).lean();
  return assignment?.paper || null;
}

export async function deleteAssignment(
  assignmentId: string,
  mongoEnabled: boolean,
) {
  if (!mongoEnabled) {
    logger.warn(`MongoDB disabled - skipping delete for ${assignmentId}`);
    return { deletedCount: 0, success: false, message: "MongoDB not enabled" };
  }

  try {
    const result = await AssignmentModel.deleteOne({ assignmentId });
    logger.warn(`Deleted assignment ${assignmentId}: ${result.deletedCount} document(s) removed from MongoDB`);
    return { deletedCount: result.deletedCount, success: result.deletedCount > 0, message: `Deleted ${result.deletedCount} document(s)` };
  } catch (error) {
    logger.error(`Failed to delete assignment ${assignmentId}: ${error}`);
    throw error;
  }
}
