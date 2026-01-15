/**
 * Form component for creating new incidents.
 * Includes client-side validation and error handling.
 */

import { useState, FormEvent } from "react";
import { useUsers, useCreateIncident } from "../../hooks";
import { Button, Input, Textarea, Select } from "../common";
import { SEVERITY_OPTIONS_WITH_PLACEHOLDER } from "../../utils/constants";
import type { IncidentSeverity, CreateIncidentInput } from "../../api/types";
import styles from "./IncidentForm.module.css";

interface IncidentFormProps {
  /** Callback fired after successful incident creation */
  onSuccess: () => void;
  /** Callback fired when user clicks Cancel */
  onCancel: () => void;
}

/**
 * Validation error messages for form fields.
 */
interface FormErrors {
  title?: string;
  description?: string;
  severity?: string;
}

/**
 * A form for creating new incidents with validation.
 *
 * Validation rules:
 * - Title: Required, minimum 3 characters
 * - Description: Required, minimum 10 characters
 * - Severity: Required (must select one)
 * - Assignee: Optional
 */
export function IncidentForm({ onSuccess, onCancel }: IncidentFormProps) {
  const { data: users, isLoading: usersLoading } = useUsers();
  const createMutation = useCreateIncident();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<IncidentSeverity | "">("");
  const [assigneeId, setAssigneeId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Build assignee options with "Unassigned" as first option
  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...(users?.map((u) => ({ value: u.id, label: u.name })) || []),
  ];

  /**
   * Validates all form fields and updates error state.
   * @returns true if all fields are valid
   */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!severity) {
      newErrors.severity = "Severity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission.
   * Validates input, creates incident via API, and resets form on success.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const input: CreateIncidentInput = {
      title: title.trim(),
      description: description.trim(),
      severity: severity as IncidentSeverity,
      assigneeId: assigneeId || null,
    };

    try {
      await createMutation.mutateAsync(input);
      // Reset form before closing
      setTitle("");
      setDescription("");
      setSeverity("");
      setAssigneeId("");
      setErrors({});
      onSuccess();
    } catch {
      // Error is handled by the mutation state
    }
  };

  /**
   * Retries the last submission after an error.
   * Re-validates before retrying.
   */
  const handleRetry = () => {
    if (!validate()) return;
    createMutation.reset();
    const input: CreateIncidentInput = {
      title: title.trim(),
      description: description.trim(),
      severity: severity as IncidentSeverity,
      assigneeId: assigneeId || null,
    };
    createMutation.mutate(input, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setSeverity("");
        setAssigneeId("");
        setErrors({});
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <Input
        id="incident-title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Enter a descriptive title"
        required
        autoFocus
      />

      <Textarea
        id="incident-description"
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        placeholder="Describe the incident in detail..."
        rows={4}
        required
      />

      <div className={styles.row}>
        <Select
          id="incident-severity"
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as IncidentSeverity | "")}
          options={SEVERITY_OPTIONS_WITH_PLACEHOLDER}
          error={errors.severity}
          required
        />

        <Select
          id="incident-assignee"
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={assigneeOptions}
          disabled={usersLoading}
        />
      </div>

      {createMutation.isError && (
        <div className={styles.error} role="alert">
          <span>
            {createMutation.error?.message || "Failed to create incident."}
          </span>
          <Button
            type="button"
            variant="secondary"
            onClick={handleRetry}
            className={styles.retryButton}
          >
            Retry
          </Button>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating..." : "Create Incident"}
        </Button>
      </div>
    </form>
  );
}