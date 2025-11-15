"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

function Checkbox({ className, id, children, ...props }: CheckboxProps) {
  return (
    <label data-slot="checkbox" htmlFor={id} className={cn("p-checkbox inline-flex items-center gap-2", className)}>
      <input id={id} type="checkbox" className="p-checkbox-input" {...props} />
      <span className="p-checkbox-box inline-flex items-center justify-center">
        <CheckIcon className="p-checkbox-icon size-3.5" />
      </span>
      {children && <span className="text-sm text-gray-700">{children}</span>}
    </label>
  );
}

export { Checkbox };
