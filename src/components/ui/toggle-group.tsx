"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({ size: "default", variant: "default" });

function ToggleGroup({ className, variant, size, children, ...props }: { className?: string } & VariantProps<typeof toggleVariants>) {
  return (
    <div data-slot="toggle-group" data-variant={variant} data-size={size} className={cn("group/toggle-group flex w-fit items-center rounded-md", className)} {...props}>
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </div>
  );
}

function ToggleGroupItem({ className, children, variant, size, ...props }: { className?: string; children?: React.ReactNode } & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);
  const v = context.variant || variant;
  const s = context.size || size;

  return (
    <div data-slot="toggle-group-item" data-variant={v} data-size={s} className={cn(toggleVariants({ variant: v, size: s }), "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10", className)} {...props}>
      {children}
    </div>
  );
}

export { ToggleGroup, ToggleGroupItem };
