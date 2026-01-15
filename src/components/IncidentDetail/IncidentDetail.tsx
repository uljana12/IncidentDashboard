/**
 * Component for viewing and editing incident details.
 * Displays incident information, status history, and provides edit functionality.
 */

import { useState, useEffect } from "react";
import { useUsers, useUpdateIncident } from "../../hooks";
import { Badge, Button, Select } from "../common";
import { formatDateTime } from "../../utils/formatters";
import { STATUS_OPTIONS } from "../../utils/constants";
import type { Incident, IncidentStatus } from "../../api/types";
import styles from "./IncidentDetail.module.css";

interface IncidentDetailProps {
  /** The incident to display */
  incident: Incident;
  /** Callback fired when the detail view should close */
  onClose: () => void;
  /** Callback to notify parent of unsaved changes state (for close confirmation) */
  onUnsavedChanges?: (hasChanges: boolean) => void;
}

/**
 * Displays incident details with view and edit modes.
 * 
 * The component notifies its parent of unsaved changes via the
 * `onUnsavedChanges` callback, allowing the parent to show a
 * confirmation dialog when closing with unsaved changes.
 * 
 */
export function IncidentDetail({ incident, onClose, onUnsavedChanges }: IncidentDetailProps) {
  const { data: users } = useUsers();
  const updateMutation = useUpdateIncident();

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<IncidentStatus>(incident.status);
  const [editedAssigneeId, setEditedAssigneeId] = useState<string>(incident.assigneeId || "");

  /**
   * Determines if there are unsaved changes in edit mode.
   * Compares edited values against original incident values.
   */
  const hasUnsavedChanges = isEditing && (
    editedStatus !== incident.status || 
    editedAssigneeId !== (incident.assigneeId || "")
  );

  // Notify parent of unsaved changes state for close confirmation
  useEffect(() => {
    onUnsavedChanges?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChanges]);

  // Sync edit state when incident prop changes (e.g., after optimistic update)
  useEffect(() => {
    setEditedStatus(incident.status);
    setEditedAssigneeId(incident.assigneeId || "");
    setIsEditing(false);
  }, [incident.id, incident.status, incident.assigneeId]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * Gets user display name from user ID.
   * @param userId - User ID or null for unassigned
   * @returns User name, "Unassigned", or "Unknown"
   */
  const getUserName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    return users?.find((u) => u.id === userId)?.name || "Unknown";
  };

  /**
   * Saves the edited incident and closes the modal on success.
   */
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: incident.id,
        input: {
          status: editedStatus,
          assigneeId: editedAssigneeId || null,
        },
      });
      onClose();
    } catch {
      // Error is handled by the mutation state
    }
  };

  /**
   * Retries the last save operation after an error.
   */
  const handleRetry = () => {
    updateMutation.reset();
    handleSave();
  };

  /**
   * Cancels edit mode and reverts to original values.
   */
  const handleCancel = () => {
    setEditedStatus(incident.status);
    setEditedAssigneeId(incident.assigneeId || "");
    setIsEditing(false);
    updateMutation.reset();
  };

  // Build assignee options for the dropdown
  const assigneeOptions = [
    { value: "", label: "Unassigned" },
    ...(users?.map((u) => ({ value: u.id, label: u.name })) || []),
  ];

  return (
    <div className={styles.detail}>
      {/* Status and severity badges */}
      <div className={styles.header}>
        <Badge status={incident.status} />
        <Badge severity={incident.severity} />
      </div>

      {/* Description section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Description</h3>
        <p className={styles.description}>{incident.description || "No description provided."}</p>
      </section>

      {/* Metadata section */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Details</h3>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Assignee</span>
            <span className={styles.metaValue}>{getUserName(incident.assigneeId)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created</span>
            <span className={styles.metaValue}>{formatDateTime(incident.createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Last Updated</span>
            <span className={styles.metaValue}>{formatDateTime(incident.updatedAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Severity</span>
            <span className={styles.metaValue}>{incident.severity}</span>
          </div>
        </div>
      </section>

      {/* Status history timeline */}
      {incident.statusHistory.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Status History</h3>
          <ul className={styles.timeline}>
            {incident.statusHistory.map((entry, index) => (
              <li key={`${entry.changedAt}-${index}`} className={styles.timelineItem}>
                <div className={styles.timelineDot} />
                <div className={styles.timelineContent}>
                  <span className={styles.timelineStatus}>{entry.status}</span>
                  <div className={styles.timelineDate}>
                    {formatDateTime(entry.changedAt)} by {getUserName(entry.changedBy)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Edit form or action buttons */}
      {isEditing ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Update Incident</h3>
          <div className={styles.form}>
            <div className={styles.formRow}>
              <Select
                id="edit-status"
                label="Status"
                value={editedStatus}
                onChange={(e) => setEditedStatus(e.target.value as IncidentStatus)}
                options={STATUS_OPTIONS}
              />
              <Select
                id="edit-assignee"
                label="Assignee"
                value={editedAssigneeId}
                onChange={(e) => setEditedAssigneeId(e.target.value)}
                options={assigneeOptions}
              />
            </div>

            {updateMutation.isError && (
              <div className={styles.error} role="alert">
                <span>Failed to update incident. Please try again.</span>
                <Button 
                  variant="secondary" 
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  Retry
                </Button>
              </div>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={handleCancel} disabled={updateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => setIsEditing(true)}>Edit Incident</Button>
        </div>
      )}
    </div>
  );
}