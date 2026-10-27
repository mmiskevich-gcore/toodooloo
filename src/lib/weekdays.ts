// Index 0 is Monday, matching Todo.weekday in the schema
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

// JS Date counts from Sunday = 0, so shift it to Monday = 0
export function todayWeekday(date = new Date()): number {
  return (date.getDay() + 6) % 7;
}
