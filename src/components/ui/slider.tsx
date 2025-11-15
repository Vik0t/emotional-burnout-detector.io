"use client";

import * as React from "react";

import { cn } from "./utils";

function Slider({ className, value: valueProp, defaultValue, min = 0, max = 100, onValueChange, ...props }: { className?: string; value?: number; defaultValue?: number; min?: number; max?: number; onValueChange?: (v: number) => void }) {
  const [value, setValue] = React.useState<number>(valueProp ?? defaultValue ?? min);
  React.useEffect(() => {
    if (valueProp !== undefined) setValue(valueProp);
  }, [valueProp]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setValue(v);
    onValueChange?.(v);
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div data-slot="slider" className={cn("p-slider p-slider-horizontal relative flex w-full items-center", className)} {...props}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full appearance-none bg-transparent"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      <div data-slot="slider-range" className="p-slider-range absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${percent}%`, pointerEvents: "none" }} />
      <div data-slot="slider-handle" className="p-slider-handle absolute" style={{ left: `${percent}%`, transform: "translateX(-50%)" }} />
    </div>
  );
}

export { Slider };
