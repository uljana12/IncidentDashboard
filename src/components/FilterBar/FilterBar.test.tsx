import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "../../test/test-utils";
import { FilterBar, Filters } from "./FilterBar";

const defaultFilters: Filters = {
  search: "",
  status: "",
  severity: "",
  assigneeId: "",
};

describe("FilterBar", () => {
  describe("Rendering", () => {
    it("renders search input", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByLabelText("Search incidents by title")).toBeInTheDocument();
    });

    it("renders status filter", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByLabelText("Filter by status")).toBeInTheDocument();
    });

    it("renders severity filter", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByLabelText("Filter by severity")).toBeInTheDocument();
    });

    it("renders assignee filter", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByLabelText("Filter by assignee")).toBeInTheDocument();
    });

    it("does not show Clear button when no filters are applied", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.queryByLabelText("Clear all filters")).not.toBeInTheDocument();
    });

    it("shows Clear button when filters are applied", () => {
      const filtersWithSearch: Filters = { ...defaultFilters, search: "test" };
      renderWithProviders(
        <FilterBar filters={filtersWithSearch} onFiltersChange={() => {}} />
      );

      expect(screen.getByLabelText("Clear all filters")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onFiltersChange when search input changes", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={onFiltersChange} />
      );

      await user.type(screen.getByLabelText("Search incidents by title"), "test");

      expect(onFiltersChange).toHaveBeenCalled();
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: expect.stringContaining("t") })
      );
    });

    it("calls onFiltersChange when status filter changes", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={onFiltersChange} />
      );

      await user.selectOptions(screen.getByLabelText("Filter by status"), "Open");

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ status: "Open" })
      );
    });

    it("calls onFiltersChange when severity filter changes", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={onFiltersChange} />
      );

      await user.selectOptions(screen.getByLabelText("Filter by severity"), "Critical");

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "Critical" })
      );
    });

    it("clears all filters when Clear button is clicked", async () => {
      const user = userEvent.setup();
      const onFiltersChange = vi.fn();
      const filtersWithValues: Filters = {
        search: "test",
        status: "Open",
        severity: "High",
        assigneeId: "user-1",
      };
      renderWithProviders(
        <FilterBar filters={filtersWithValues} onFiltersChange={onFiltersChange} />
      );

      await user.click(screen.getByLabelText("Clear all filters"));

      expect(onFiltersChange).toHaveBeenCalledWith({
        search: "",
        status: "",
        severity: "",
        assigneeId: "",
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper role for search", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("has aria-label on filter bar", () => {
      renderWithProviders(
        <FilterBar filters={defaultFilters} onFiltersChange={() => {}} />
      );

      expect(screen.getByRole("search")).toHaveAttribute("aria-label", "Filter incidents");
    });
  });
});