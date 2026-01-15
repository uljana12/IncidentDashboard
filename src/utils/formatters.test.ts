import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "./formatters";

describe("formatters", () => {
  describe("formatDate", () => {
    it("formats date string to readable format", () => {
      const result = formatDate("2026-01-15T10:30:00Z");
      expect(result).toBe("15 Jan 2026");
    });

    it("handles different months", () => {
      expect(formatDate("2026-06-20T00:00:00Z")).toBe("20 Jun 2026");
      expect(formatDate("2026-12-25T00:00:00Z")).toBe("25 Dec 2026");
    });

    it("handles single digit days", () => {
      const result = formatDate("2026-01-05T10:30:00Z");
      expect(result).toBe("5 Jan 2026");
    });
  });

  describe("formatDateTime", () => {
    it("formats date string with time", () => {
      const result = formatDateTime("2026-01-15T10:30:00Z");
      // Result depends on timezone, so we check the format
      expect(result).toMatch(/15 Jan 2026/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it("includes hours and minutes", () => {
      const result = formatDateTime("2026-01-15T14:45:00Z");
      expect(result).toContain(":");
    });
  });
});