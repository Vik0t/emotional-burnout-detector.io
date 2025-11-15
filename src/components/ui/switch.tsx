"use client";

import * as React from "react";
import { cn } from "./utils";

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

function Switch({ className, id, checked, onChange, ...props }: SwitchProps) {
  const inputId = id || `switch-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label data-slot="switch" htmlFor={inputId} className={cn('p-inputswitch inline-flex items-center', className)}>
      <input id={inputId} type="checkbox" className="p-inputswitch-input" checked={checked} onChange={onChange} {...props} />
      <span className="p-inputswitch-slider inline-block" aria-hidden />
    </label>
  );
}

export { Switch };
