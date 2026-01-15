import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("renders the app title", async () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Team Incident Dashboard" })
    ).toBeInTheDocument();
  });

  it("renders the New Incident button", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: "+ New Incident" })
    ).toBeInTheDocument();
  });

  it("opens create incident modal when button is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ New Incident" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Incident")).toBeInTheDocument();
  });

  it("closes create modal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "+ New Incident" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("loads and displays incidents from API", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
    });
    expect(screen.getByText("Payment gateway error")).toBeInTheDocument();
  });

  it("opens incident detail modal when incident is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Database connection timeout")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Database connection timeout"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Description")).toBeInTheDocument();
  });
});
