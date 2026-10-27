import { describe, expect, it } from "vitest";
import { todayWeekday, WEEKDAYS } from "./weekdays";

describe("todayWeekday", () => {
  it("maps Monday to 0 and Sunday to 6", () => {
    expect(WEEKDAYS[todayWeekday(new Date(2026, 9, 26))]).toBe("Monday");
    expect(WEEKDAYS[todayWeekday(new Date(2026, 10, 1))]).toBe("Sunday");
  });
});
