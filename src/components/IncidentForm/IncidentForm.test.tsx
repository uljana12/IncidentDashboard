import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "../../test/test-utils";
import { IncidentForm } from "./IncidentForm";

describe("IncidentForm", () => {
  describe("Rendering", () => {
    it("renders all form fields", () => {
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Severity")).toBeInTheDocument();
      expect(screen.getByLabelText("Assignee")).toBeInTheDocument();
    });

    it("renders submit and cancel buttons", () => {
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      expect(screen.getByRole("button", { name: "Create Incident" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("renders severity options", () => {
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      const severitySelect = screen.getByLabelText("Severity");
      expect(severitySelect).toContainHTML("Critical");
      expect(severitySelect).toContainHTML("High");
      expect(severitySelect).toContainHTML("Medium");
      expect(severitySelect).toContainHTML("Low");
    });

    it("loads assignee options from API", async () => {
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await waitFor(() => {
        const assigneeSelect = screen.getByLabelText("Assignee");
        expect(assigneeSelect).toContainHTML("Alice Johnson");
        expect(assigneeSelect).toContainHTML("Bob Smith");
      });
    });
  });

  describe("Validation", () => {
    it("shows error when title is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });
    });

    it("shows error when title is too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.type(screen.getByLabelText("Title"), "AB");
      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Title must be at least 3 characters")).toBeInTheDocument();
      });
    });

    it("shows error when description is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Description is required")).toBeInTheDocument();
      });
    });

    it("shows error when description is too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.type(screen.getByLabelText("Title"), "Valid Title");
      await user.type(screen.getByLabelText("Description"), "Short");
      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Description must be at least 10 characters")).toBeInTheDocument();
      });
    });

    it("shows error when severity is not selected", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Severity is required")).toBeInTheDocument();
      });
    });

    it("shows all validation errors at once", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
        expect(screen.getByText("Severity is required")).toBeInTheDocument();
      });
    });

    it("clears validation errors when valid input is provided", async () => {
      const user = userEvent.setup();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={() => {}} />);

      // Submit to trigger errors
      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.getByText("Title is required")).toBeInTheDocument();
      });

      // Fill in valid data and submit again
      await user.type(screen.getByLabelText("Title"), "Valid incident title");
      await user.type(screen.getByLabelText("Description"), "This is a valid description for the incident");
      await user.selectOptions(screen.getByLabelText("Severity"), "High");

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
        expect(screen.queryByText("Description is required")).not.toBeInTheDocument();
        expect(screen.queryByText("Severity is required")).not.toBeInTheDocument();
      });
    });
  });

  describe("Submission", () => {
    it("calls onSuccess when form is submitted successfully", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderWithProviders(<IncidentForm onSuccess={onSuccess} onCancel={() => {}} />);

      await user.type(screen.getByLabelText("Title"), "New test incident");
      await user.type(screen.getByLabelText("Description"), "This is a detailed description of the test incident");
      await user.selectOptions(screen.getByLabelText("Severity"), "High");

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it("resets form after successful submission", async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      renderWithProviders(<IncidentForm onSuccess={onSuccess} onCancel={() => {}} />);

      await user.type(screen.getByLabelText("Title"), "New test incident");
      await user.type(screen.getByLabelText("Description"), "This is a detailed description of the test incident");
      await user.selectOptions(screen.getByLabelText("Severity"), "High");

      await user.click(screen.getByRole("button", { name: "Create Incident" }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });

      // Form should be ready for next submission
      expect(screen.getByRole("button", { name: "Create Incident" })).toBeInTheDocument();
    });
  });

  describe("Cancel", () => {
    it("calls onCancel when Cancel button is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not validate when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      renderWithProviders(<IncidentForm onSuccess={() => {}} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
    });
  });
});