import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "../../test/test-utils";
import { IncidentDetail } from "./IncidentDetail";
import type { Incident } from "../../api/types";

const mockIncident: Incident = {
  id: "inc-1",
  title: "Test Incident",
  description: "This is a test incident description",
  status: "Open",
  severity: "High",
  assigneeId: "user-1",
  createdAt: "2026-01-10T10:00:00Z",
  updatedAt: "2026-01-10T12:00:00Z",
  statusHistory: [
    {
      status: "Open",
      changedAt: "2026-01-10T10:00:00Z",
      changedBy: "user-2",
    },
  ],
};

describe("IncidentDetail", () => {
  describe("Rendering", () => {
    it("renders incident status and severity badges", () => {
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      // Status and severity text may appear multiple times (badge + details section + history)
      expect(screen.getAllByText("Open").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("High").length).toBeGreaterThanOrEqual(1);
    });

    it("renders incident description", () => {
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      expect(screen.getByText("This is a test incident description")).toBeInTheDocument();
    });

    it("renders incident details section", () => {
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Assignee")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });

    it("renders status history", () => {
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      expect(screen.getByText("Status History")).toBeInTheDocument();
    });

    it("renders Close and Edit buttons", () => {
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edit Incident" })).toBeInTheDocument();
    });

    it("displays 'No description provided' when description is empty", () => {
      const incidentWithoutDescription = { ...mockIncident, description: "" };
      renderWithProviders(<IncidentDetail incident={incidentWithoutDescription} onClose={() => {}} />);

      expect(screen.getByText("No description provided.")).toBeInTheDocument();
    });

    it("displays 'Unassigned' when no assignee", () => {
      const unassignedIncident = { ...mockIncident, assigneeId: null };
      renderWithProviders(<IncidentDetail incident={unassignedIncident} onClose={() => {}} />);

      expect(screen.getByText("Unassigned")).toBeInTheDocument();
    });
  });

  describe("Edit mode", () => {
    it("shows edit form when Edit button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Edit Incident" }));

      expect(screen.getByText("Update Incident")).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Assignee")).toBeInTheDocument();
    });

    it("shows Save and Cancel buttons in edit mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Edit Incident" }));

      expect(screen.getByRole("button", { name: "Save Changes" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("cancels edit mode when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Edit Incident" }));
      expect(screen.getByText("Update Incident")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByText("Update Incident")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Edit Incident" })).toBeInTheDocument();
    });

    it("pre-fills current status in edit form", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Edit Incident" }));

      const statusSelect = screen.getByLabelText("Status") as HTMLSelectElement;
      expect(statusSelect.value).toBe("Open");
    });
  });

  describe("Close", () => {
    it("calls onClose when Close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      renderWithProviders(<IncidentDetail incident={mockIncident} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});