"use client";

import * as React from "react";
import { cn } from "./utils";

/*
  Simplified Select adapted to SDEK kit:
  - For most usages in the app we only need a simple controlled select (value/onValueChange).
  - This implementation keeps the exported API (Select, SelectTrigger, SelectContent, SelectItem, SelectValue)
    so existing pages keep their JSX structure. Under the hood `Select` collects `SelectItem` children
    and renders a native `<select>` styled with kit classes.
*/

type SelectProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
  className?: string;
};

function Select({ value, onValueChange, children, className }: SelectProps) {
  // Collect options from nested SelectContent -> SelectItem structure.
  const options: Array<{ value: string; label: React.ReactNode }> = [];
  let triggerClass = "";

  const walk = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (child) => {
      if (!React.isValidElement(child)) return;
      const type = (child.type as any)?.name;
      // If it's our SelectItem placeholder, read props
      if (type === "SelectItem") {
        const v = (child.props as any).value;
        options.push({ value: String(v), label: child.props.children });
      } else if (type === "SelectTrigger") {
        triggerClass = child.props?.className || "";
      } else if (child.props && child.props.children) {
        walk(child.props.children);
      }
    });
  };

  walk(children);

  return (
    <div data-slot="select" className={cn("p-dropdown", className)}>
      <select
        className={cn("p-inputtext w-full p-dropdown-label", triggerClass)}
        value={value}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SelectTrigger(props: any) {
  // kept for compatibility, not used when using simplified Select
  return <div data-slot="select-trigger" {...props} />;
}

function SelectContent(props: any) {
  // kept for compatibility — children will be parsed by Select
  return <div data-slot="select-content" {...props} />;
}

function SelectItem(props: any) {
  // placeholder used by Select parsing
  return <div data-slot="select-item" {...props} />;
}

function SelectValue(props: any) {
  return <span data-slot="select-value" {...props} />;
}

function SelectGroup(props: any) {
  return <div data-slot="select-group" {...props} />;
}

function SelectLabel(props: any) {
  return <label data-slot="select-label" {...props} />;
}

function SelectSeparator(props: any) {
  return <hr data-slot="select-separator" {...props} />;
}

function SelectScrollUpButton(props: any) {
  return <div data-slot="select-scroll-up-button" {...props} />;
}

function SelectScrollDownButton(props: any) {
  return <div data-slot="select-scroll-down-button" {...props} />;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
