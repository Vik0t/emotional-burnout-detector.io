"use client";

import * as React from "react";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

type RadioGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  className?: string;
};

function RadioGroup({ value, onValueChange, name, className, children, ...props }: React.PropsWithChildren<RadioGroupProps>) {
  return (
    <div data-slot="radio-group" className={cn('grid gap-3', className)} {...props} role="radiogroup" aria-label={name}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, { name, checked: (child as any).props.value === value, onChange: (e: any) => onValueChange?.(e.target.value) });
      })}
    </div>
  );
}

type RadioGroupItemProps = React.InputHTMLAttributes<HTMLInputElement> & { value?: string; className?: string; label?: React.ReactNode; };

function RadioGroupItem({ className, value, name, label, ...props }: RadioGroupItemProps) {
  const id = props.id || `rg-${name}-${value}`;
  return (
    <label data-slot="radio-group-item" htmlFor={id} className={cn('flex items-center gap-2 p-0', className)}>
      <input id={id} type="radio" className="p-radiobutton-input" name={name} value={value} {...props} />
      <span className="p-radiobutton inline-flex items-center justify-center">
        <span className="p-radiobutton-box inline-flex items-center justify-center">
          <span className="p-radiobutton-icon" aria-hidden>
            <CircleIcon className="size-2 fill-primary" />
          </span>
        </span>
      </span>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}

export { RadioGroup, RadioGroupItem };
