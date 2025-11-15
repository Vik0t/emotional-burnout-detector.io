import * as React from "react";

import { cn } from "./utils";

/**
 * Input wrapper migrated to SDEK UI kit.
 * - Uses .p-inputtext kit class
 * - Supports size via className or data-size attribute
 * - Preserves original props and className merging
 */
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  // Accept conventional h-12 pl-10 style classes from callers (icon padding)
  // Add kit class p-inputtext to ensure correct visuals.
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // core kit input class + prefer kit size classes if provided by consumer
        "p-inputtext",
        // Keep additional helper classes passed by callers (padding, height etc.)
        "w-full",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
