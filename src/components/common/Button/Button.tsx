/**
 * Reusable button component with variant and size options.
 * Supports all native button attributes via prop spreading.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./Button.module.css";

/**
 * Extends native button attributes for full HTML button support.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: "primary" | "secondary";
  /** Size variant */
  size?: "medium" | "large";
}

/**
 * A styled button component with primary/secondary variants.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "medium", className, children, ...props }, ref) => {
    const classNames = [
      styles.button,
      styles[variant],
      size !== "medium" && styles[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={classNames} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";