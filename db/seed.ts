import { db } from "@/lib/db";
import {
  announcements,
  assignments,
  categories,
  cohortSignups,
  cohorts,
  courseCategories,
  courses,
  enrollments,
  lessons,
  orderItems,
  orders,
  platformSettings,
  quizzes,
  quizQuestions,
  reviews,
  subscriptionPlans,
  topics,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import catalogueJson from "@/seed/catalogue.json";
import categoryJson from "@/seed/categories.json";
import reviewJson from "@/seed/reviews.json";

type SeedTopic = { title: string; lessons: string[] };
type SeedCourse = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  image: string | null;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  durationMinutes: number | null;
  sourceSlug: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  lessonCount?: number;
  curriculum?: SeedTopic[];
};
type SeedCategory = { slug: string; name: string; icon: string; position: number };
type SeedReview = {
  courseSlug: string | null;
  authorName: string;
  authorRole: string | null;
  rating: number;
  title: string | null;
  content: string;
  isFeatured: boolean;
};

const catalogue = catalogueJson as SeedCourse[];
const categoryList = categoryJson as SeedCategory[];
const reviewList = reviewJson as SeedReview[];

/**
 * Idempotent seed. Safe to re-run: every insert is keyed on a natural
 * identifier and existing rows are updated in place.
 */
