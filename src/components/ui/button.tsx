import * as React from "react";
import { cn } from "./utils";

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon";

function variantToClasses(v?: Variant) {
  switch (v) {
    case "destructive":
      return "p-button p-button-danger";
    case "outline":
      return "p-button p-button-outlined";
    case "secondary":
      return "p-button p-button-info";
    case "ghost":
      return "p-button p-button-text";
    case "link":
      return "p-link";
    default:
      return "p-button";
  }
}

function sizeToClasses(s?: Size) {
  switch (s) {
    case "sm":
      return "p-button-sm";
    case "lg":
      return "p-button-lg";
    case "icon":
      return "p-button-icon-only";
    default:
      return "";
  }
}

import { renderWithAsChild } from "./utils";

function Button({ className, variant = "default", size = "default", asChild = false, children, ...props }: React.ComponentProps<"button"> & { variant?: Variant; size?: Size; asChild?: boolean; children?: React.ReactNode }) {
  // Build kit classes and merge with existing className
  const kitClasses = variantToClasses(variant) + (sizeToClasses(size) ? ` ${sizeToClasses(size)}` : "");

  // Ensure label wrapper exists so kit CSS applies to the text part and our overrides target it

  return (
    <>{renderWithAsChild(asChild, <span className="p-button-label">{children}</span>, "button", { "data-slot": "button", className: cn(kitClasses, className), ...props })}</>
  );
}

function buttonVariants({ variant = "default", size = "default" }: { variant?: Variant; size?: Size } = { variant: "default", size: "default" }) {
  return variantToClasses(variant) + (sizeToClasses(size) ? ` ${sizeToClasses(size)}` : "");
}

export { Button, buttonVariants };
