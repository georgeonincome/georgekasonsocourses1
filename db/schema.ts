import { relations, sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* ═══════════════════════════════════════════════════════════════════════════
   Auth.js tables
   ═══════════════════════════════════════════════════════════════════════════ */

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").notNull(),
    emailVerified: integer("email_verified", { mode: "timestamp" }),
    image: text("image"),
    passwordHash: text("password_hash"),
    role: text("role", { enum: ["student", "instructor", "admin"] })
      .notNull()
      .default("student"),
    phone: text("phone"),
    bio: text("bio"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* ═══════════════════════════════════════════════════════════════════════════
   Catalogue
   ═══════════════════════════════════════════════════════════════════════════ */

export const courses = sqliteTable(
  "courses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    /** Price in minor units (cents of the currency) to avoid float drift. */
    price: integer("price").notNull().default(0),
    compareAtPrice: integer("compare_at_price"),
    currency: text("currency").notNull().default("ZMW"),
    image: text("image"),
    /** URL of a recorded masterclass, or a playlist id. */
    videoUrl: text("video_url"),
    durationMinutes: integer("duration_minutes"),
    level: text("level", {
      enum: ["beginner", "intermediate", "advanced", "all-levels"],
    })
      .notNull()
      .default("all-levels"),
    /** Slug of the matching WooCommerce product on the original site. */
    sourceSlug: text("source_slug"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    enrollmentCount: integer("enrollment_count").notNull().default(0),
    lessonCount: integer("lesson_count").notNull().default(0),
    ratingSum: integer("rating_sum").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("courses_slug_idx").on(t.slug)],
);

export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"),
    position: integer("position").notNull().default(0),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const courseCategories = sqliteTable(
  "course_categories",
  {
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.courseId, t.categoryId] })],
);

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
});

export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topicId: integer("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content"),
  /** Recorded lesson media. */
  videoUrl: text("video_url"),
  durationMinutes: integer("duration_minutes"),
  isPreview: integer("is_preview", { mode: "boolean" }).notNull().default(false),
  position: integer("position").notNull().default(0),
});

/* ═══════════════════════════════════════════════════════════════════════════
   Commerce
   ═══════════════════════════════════════════════════════════════════════════ */

/** What the receipt is for. "course" = per-course checkout, "membership" = a
 *  Learn2Earn access plan that unlocks every published course. */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  kind: text("kind", { enum: ["course", "membership", "cohort"] })
    .notNull()
    .default("course"),
  /** Plan code alongside a membership order, or product slug of a cohort. */
  productSlug: text("product_slug"),
  /** Buyer phone captured at checkout for mobile-money reconciliation. */
  phone: text("phone"),
  status: text("status", {
    enum: ["pending", "paid", "failed", "refunded", "cancelled"],
  })
    .notNull()
    .default("pending"),
  /** IntaSend / gateway payment reference. */
  paymentReference: text("payment_reference"),
  paymentProvider: text("payment_provider").default("intasend"),
  total: integer("total").notNull().default(0),
  currency: text("currency").notNull().default("ZMW"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  price: integer("price").notNull(),
  title: text("title").notNull(),
});

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: integer("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
    status: text("status", {
      enum: ["active", "completed", "cancelled"],
    })
      .notNull()
      .default("active"),
    progress: integer("progress").notNull().default(0),
    enrolledAt: integer("enrolled_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer("completed_at", { mode: "timestamp" }),
  },
  (t) => [uniqueIndex("enrollments_user_course_idx").on(t.userId, t.courseId)],
);

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: integer("completed_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("lesson_progress_user_lesson_idx").on(t.userId, t.lessonId)],
);

/* ═══════════════════════════════════════════════════════════════════════════
   Assessment
   ═══════════════════════════════════════════════════════════════════════════ */

export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").notNull().default(70),
  position: integer("position").notNull().default(0),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  /** JSON array of answer option strings. */
  options: text("options").notNull().default("[]"),
  /** Index into `options` of the correct answer. */
  correctIndex: integer("correct_index").notNull().default(0),
  explanation: text("explanation"),
  position: integer("position").notNull().default(0),
});

export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull().default(0),
  total: integer("total").notNull().default(0),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const assignments = sqliteTable("assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  instructions: text("instructions"),
  dueInDays: integer("due_in_days"),
});

