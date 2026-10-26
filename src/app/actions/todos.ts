"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { firstError, todoTitleSchema, type FormState } from "@/lib/validation";

// Every action re-reads the session and scopes writes by userId,
// so a user can never touch another user's to-dos by guessing an id.

export async function createTodo(title: string): Promise<FormState> {
  const user = await getCurrentUser();
  const parsed = todoTitleSchema.safeParse(title);
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db.todo.create({ data: { userId: user.id, title: parsed.data } });
  refresh();
  return {};
}

export async function updateTodoTitle(id: string, title: string): Promise<FormState> {
  const user = await getCurrentUser();
  const parsed = todoTitleSchema.safeParse(title);
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db.todo.updateMany({ where: { id, userId: user.id }, data: { title: parsed.data } });
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
