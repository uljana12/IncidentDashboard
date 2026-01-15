import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "../../test/test-utils";
import { IncidentList } from "./IncidentList";

describe("IncidentList", () => {
  describe("Rendering", () => {
    it("shows loading state initially", () => {
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);
      expect(screen.getByText("Loading incidents...")).toBeInTheDocument();
    });

    it("renders incidents after loading", async () => {
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      expect(screen.getByText("Payment gateway error")).toBeInTheDocument();
      expect(screen.getByText("Dashboard loading slowly")).toBeInTheDocument();
      expect(screen.getByText("Email notifications delayed")).toBeInTheDocument();
    });

    it("renders table headers", async () => {
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Severity")).toBeInTheDocument();
      expect(screen.getByText("Assignee")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
    });

    it("displays status badges correctly", async () => {
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      // Multiple incidents may have same status, so use getAllByText
      expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
      expect(screen.getAllByText(/In Progress/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText("Resolved").length).toBeGreaterThan(0);
    });

    it("displays severity badges correctly", async () => {
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      // Check that severity badges are present (may have duplicates)
      expect(screen.getAllByText("Critical").length).toBeGreaterThan(0);
      expect(screen.getAllByText("High").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Medium").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Low").length).toBeGreaterThan(0);
    });
  });

  describe("Filtering", () => {
    it("filters by search text", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText("Search incidents by title");
      await user.type(searchInput, "Payment");

      await waitFor(() => {
        expect(screen.queryByText("Database connection timeout")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Payment gateway error")).toBeInTheDocument();
    });

    it("filters by status", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      const statusFilter = screen.getByLabelText("Filter by status");
      await user.selectOptions(statusFilter, "Resolved");

      await waitFor(() => {
        expect(screen.queryByText("Database connection timeout")).not.toBeInTheDocument();
      });
      // "Email notifications delayed" is the only Resolved incident
      expect(screen.getByText("Email notifications delayed")).toBeInTheDocument();
    });

    it("filters by severity", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      const severityFilter = screen.getByLabelText("Filter by severity");
      await user.selectOptions(severityFilter, "Critical");

      await waitFor(() => {
        expect(screen.queryByText("Database connection timeout")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Payment gateway error")).toBeInTheDocument();
    });

    it("filters by assignee", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      const assigneeFilter = screen.getByLabelText("Filter by assignee");
      await user.selectOptions(assigneeFilter, "unassigned");

      await waitFor(() => {
        expect(screen.queryByText("Database connection timeout")).not.toBeInTheDocument();
      });
      // "Dashboard loading slowly" is the only unassigned incident (assigneeId: null)
      expect(screen.getByText("Dashboard loading slowly")).toBeInTheDocument();
    });

    it("shows empty state when no incidents match filters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      const searchInput = screen.getByLabelText("Search incidents by title");
      await user.type(searchInput, "nonexistent incident xyz123");

      await waitFor(() => {
        expect(screen.getByText("No incidents found matching your filters.")).toBeInTheDocument();
      });
    });

    it("clears all filters when Clear button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentList onSelectIncident={() => {}} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      // Apply a filter
      const searchInput = screen.getByLabelText("Search incidents by title");
      await user.type(searchInput, "Payment");

      await waitFor(() => {
        expect(screen.queryByText("Database connection timeout")).not.toBeInTheDocument();
      });

      // Clear filters
      await user.click(screen.getByLabelText("Clear all filters"));

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });
    });
  });

  describe("Selection", () => {
    it("calls onSelectIncident when row is clicked", async () => {
      const user = userEvent.setup();
      const onSelectIncident = vi.fn();
      renderWithProviders(<IncidentList onSelectIncident={onSelectIncident} />);

      await waitFor(() => {
        expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Database connection timeout"));

      expect(onSelectIncident).toHaveBeenCalledTimes(1);
      expect(onSelectIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Database connection timeout",
          status: "Open",
          severity: "High",
        })
      );
    });
  });
});