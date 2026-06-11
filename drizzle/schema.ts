import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing poses
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  unsplashKeyword: varchar("unsplashKeyword", { length: 100 }),
  poseCount: int("poseCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Poses table - the core content
 */
export const poses = mysqlTable("poses", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  difficulty: mysqlEnum("difficulty", ["Beginner", "Easy", "Intermediate", "Pro"]).notNull(),
  occasion: varchar("occasion", { length: 100 }),
  people: mysqlEnum("people", ["Solo", "Couple", "Group"]).notNull(),
  cameraAngle: varchar("cameraAngle", { length: 100 }),
  lighting: varchar("lighting", { length: 100 }),
  bodyPosition: text("bodyPosition"),
  equipmentNeeded: text("equipmentNeeded"),
  tags: json("tags"),
  steps: json("steps"),
  cameraSettings: json("cameraSettings"),
  matchScore: decimal("matchScore", { precision: 3, scale: 1 }).default("0"),
  views: int("views").default(0).notNull(),
  saves: int("saves").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Pose = typeof poses.$inferSelect;
export type InsertPose = typeof poses.$inferInsert;

/**
 * Mood Boards table - user collections
 */
export const moodBoards = mysqlTable("moodBoards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  poseIds: json("poseIds"),
  isPublic: boolean("isPublic").default(false).notNull(),
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MoodBoard = typeof moodBoards.$inferSelect;
export type InsertMoodBoard = typeof moodBoards.$inferInsert;

/**
 * Saved Poses - user's saved individual poses
 */
export const savedPoses = mysqlTable("savedPoses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  poseId: int("poseId").notNull(),
  savedAt: timestamp("savedAt").defaultNow().notNull(),
});

export type SavedPose = typeof savedPoses.$inferSelect;
export type InsertSavedPose = typeof savedPoses.$inferInsert;

/**
 * AI Recommendations history - for analytics
 */
export const aiRecommendations = mysqlTable("aiRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  occasion: varchar("occasion", { length: 100 }),
  location: varchar("location", { length: 100 }),
  people: varchar("people", { length: 100 }),
  style: varchar("style", { length: 100 }),
  experience: varchar("experience", { length: 100 }),
  timeOfDay: varchar("timeOfDay", { length: 100 }),
  recommendedPoseIds: json("recommendedPoseIds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;
