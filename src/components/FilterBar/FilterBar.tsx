/**
 * Filter bar component for searching and filtering incidents.
 * Provides search input and dropdown filters for status, severity, and assignee.
 */

import { useUsers } from "../../hooks";
import { STATUS_OPTIONS, SEVERITY_OPTIONS } from "../../utils/constants";
import type { IncidentStatus, IncidentSeverity } from "../../api/types";
import styles from "./FilterBar.module.css";

/**
 * Filter state object containing all filter values.
 */
export interface Filters {
  /** Search text to filter by title (case-insensitive) */
  search: string;
  /** Filter by incident status, empty string means "all" */
  status: IncidentStatus | "";
  /** Filter by incident severity, empty string means "all" */
  severity: IncidentSeverity | "";
  /** Filter by assignee ID, "unassigned" for null assignees, empty for "all" */
  assigneeId: string;
}

interface FilterBarProps {
  /** Current filter values */
  filters: Filters;
  /** Callback when any filter value changes */
  onFiltersChange: (filters: Filters) => void;
}

/**
 * A filter bar with search input and dropdown filters for incidents.
 *
 * Features:
 * - Text search filters by incident title (case-insensitive)
 * - Status dropdown filters by Open/In Progress/Resolved
 * - Severity dropdown filters by Critical/High/Medium/Low
 * - Assignee dropdown filters by user or "Unassigned"
 * - Clear button resets all filters
 *
 * Accessibility:
 * - Uses `role="search"` for the container
 * - Each filter has an `aria-label` for screen readers
 *
 */
export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { data: users, isLoading: usersLoading } = useUsers();

  /**
   * Updates a single filter value while preserving others.
   */
  const handleChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  /**
   * Resets all filters to their default (empty) values.
   */
  const handleClear = () => {
    onFiltersChange({
      search: "",
      status: "",
      severity: "",
      assigneeId: "",
    });
  };

  const hasFilters =
    filters.search || filters.status || filters.severity || filters.assigneeId;

  return (
    <div className={styles.filterBar} role="search" aria-label="Filter incidents">
      <div className={styles.searchWrapper}>
        <input
          type="search"
          placeholder="Search by title..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className={styles.searchInput}
          aria-label="Search incidents by title"
        />
      </div>
      <div className={styles.filters}>
        <select
          value={filters.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.severity}
          onChange={(e) => handleChange("severity", e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by severity"
        >
          <option value="">All Severities</option>
          {SEVERITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.assigneeId}
          onChange={(e) => handleChange("assigneeId", e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by assignee"
          disabled={usersLoading}
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}