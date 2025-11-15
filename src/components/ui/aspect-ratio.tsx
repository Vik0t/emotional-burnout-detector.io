"use client";

import * as React from "react";
import { cn } from "./utils";

function AspectRatio({ children, ratio = 16 / 9, className, style, ...props }: { ratio?: number; className?: string; children?: React.ReactNode; style?: React.CSSProperties } & React.ComponentProps<"div">) {
  const aspectStyle: React.CSSProperties = { aspectRatio: String(ratio), ...style } as any;
  return (
    <div data-slot="aspect-ratio" className={cn("w-full", className)} style={aspectStyle} {...props}>
      {children}
    </div>
  );
}

export { AspectRatio };
