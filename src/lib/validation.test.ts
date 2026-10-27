import { describe, expect, it } from "vitest";
import { registerSchema, resetPasswordSchema, todoTitleSchema, weekdaySchema } from "./validation";

describe("registerSchema", () => {
  it("normalizes email to lowercase and trims it", () => {
    const result = registerSchema.parse({ email: "  Ann@Example.COM ", password: "longenough" });
    expect(result.email).toBe("ann@example.com");
  });

  it("rejects short passwords", () => {
    expect(registerSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
  });

  it("rejects passwords over bcrypt's 72-byte limit", () => {
    expect(registerSchema.safeParse({ email: "a@b.co", password: "x".repeat(73) }).success).toBe(false);
  });

  it("rejects invalid emails", () => {
    expect(registerSchema.safeParse({ email: "not-an-email", password: "longenough" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires a token", () => {
    expect(resetPasswordSchema.safeParse({ token: "", password: "longenough" }).success).toBe(false);
  });
});

describe("todoTitleSchema", () => {
  it("trims titles", () => {
    expect(todoTitleSchema.parse("  buy milk  ")).toBe("buy milk");
  });

  it("rejects blank and overlong titles", () => {
    expect(todoTitleSchema.safeParse("   ").success).toBe(false);
    expect(todoTitleSchema.safeParse("x".repeat(201)).success).toBe(false);
  });
});

describe("weekdaySchema", () => {
  it("accepts 0 to 6, including form strings", () => {
    expect(weekdaySchema.parse("3")).toBe(3);
    expect(weekdaySchema.parse(0)).toBe(0);
    expect(weekdaySchema.parse(6)).toBe(6);
  });

  it("rejects anything outside the week", () => {
    expect(weekdaySchema.safeParse(7).success).toBe(false);
    expect(weekdaySchema.safeParse(-1).success).toBe(false);
    expect(weekdaySchema.safeParse(1.5).success).toBe(false);
    expect(weekdaySchema.safeParse("monday").success).toBe(false);
  });
});
