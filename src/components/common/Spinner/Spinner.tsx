/**
 * Loading spinner component for indicating async operations.
 */

import styles from "./Spinner.module.css";

interface SpinnerProps {
  /** Size variant of the spinner */
  size?: "small" | "medium" | "large";
}

/**
 * An animated loading spinner with size variants.
 */
export function Spinner({ size = "medium" }: SpinnerProps) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="Loading"
    >
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
}