/**
 * Badge component for displaying status and severity indicators.
 * Uses color-coded backgrounds to quickly convey incident priority/state.
 */

import type { IncidentStatus, IncidentSeverity } from "../../../api/types";
import styles from "./Badge.module.css";

/**
 * Badge component that provides either status OR severity, not both.
 */
interface BadgeProps {
  /** Incident status to display (mutually exclusive with severity) */
  status?: IncidentStatus;
  /** Incident severity to display (mutually exclusive with status) */
  severity?: IncidentSeverity;
}

/**
 * A color-coded badge for displaying incident status or severity.
 *
 * - Status: Open (blue), In Progress (yellow), Resolved (green)
 * - Severity: Critical (red), High (orange), Medium (yellow), Low (green)
 */
export function Badge({ status, severity }: BadgeProps) {
  if (status) {
    const statusClass =
      status === "Open"
        ? styles.open
        : status === "In Progress"
        ? styles.inProgress
        : styles.resolved;
    return <span className={`${styles.badge} ${statusClass}`}>{status}</span>;
  }

  if (severity) {
    const severityClass = styles[severity.toLowerCase() as keyof typeof styles];
    return <span className={`${styles.badge} ${severityClass}`}>{severity}</span>;
  }

  return null;
}