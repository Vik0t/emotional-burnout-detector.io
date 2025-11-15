import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";
import type { ElementType } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function renderWithAsChild<T extends ElementType>(asChild: boolean, children: React.ReactNode, Tag: T, props: any) {
  if (asChild && React.isValidElement(children)) {
    // Merge className safely
    const child = children as React.ReactElement<any>;
    const mergedClassName = cn(child.props?.className, props?.className);
    return React.cloneElement(child, { ...props, className: mergedClassName });
  }

  return React.createElement(Tag as any, props, children);
}
