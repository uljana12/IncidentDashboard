import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  describe("Status badges", () => {
    it("renders Open status badge", () => {
      render(<Badge status="Open" />);
      expect(screen.getByText("Open")).toBeInTheDocument();
    });

    it("renders In Progress status badge", () => {
      render(<Badge status="In Progress" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("renders Resolved status badge", () => {
      render(<Badge status="Resolved" />);
      expect(screen.getByText("Resolved")).toBeInTheDocument();
    });
  });

  describe("Severity badges", () => {
    it("renders Critical severity badge", () => {
      render(<Badge severity="Critical" />);
      expect(screen.getByText("Critical")).toBeInTheDocument();
    });

    it("renders High severity badge", () => {
      render(<Badge severity="High" />);
      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("renders Medium severity badge", () => {
      render(<Badge severity="Medium" />);
      expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("renders Low severity badge", () => {
      render(<Badge severity="Low" />);
      expect(screen.getByText("Low")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("returns null when no props are provided", () => {
      const { container } = render(<Badge />);
      expect(container.firstChild).toBeNull();
    });

    it("prioritizes status over severity when both are provided", () => {
      render(<Badge status="Open" severity="Critical" />);
      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.queryByText("Critical")).not.toBeInTheDocument();
    });
  });
});