async function main() {
  console.log("Seeding catalogue…");

  // ── categories ──────────────────────────────────────────────────────────
  const categoryIds = new Map<string, number>();
  for (const [index, c] of categoryList.entries()) {
    const existing = await db.query.categories.findFirst({
      where: (t, { eq: e }) => e(t.slug, c.slug),
    });
    if (existing) {
      await db
        .update(categories)
        .set({ name: c.name, icon: c.icon, position: index })
        .where(eq(categories.id, existing.id));
      categoryIds.set(c.slug, existing.id);
    } else {
      const [row] = await db
        .insert(categories)
        .values({
          slug: c.slug,
          name: c.name,
          icon: c.icon,
          position: index,
        })
        .returning();
      categoryIds.set(c.slug, row.id);
    }
  }
  console.log(`  categories: ${categoryIds.size}`);

  // ── courses ────────────────────────────────────────────────────────────
  let courseCount = 0;
  for (const entry of catalogue) {
    const existing = await db.query.courses.findFirst({
      where: (t, { eq: e }) => e(t.slug, entry.slug),
    });

    const values = {
      slug: entry.slug,
      title: entry.title,
      subtitle: entry.subtitle,
      description: entry.description,
      price: entry.price,
      compareAtPrice: entry.compareAtPrice,
      currency: entry.currency,
      image: entry.image,
      durationMinutes: entry.durationMinutes,
      level: entry.level,
      sourceSlug: entry.sourceSlug,
      isPublished: entry.isPublished,
      isFeatured: entry.isFeatured,
      enrollmentCount: entry.enrollmentCount,
      lessonCount:
        entry.lessonCount ??
        entry.curriculum?.reduce((n, t) => n + t.lessons.length, 0) ??
        0,
    };

    let courseId: number;
    if (existing) {
      await db.update(courses).set(values).where(eq(courses.id, existing.id));
      courseId = existing.id;
    } else {
      const [row] = await db.insert(courses).values(values).returning();
      courseId = row.id;
    }
    courseCount++;

    // category join
    const catId = categoryIds.get(entry.category);
    if (catId) {
      const link = await db.query.courseCategories.findFirst({
        where: (t, { and, eq: e }) =>
          and(e(t.courseId, courseId), e(t.categoryId, catId as number)),
      });
      if (!link) {
        await db.insert(courseCategories).values({ courseId, categoryId: catId });
      }
    }

    // curriculum
    if (entry.curriculum?.length) {
      const existingTopics = await db.query.topics.findMany({
        where: (t, { eq: e }) => e(t.courseId, courseId),
      });
      if (existingTopics.length === 0) {
        for (const [ti, topic] of entry.curriculum.entries()) {
          const [inserted] = await db
            .insert(topics)
            .values({ courseId, title: topic.title, position: ti })
            .returning();
          for (const [li, lessonTitle] of topic.lessons.entries()) {
            await db.insert(lessons).values({
              topicId: inserted.id,
              title: lessonTitle,
              slug: `${entry.slug}-${ti + 1}-${li + 1}`,
              position: li,
              isPreview: li === 0 && ti === 0,
            });
          }
        }
      }
    }
  }
  console.log(`  courses: ${courseCount}`);

  // ── reviews ────────────────────────────────────────────────────────────
  // The build script regenerates these rows, so clear the previous seed set
  // before inserting. Seed rows carry no user account and a name from the
  // seed list, so a real student submission is never touched here.
  const seedNames = reviewList.map((r) => r.authorName);
  await db.delete(reviews).where(
    and(isNull(reviews.userId), inArray(reviews.authorName, seedNames)),
  );

  for (const r of reviewList) {
    const course = r.courseSlug
      ? await db.query.courses.findFirst({
          where: (t, { eq: e }) => e(t.slug, r.courseSlug as string),
        })
      : undefined;
    const exists = course
      ? await db.query.reviews.findFirst({
          where: (t, { and, eq: e }) =>
            and(e(t.authorName, r.authorName), e(t.courseId, course.id)),
        })
      : await db.query.reviews.findFirst({
          where: (t, { and, eq: e, isNull: n }) =>
            and(e(t.authorName, r.authorName), n(t.courseId)),
        });
    if (!exists) {
      await db.insert(reviews).values({
        courseId: course?.id ?? null,
        authorName: r.authorName,
        authorRole: r.authorRole,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isApproved: true,
        isFeatured: r.isFeatured,
      });
    }
  }
  console.log(`  reviews: ${reviewList.length}`);

  // ── quiz + assignment on the flagship course ───────────────────────────
  const flagship = await db.query.courses.findFirst({
    where: (t, { eq: e }) => e(t.slug, "learn-to-earn"),
  });
  if (flagship) {
    const hasQuiz = await db.query.quizzes.findFirst({
      where: (t, { eq: e }) => e(t.courseId, flagship.id),
    });
    if (!hasQuiz) {
      const [quiz] = await db
        .insert(quizzes)
        .values({
          courseId: flagship.id,
          title: "Final Checkpoint",
          slug: "learn-to-earn-final-checkpoint",
          description:
            "Ten questions on positioning, offer-building and your first sale.",
          passingScore: 70,
        })
        .returning();
      const questions = [
        {
          question: "What is the first thing to build before you sell anything?",
          options: [
            "A website",
            "A clear offer for one specific person",
            "A social media page",
            "A product catalogue",
          ],
          correctIndex: 1,
          explanation:
            "A specific offer for a specific person makes everything after it easier.",
        },
        {
          question: "Where does money actually live, according to The $100 Guy?",
          options: [
            "In banks",
            "In jobs",
            "In people",
            "In investments",
          ],
          correctIndex: 2,
          explanation:
            "Money lives in people. Skills you already have are the capital you start with.",
        },
        {
          question: "What makes a skill valuable to a buyer?",
          options: [
            "How long you took to learn it",
            "That it solves a problem they already have",
            "That it is on your CV",
            "That it is certified",
          ],
          correctIndex: 1,
          explanation:
            "Buyers pay for outcomes. A skill becomes valuable when it is framed as a result.",
        },
        {
          question: "How many people do you need to serve in month one?",
          options: ["One", "Three", "Ten", "One hundred"],
          correctIndex: 0,
          explanation:
            "One paying client beats a thousand likes. Start with the first one.",
        },
        {
          question: "What should you do before a client calls?",
          options: [
            "Lower your price",
            "Agree to anything they ask",
            "Know their problem and propose the outcome",
            "Send a long proposal",
          ],
          correctIndex: 2,
          explanation:
            "Clarity on their problem lets you propose the outcome in their own words.",
        },
      ];
      for (const [i, q] of questions.entries()) {
        await db.insert(quizQuestions).values({
          quizId: quiz.id,
          question: q.question,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          position: i,
        });
      }
    }

    const hasAssignment = await db.query.assignments.findFirst({
      where: (t, { eq: e }) => e(t.courseId, flagship.id),
    });
    if (!hasAssignment) {
      await db.insert(assignments).values({
        courseId: flagship.id,
        title: "Publish your first offer",
        slug: "publish-your-first-offer",
        instructions:
          "Write one paragraph naming a person you can help, the problem you solve for them, and what they will have after working with you. Post it in the group and get two pieces of feedback.",
        dueInDays: 7,
      });
    }

    const hasAnnouncement = await db.query.announcements.findFirst({
      where: (t, { eq: e }) => e(t.courseId, flagship.id),
    });
    if (!hasAnnouncement) {
      await db.insert(announcements).values({
        courseId: flagship.id,
        title: "Welcome to Learn to Earn",
        body: "Start with Lesson 1. If you have questions, post them in the group — someone is usually awake.",
      });
    }
  }

  // ── admin account ──────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@learn2earn.online";
  const admin = await db.query.users.findFirst({
    where: (t, { eq: e }) => e(t.email, adminEmail),
  });
  if (!admin) {
    await db.insert(users).values({
      id: "admin",
      name: "George J. Kasonso",
      email: adminEmail,
      passwordHash: await hashPassword(
        process.env.ADMIN_PASSWORD ?? "ChangeMe123!",
      ),
      role: "admin",
    });
    console.log(`  admin created: ${adminEmail}`);
  }

  // ── membership plans ──────────────────────────────────────────────────
  // One payment, every course. Prices are indicative ZMW and must be
  // confirmed before the platform takes pubic money (see CUSTOMISE.md).
  const planSeed = [
    {
      code: "monthly",
      name: "1 month",
      durationDays: 30,
      price: 15000,
      description: "Try the library for one exam-season month.",
      features: JSON.stringify([
        "Every published course",
        "New courses while active",
        "Templates and resources",
        "Completion certificates",
      ]),
      isRecommended: false,
      sortOrder: 1,
    },
    {
      code: "quarterly",
      name: "4 months",
      durationDays: 120,
      price: 49700,
      compareAtPrice: 60000,
      description: "The plan most learners pick. Four months, every course.",
      features: JSON.stringify([
        "Every published course",
        "New courses while active",
        "Templates and resources",
        "Completion certificates",
      ]),
      isRecommended: true,
      sortOrder: 2,
    },
    {
      code: "annual",
      name: "12 months",
      durationDays: 365,
      price: 149700,
      compareAtPrice: 179400,
      badge: "Best value",
      description: "A full year of the whole catalogue, at more than half off.",
      features: JSON.stringify([
        "Every published course",
        "New courses while active",
        "Templates and resources",
        "Completion certificates",
      ]),
      isRecommended: false,
      sortOrder: 3,
    },
  ];
  for (const plan of planSeed) {
    await db
      .insert(subscriptionPlans)
      .values(plan)
      .onConflictDoUpdate({
        target: subscriptionPlans.code,
        set: plan,
      });
  }
  console.log("  membership plans: 3");

  // ── platform settings ─────────────────────────────────────────────────
  await db
    .insert(platformSettings)
    .values({
      category: "site",
      key: "announcement_bar",
      value: JSON.stringify({
        enabled: true,
        text: "New cohort: Virtual Assistance Masterclass — July enrolment open",
        href: "/cohorts",
        cta: "Reserve your seat →",
      }),
      description: "Top strip shown above the site navigation",
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [platformSettings.category, platformSettings.key],
      set: { updatedAt: new Date() },
    });
  console.log("  platform settings: announcement bar");

  // ── live cohorts ──────────────────────────────────────────────────────
  const cohortSeed = [
    {
      slug: "virtual-assistant-masterclass-jul-2026",
      title: "How to Become a Virtual Assistant — July 2026",
      description:
        "Ten live evenings with George. What a VA actually does for a Zambian client, the tools, the invoicing, and where the first client comes from. Not a webinar.",
      startDate: "2026-07-06",
      endDate: "2026-07-17",
      totalDays: 10,
      scheduleLabel: "Mon 6 – Fri 17 Jul · 7–8:30pm CAT",
      price: 35000,
      compareAtPrice: 45000,
      seats: 100,
      status: "upcoming" as const,
      sortOrder: 1,
    },
  ];
  for (const cohort of cohortSeed) {
    await db
      .insert(cohorts)
      .values(cohort)
      .onConflictDoUpdate({ target: cohorts.slug, set: cohort });
  }
  console.log("  cohorts: 1");

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
