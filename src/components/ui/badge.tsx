import * as React from "react";
import { renderWithAsChild } from "./utils";

import { cn } from "./utils";

type Variant = "default" | "secondary" | "destructive" | "outline";

function variantToClasses(v?: Variant) {
  switch (v) {
    case "secondary":
      return "p-badge p-badge-secondary";
    case "destructive":
      return "p-badge p-badge-danger";
    case "outline":
      // kit does not have a dedicated outline, fall back to secondary styling
      return "p-badge p-badge-secondary";
    default:
      return "p-badge";
  }
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> & { variant?: Variant; asChild?: boolean; children?: React.ReactNode }) {
  return <>{renderWithAsChild(asChild, children, "span", { "data-slot": "badge", className: cn(variantToClasses(variant), className), ...props })}</>;
}

export { Badge };
