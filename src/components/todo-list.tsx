"use client";

import { useOptimistic, useState, useTransition, type FormEvent } from "react";
import { createTodo, deleteTodo, setTodoDone, updateTodoTitle } from "@/app/actions/todos";
import { buttonClass, FormMessage, inputClass } from "./ui";

export type TodoView = { id: string; title: string; done: boolean };

export function AddTodoForm() {
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  // Clear the input as soon as the user submits so they can keep typing the
  // next to-do while this one saves. Put the text back if the save fails.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("title") as HTMLInputElement;
    const title = input.value;
    form.reset();
    startTransition(async () => {
      const result = await createTodo(title);
      setError(result?.error);
      if (result?.error && !input.value) input.value = title;
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input name="title" placeholder="What needs doing?" maxLength={200} required aria-label="New to-do" className={inputClass} />
        <button className={buttonClass}>Add</button>
      </div>
      <FormMessage error={error} />
    </form>
  );
}

export function TodoItem({ todo }: { todo: TodoView }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const [done, setOptimisticDone] = useOptimistic(todo.done);

  function toggle(checked: boolean) {
    startTransition(async () => {
      setOptimisticDone(checked);
      await setTodoDone(todo.id, checked);
    });
  }

  function save() {
    startTransition(async () => {
      const result = await updateTodoTitle(todo.id, draft);
      if (result?.error) return setError(result.error);
      setError(undefined);
      setEditing(false);
    });
  }

  return (
    <li className={`flex flex-col gap-1 py-2 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={done}
          aria-label={`Mark "${todo.title}" as ${done ? "not done" : "done"}`}
          onChange={(e) => toggle(e.target.checked)}
          className="size-4 accent-zinc-900 dark:accent-zinc-100"
        />
        {editing ? (
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              autoFocus
              value={draft}
              maxLength={200}
              aria-label="Edit to-do"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && (setEditing(false), setDraft(todo.title))}
              className={inputClass}
            />
            <button className="text-sm font-medium">Save</button>
          </form>
        ) : (
          <span className={`flex-1 text-sm ${done ? "text-zinc-400 line-through" : ""}`}>{todo.title}</span>
        )}
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Edit
          </button>
        )}
        <button
          onClick={() => startTransition(() => deleteTodo(todo.id))}
          aria-label={`Delete "${todo.title}"`}
          className="text-sm text-zinc-500 hover:text-red-600"
        >
          Delete
        </button>
      </div>
      <FormMessage error={error} />
    </li>
  );
}
