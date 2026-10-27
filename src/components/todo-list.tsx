"use client";

import { useEffect, useOptimistic, useRef, useState, useTransition, type FormEvent } from "react";
import { createTodo, deleteTodo, setTodoDone, updateTodo } from "@/app/actions/todos";
import { todayWeekday, WEEKDAYS } from "@/lib/weekdays";
import { buttonClass, FormMessage, inputClass } from "./ui";

export type TodoView = { id: string; title: string; done: boolean; weekday: number };

const selectClass = `${inputClass} w-auto`;

function DaySelect(props: React.ComponentProps<"select">) {
  return (
    <select {...props} className={selectClass}>
      {WEEKDAYS.map((day, i) => (
        <option key={day} value={i}>
          {day}
        </option>
      ))}
    </select>
  );
}

export function AddTodoForm() {
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();
  const daySelect = useRef<HTMLSelectElement>(null);

  // Start on today. Set after mount because the server doesn't know the visitor's timezone.
  useEffect(() => {
    if (daySelect.current) daySelect.current.value = String(todayWeekday());
  }, []);

  // Clear the input as soon as the user submits so they can keep typing the
  // next to-do while this one saves. The chosen day stays, so adding several
  // tasks to one day is quick. Put the text back if the save fails.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("title") as HTMLInputElement;
    const title = input.value;
    const weekday = Number(daySelect.current?.value ?? 0);
    input.value = "";
    startTransition(async () => {
      const result = await createTodo(title, weekday);
      setError(result?.error);
      if (result?.error && !input.value) input.value = title;
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input name="title" placeholder="What needs doing?" maxLength={200} required aria-label="New to-do" className={inputClass} />
        <DaySelect ref={daySelect} name="weekday" aria-label="Day" defaultValue="0" />
        <button className={buttonClass}>Add</button>
      </div>
      <FormMessage error={error} />
    </form>
  );
}

export function WeekList({ todos }: { todos: TodoView[] }) {
  return (
    <div className="mt-6 flex flex-col gap-6">
      {WEEKDAYS.map((day, i) => {
        const dayTodos = todos.filter((t) => t.weekday === i);
        if (dayTodos.length === 0) return null;
        return (
          <section key={day} aria-labelledby={`day-${i}`}>
            <h2 id={`day-${i}`} className="mb-1 text-sm font-semibold text-zinc-500 uppercase tracking-wide">
              {day}
            </h2>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {dayTodos.map((todo) => (
                <TodoItem key={`${todo.id}:${todo.title}:${todo.weekday}`} todo={todo} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function TodoItem({ todo }: { todo: TodoView }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [draftDay, setDraftDay] = useState(todo.weekday);
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
      const result = await updateTodo(todo.id, draft, draftDay);
      if (result?.error) return setError(result.error);
      setError(undefined);
      setEditing(false);
    });
  }

  function cancel() {
    setEditing(false);
    setDraft(todo.title);
    setDraftDay(todo.weekday);
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
            onKeyDown={(e) => e.key === "Escape" && cancel()}
          >
            <input
              autoFocus
              value={draft}
              maxLength={200}
              aria-label="Edit to-do"
              onChange={(e) => setDraft(e.target.value)}
              className={inputClass}
            />
            <DaySelect aria-label="Edit day" value={draftDay} onChange={(e) => setDraftDay(Number(e.target.value))} />
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
