"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { firstError, todoTitleSchema, weekdaySchema, type FormState } from "@/lib/validation";

// Every action re-reads the session and scopes writes by userId,
// so a user can never touch another user's to-dos by guessing an id.

export async function createTodo(title: string, weekday: number): Promise<FormState> {
  const user = await getCurrentUser();
  const parsedTitle = todoTitleSchema.safeParse(title);
  if (!parsedTitle.success) return { error: firstError(parsedTitle.error) };
  const parsedDay = weekdaySchema.safeParse(weekday);
  if (!parsedDay.success) return { error: firstError(parsedDay.error) };

  await db.todo.create({ data: { userId: user.id, title: parsedTitle.data, weekday: parsedDay.data } });
  refresh();
  return {};
}

export async function updateTodo(id: string, title: string, weekday: number): Promise<FormState> {
  const user = await getCurrentUser();
  const parsedTitle = todoTitleSchema.safeParse(title);
  if (!parsedTitle.success) return { error: firstError(parsedTitle.error) };
  const parsedDay = weekdaySchema.safeParse(weekday);
  if (!parsedDay.success) return { error: firstError(parsedDay.error) };

  await db.todo.updateMany({
    where: { id, userId: user.id },
    data: { title: parsedTitle.data, weekday: parsedDay.data },
  });
  refresh();
  return {};
}

export async function setTodoDone(id: string, done: boolean) {
  const user = await getCurrentUser();
  await db.todo.updateMany({ where: { id, userId: user.id }, data: { done } });
  refresh();
}

export async function deleteTodo(id: string) {
  const user = await getCurrentUser();
  await db.todo.deleteMany({ where: { id, userId: user.id } });
  refresh();
}
