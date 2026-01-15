/**
 * Styled select dropdown component with label and error support.
 */

import { SelectHTMLAttributes, forwardRef } from "react";
import styles from "./Select.module.css";

/**
 * Option definition for the select dropdown.
 */
interface SelectOption {
  /** Value submitted when this option is selected */
  value: string;
  /** Display text shown to the user */
  label: string;
}

/**
 * Extends native select attributes for full HTML select support.
 */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below the select */
  error?: string;
  /** Array of options to display in the dropdown */
  options: SelectOption[];
}

/**
 * A styled select dropdown with optional label and error message.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`${styles.select} ${error ? styles.error : ""} ${className || ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={`${id}-error`} className={styles.errorMessage} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";