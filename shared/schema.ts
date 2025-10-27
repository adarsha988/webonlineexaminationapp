import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

// Helper to generate UUID
const generateId = () => crypto.randomUUID();

export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(generateId),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("student"), // student, instructor, admin
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const exams = sqliteTable("exams", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  totalMarks: integer("total_marks").notNull(),
  status: text("status").notNull().default("draft"), // draft, active, completed
  instructorId: text("instructor_id").notNull(),
  assignedStudents: text("assigned_students", { mode: 'json' }).$type<string[]>().default([]),
  scheduledDate: integer("scheduled_date", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  examId: text("exam_id").notNull(),
  type: text("type").notNull(), // multiple_choice, true_false, short_answer
  text: text("text").notNull(),
  description: text("description"),
  options: text("options", { mode: 'json' }).$type<string[]>().default([]),
  correctAnswer: text("correct_answer"),
  sampleAnswers: text("sample_answers", { mode: 'json' }).$type<string[]>().default([]),
  points: integer("points").notNull().default(1),
  order: integer("order").notNull(),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey().notNull().$defaultFn(generateId),
  examId: text("exam_id").notNull(),
  studentId: text("student_id").notNull(),
  answers: text("answers", { mode: 'json' }).$type<Record<string, any>>().default({}),
  markedQuestions: text("marked_questions", { mode: 'json' }).$type<string[]>().default([]),
  startedAt: integer("started_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  submittedAt: integer("submitted_at", { mode: 'timestamp' }),
  timeRemaining: integer("time_remaining"), // in seconds
  score: integer("score"),
  grade: text("grade"),
  feedback: text("feedback", { mode: 'json' }).$type<Record<string, any>>().default({}), // per-question feedback
});

// Base schemas without validation
export const userBaseSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['student', 'instructor', 'admin']).default('student'),
});

export const examBaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1, 'Total marks must be at least 1'),
  status: z.enum(['draft', 'active', 'completed']).default('draft'),
  instructorId: z.string().uuid(),
  assignedStudents: z.array(z.string().uuid()).default([]),
  scheduledDate: z.date().optional(),
});

// Create insert schemas using drizzle-zod with our base schemas
export const insertUserSchema = userBaseSchema.pick({
  email: true,
  password: true,
  name: true,
  role: true,
});

export const insertExamSchema = examBaseSchema.pick({
  title: true,
  subject: true,
  description: true,
  duration: true,
  totalMarks: true,
  instructorId: true,
  scheduledDate: true,
});

// Define base schemas for questions and attempts
export const questionBaseSchema = z.object({
  examId: z.string().uuid(),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer', 'essay']),
  text: z.string().min(1, 'Question text is required'),
  description: z.string().optional(),
  options: z.array(z.string()).default([]),
  correctAnswer: z.string().optional(),
  sampleAnswers: z.array(z.string()).default([]),
  points: z.number().min(0).default(1),
  order: z.number().min(0),
});

export const attemptBaseSchema = z.object({
  examId: z.string().uuid(),
  studentId: z.string().uuid(),
  answers: z.record(z.any()).default({}),
  markedQuestions: z.array(z.string()).default([]),
  startedAt: z.date().default(() => new Date()),
  submittedAt: z.date().optional(),
  timeRemaining: z.number().optional(),
  score: z.number().optional(),
  grade: z.string().optional(),
  feedback: z.record(z.any()).default({}),
});

// Create insert schemas
export const insertQuestionSchema = questionBaseSchema.pick({
  examId: true,
  type: true,
  text: true,
  description: true,
  options: true,
  correctAnswer: true,
  sampleAnswers: true,
  points: true,
  order: true,
});

export const insertAttemptSchema = attemptBaseSchema.pick({
  examId: true,
  studentId: true,
});

// Database table types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = typeof exams.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = typeof attempts.$inferInsert;

// Form input types
export type UserFormData = z.infer<typeof userBaseSchema>;
export type ExamFormData = z.infer<typeof examBaseSchema>;
export type QuestionFormData = z.infer<typeof questionBaseSchema>;
export type AttemptFormData = z.infer<typeof attemptBaseSchema>;
