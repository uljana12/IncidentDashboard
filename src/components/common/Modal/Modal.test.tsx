import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  describe("Rendering", () => {
    it("renders nothing when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders modal when isOpen is true", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("renders title", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal Title">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText("Test Modal Title")).toBeInTheDocument();
    });

    it("renders children content", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Modal content here</p>
        </Modal>
      );

      expect(screen.getByText("Modal content here")).toBeInTheDocument();
    });

    it("renders close button", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByLabelText("Close modal"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when overlay is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      // Click on the overlay (role="presentation")
      const overlay = screen.getByRole("presentation");
      await user.click(overlay);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when Escape key is pressed", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not close when modal content is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      await user.click(screen.getByText("Content"));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has role dialog", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("has aria-modal attribute", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("has aria-labelledby pointing to title", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      const titleId = dialog.getAttribute("aria-labelledby");
      expect(titleId).toBeTruthy();
      expect(document.getElementById(titleId!)).toHaveTextContent("Test Modal");
    });
  });

  describe("Size variants", () => {
    it("renders with default size", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog.className).not.toContain("large");
    });

    it("renders with large size", () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test" size="large">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog.className).toContain("large");
    });
  });
});