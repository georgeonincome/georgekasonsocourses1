import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  enrollments,
  lessons,
  lessonProgress,
  topics,
} from "@/db/schema";

/**
 * POST /api/progress
 *
 * Body: { lessonId: number, completed: boolean }
 *
 * Marks a lesson complete for the signed-in learner and recomputes the
 * progress percentage on every course the learner is enrolled in. A course is
 * marked completed once its progress reaches 100.
 */
const handlers = {
  async POST(request: Request) {
    let body: { lessonId?: number; completed?: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const lessonId = Number(body?.lessonId);
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "lessonId must be a positive integer" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to record progress" },
        { status: 401 },
      );
    }

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
    });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (body?.completed !== false) {
      const existing = await db.query.lessonProgress.findFirst({
        where: and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.lessonId, lessonId),
        ),
      });
      if (!existing) {
        await db.insert(lessonProgress).values({
          userId,
          lessonId,
          completedAt: new Date(),
        });
      }
    }

    const topicRows = await db
      .select({ courseId: topics.courseId })
      .from(lessons)
      .innerJoin(topics, eq(lessons.topicId, topics.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);
    const lessonCourseId = topicRows[0]?.courseId ?? null;

    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, userId),
    });

    let progress = 0;

    for (const enrollment of userEnrollments) {
      const courseTopics = await db.query.topics.findMany({
        where: eq(topics.courseId, enrollment.courseId),
        columns: { id: true },
      });
      const topicIds = courseTopics.map((t) => t.id);
      if (!topicIds.length) continue;

      const courseLessons = await db.query.lessons.findMany({
        where: inArray(lessons.topicId, topicIds),
        columns: { id: true },
      });
      const lessonIds = courseLessons.map((l) => l.id);
      const total = lessonIds.length;
      if (!total) continue;

      const completedRows = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            inArray(lessonProgress.lessonId, lessonIds),
          ),
        );

      const percent = Math.round((completedRows.length / total) * 100);

      await db
        .update(enrollments)
        .set({
          progress: percent,
          status: percent >= 100 ? "completed" : "active",
          ...(percent >= 100 && !enrollment.completedAt
            ? { completedAt: new Date() }
            : {}),
        })
        .where(eq(enrollments.id, enrollment.id));

      if (enrollment.courseId === lessonCourseId) {
        progress = percent;
      }
    }

    return NextResponse.json({ progress });
  },
};

export const { POST } = handlers;
