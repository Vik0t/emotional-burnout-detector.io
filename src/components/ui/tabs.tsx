"use client";

import * as React from "react";

import { cn } from "./utils";

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
};

function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue || "");
  const active = value ?? internal;
  const setActive = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <div data-slot="tabs" className={cn("p-tabview flex flex-col gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as React.ReactElement<any>, { activeValue: active, setActive });
      })}
    </div>
  );
}

function TabsList({ children, className, activeValue, setActive }: any) {
  return (
    <div data-slot="tabs-list" role="tablist" className={cn("p-tabview-nav bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as React.ReactElement<any>, { activeValue, setActive });
      })}
    </div>
  );
}

function TabsTrigger({ value, className, children, activeValue, setActive, ...props }: any) {
  const active = activeValue === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      data-slot="tabs-trigger"
      className={cn(
        "p-tabview-navitem data-[active=true]:bg-card text-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={() => setActive?.(value)}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children, activeValue }: any) {
  if (value !== activeValue) return null;
  return (
    <div data-slot="tabs-content" role="tabpanel" className={cn("p-tabview-panel flex-1 outline-none", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