export const assignmentSubmissions = sqliteTable("assignment_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assignmentId: integer("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  fileUrl: text("file_url"),
  status: text("status", { enum: ["submitted", "graded"] })
    .notNull()
    .default("submitted"),
  grade: integer("grade"),
  feedback: text("feedback"),
  submittedAt: integer("submitted_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const certificates = sqliteTable("certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  reference: text("reference").notNull(),
  issuedAt: integer("issued_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/* ═══════════════════════════════════════════════════════════════════════════
   Social proof
   ═══════════════════════════════════════════════════════════════════════════ */

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    authorAvatar: text("author_avatar"),
    /** Optional "Digital Marketer, Lusaka" style line under the name. */
    authorRole: text("author_role"),
    rating: integer("rating").notNull().default(5),
    title: text("title"),
    content: text("content").notNull(),
    isApproved: integer("is_approved", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    /**
     * Retained for compatibility with existing databases. No review is
     * written as a layout placeholder any more, so this stays false.
     */
    isPlaceholder: integer("is_placeholder", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("reviews_course_user_idx").on(t.courseId, t.userId)],
);

export const announcements = sqliteTable("announcements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/* ═══════════════════════════════════════════════════════════════════════════
   Membership — the Click2Skill model, for Zambia
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * One payment for a period, every course unlocked. Indicative ZMW prices are
 * seeded; confirm the real figures before the site takes public money.
 */
export const subscriptionPlans = sqliteTable(
  "subscription_plans",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** stable slug — monthly, quarterly, annual */
    code: text("code").notNull(),
    name: text("name").notNull(),
    /** Access length in days. */
    durationDays: integer("duration_days").notNull(),
    /** ZMW minor units (ngwee). */
    price: integer("price").notNull(),
    /** Optional "was" price for the badge — minor units. */
    compareAtPrice: integer("compare_at_price"),
    badge: text("badge"),
    description: text("description"),
    features: text("features").notNull().default("[]"),
    isRecommended: integer("is_recommended", { mode: "boolean" })
      .notNull()
      .default(false),
    isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("subscription_plans_code_idx").on(t.code)],
);

/**
 * The access record itself. Renewal adds days on top — earlier periods are
 * never eaten by switching to a longer plan.
 */
export const subscriptions = sqliteTable("subscriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planCode: text("plan_code").notNull(),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["active", "ended", "cancelled"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/* ═══════════════════════════════════════════════════════════════════════════
   Platform settings — the announcement bar and other site switches
   ═══════════════════════════════════════════════════════════════════════════ */

/** key → JSON value, edited from /admin. The announcement bar lives here. */
export const platformSettings = sqliteTable(
  "platform_settings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    category: text("category").notNull().default("site"),
    key: text("key").notNull(),
    /** JSON-encoded value. */
    value: text("value").notNull().default("{}"),
    description: text("description"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("platform_settings_key_idx").on(t.category, t.key)],
);

/* ═══════════════════════════════════════════════════════════════════════════
   Live cohorts — the classes the paying behaviour actually comes from
   ═══════════════════════════════════════════════════════════════════════════ */

export const cohorts = sqliteTable(
  "cohorts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    startDate: text("start_date"), // yyyy-mm-dd
    endDate: text("end_date"),
    totalDays: integer("total_days"),
    /** KES-style schedule line: "Mon 2 – Fri 6 Nov · 7–8:30pm CAT". */
    scheduleLabel: text("schedule_label"),
    /** ZMW minor units; null = free / bundled in a membership. */
    price: integer("price"),
    compareAtPrice: integer("compare_at_price"),
    seats: integer("seats"),
    whatsappGroupLink: text("whatsapp_group_link"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(true),
    status: text("status", { enum: ["upcoming", "active", "completed"] })
      .notNull()
      .default("upcoming"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex("cohorts_slug_idx").on(t.slug)],
);

/** "Reserve your seat" form results — a lead with money attached. */
export const cohortSignups = sqliteTable("cohort_signups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cohortId: integer("cohort_id")
    .notNull()
    .references(() => cohorts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/* ═══════════════════════════════════════════════════════════════════════════
   Relations
   ═══════════════════════════════════════════════════════════════════════════ */

export const coursesRelations = relations(courses, ({ many, one }) => ({
  topics: many(topics),
  enrollments: many(enrollments),
  quizzes: many(quizzes),
  assignments: many(assignments),
  reviews: many(reviews),
  courseCategories: many(courseCategories),
}));

export const topicsRelations = relations(topics, ({ many, one }) => ({
  course: one(courses, {
    fields: [topics.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, { fields: [lessons.topicId], references: [topics.id] }),
  progress: many(lessonProgress),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  courseCategories: many(courseCategories),
}));

export const courseCategoriesRelations = relations(courseCategories, ({ one }) => ({
  course: one(courses, {
    fields: [courseCategories.courseId],
    references: [courses.id],
  }),
  category: one(categories, {
    fields: [courseCategories.categoryId],
    references: [categories.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  course: one(courses, { fields: [reviews.courseId], references: [courses.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const quizzesRelations = relations(quizzes, ({ many, one }) => ({
  course: one(courses, { fields: [quizzes.courseId], references: [courses.id] }),
  questions: many(quizQuestions),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  course: one(courses, {
    fields: [orderItems.courseId],
    references: [courses.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  reviews: many(reviews),
  certificates: many(certificates),
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  order: one(orders, {
    fields: [subscriptions.orderId],
    references: [orders.id],
  }),
}));

export const cohortsRelations = relations(cohorts, ({ many }) => ({
  signups: many(cohortSignups),
}));

export const cohortSignupsRelations = relations(cohortSignups, ({ one }) => ({
  cohort: one(cohorts, {
    fields: [cohortSignups.cohortId],
    references: [cohorts.id],
  }),
}));


export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type User = typeof users.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Cohort = typeof cohorts.$inferSelect;
export type CohortSignup = typeof cohortSignups.$inferSelect;
