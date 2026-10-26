import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { AddTodoForm, TodoItem } from "@/components/todo-list";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">toodooloo</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading your to-dos…</p>}>
        <Todos />
      </Suspense>
    </main>
  );
}

async function Todos() {
  const user = await getCurrentUser();
  const todos = await db.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, done: true },
  });
  const left = todos.filter((t) => !t.done).length;

  return (
    <>
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>{user.email}</span>
        <form action={logout}>
          <button className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Log out</button>
        </form>
      </div>
      <AddTodoForm />
      {todos.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">Nothing to do yet. Add your first to-do above.</p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-zinc-200 dark:divide-zinc-800">
            {todos.map((todo) => (
              <TodoItem key={`${todo.id}:${todo.title}`} todo={todo} />
            ))}
          </ul>
          <p className="mt-4 text-sm text-zinc-500">{left} left</p>
        </>
      )}
    </>
  );
}
