/**
 * Main incident list component with filtering and sorting.
 * 
 * Features:
 * - Sortable columns (title, status, severity, assignee, date)
 * - Integration with FilterBar for search and filtering
 * - Keyboard accessible rows
 * - Loading and error states
 * - Responsive table design
 */

import { useState, useMemo } from "react";
import { useIncidents, useUsers } from "../../hooks";
import { Badge, Button, Spinner } from "../common";
import { FilterBar, Filters } from "../FilterBar/FilterBar";
import { formatDate } from "../../utils/formatters";
import { SEVERITY_ORDER, STATUS_ORDER } from "../../utils/constants";
import type { Incident } from "../../api/types";
import styles from "./IncidentList.module.css";

/** Available fields for sorting */
type SortField = "title" | "status" | "severity" | "assignee" | "createdAt";

/** Sort direction */
type SortDirection = "asc" | "desc";

interface IncidentListProps {
  /** Callback when an incident row is clicked/selected */
  onSelectIncident: (incident: Incident) => void;
}

/**
 * Displays a sortable, filterable table of incidents.
 */
export function IncidentList({ onSelectIncident }: IncidentListProps) {
  const { data: incidents, isLoading, isError, refetch } = useIncidents();
  const { data: users } = useUsers();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    status: "",
    severity: "",
    assigneeId: "",
  });

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  /**
   * Resolves a user ID to display name.
   * @param assigneeId - User ID or null
   * @returns User name, null for unassigned, or "Unknown"
   */
  const getUserName = (assigneeId: string | null) => {
    if (!assigneeId) return null;
    return users?.find((u) => u.id === assigneeId)?.name || "Unknown";
  };

  /**
   * Memoized filtered and sorted incidents list.
   * Applies all active filters then sorts by current field/direction.
   */
  const filteredAndSortedIncidents = useMemo(() => {
    if (!incidents) return [];

    // Apply filters
    let filtered = incidents.filter((incident) => {
      if (
        filters.search &&
        !incident.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.status && incident.status !== filters.status) {
        return false;
      }
      if (filters.severity && incident.severity !== filters.severity) {
        return false;
      }
      if (filters.assigneeId) {
        if (filters.assigneeId === "unassigned") {
          if (incident.assigneeId !== null) return false;
        } else if (incident.assigneeId !== filters.assigneeId) {
          return false;
        }
      }
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "severity":
          // Higher severity first by default
          comparison = SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity];
          break;
        case "assignee": {
          // Unassigned sorts last
          const nameA = getUserName(a.assigneeId) || "zzz";
          const nameB = getUserName(b.assigneeId) || "zzz";
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [incidents, filters, sortField, sortDirection, users]);

  /**
   * Handles column header click for sorting.
   * Toggles direction if same field, otherwise sets new field with asc.
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  /** Handles row click to select incident */
  const handleRowClick = (incident: Incident) => {
    onSelectIncident(incident);
  };

  /** Handles keyboard navigation on rows (Enter/Space to select) */
  const handleRowKeyDown = (e: React.KeyboardEvent, incident: Incident) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectIncident(incident);
    }
  };

  /** Sort indicator icon component */
  const SortIcon = ({ field }: { field: SortField }) => {
    const isActive = sortField === field;
    return (
      <span className={`${styles.sortIcon} ${isActive ? styles.active : ""}`}>
        {isActive ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="large" />
        <p>Loading incidents...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.error}>
        <p>Failed to load incidents. Please try again.</p>
        <Button onClick={() => refetch()} className={styles.retryButton}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {filteredAndSortedIncidents.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📋</div>
          <p>No incidents found matching your filters.</p>
        </div>
      ) : (
        <div className={styles.container}>
          <table className={styles.table} role="grid">
            <thead>
              <tr>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort("title")}
                  aria-sort={sortField === "title" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Title <SortIcon field="title" />
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort("status")}
                  aria-sort={sortField === "status" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort("severity")}
                  aria-sort={sortField === "severity" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Severity <SortIcon field="severity" />
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort("assignee")}
                  aria-sort={sortField === "assignee" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Assignee <SortIcon field="assignee" />
                </th>
                <th
                  className={styles.sortable}
                  onClick={() => handleSort("createdAt")}
                  aria-sort={sortField === "createdAt" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  Created <SortIcon field="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => handleRowClick(incident)}
                  onKeyDown={(e) => handleRowKeyDown(e, incident)}
                  tabIndex={0}
                  role="row"
                  aria-label={`Incident: ${incident.title}`}
                >
                  <td data-label="Title" className={styles.title}>
                    {incident.title}
                  </td>
                  <td data-label="Status">
                    <Badge status={incident.status} />
                  </td>
                  <td data-label="Severity">
                    <Badge severity={incident.severity} />
                  </td>
                  <td data-label="Assignee">
                    {incident.assigneeId ? (
                      <span className={styles.assignee}>{getUserName(incident.assigneeId)}</span>
                    ) : (
                      <span className={styles.unassigned}>Unassigned</span>
                    )}
                  </td>
                  <td data-label="Created" className={styles.date}>
                    {formatDate(incident.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}