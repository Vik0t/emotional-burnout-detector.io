"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "./utils";

function Accordion({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="accordion" className={className} {...props}>
      {children}
    </div>
  );
}

const AccordionItemContext = React.createContext<{
  open: boolean;
  toggle: () => void;
} | null>(null);

function AccordionItem({ className, children, defaultOpen = false }: { className?: string; children?: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const toggle = () => setOpen((v) => !v);

  return (
    <AccordionItemContext.Provider value={{ open, toggle }}>
      <div data-slot="accordion-item" className={cn("border-b last:border-b-0", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) return null;
  const { open, toggle } = ctx;

  return (
    <div className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        aria-expanded={open}
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          open ? "[&_svg]:rotate-180" : "",
          className,
        )}
        onClick={(e) => {
          toggle();
          if (props.onClick) props.onClick(e as any);
        }}
        {...props}
      >
        {children}
        <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </button>
    </div>
  );
}

function AccordionContent({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) return null;
  const { open } = ctx;

  return open ? (
    <div data-slot="accordion-content" className={cn("overflow-hidden text-sm pt-0 pb-4", className)} {...props}>
      <div>{children}</div>
    </div>
  ) : null;
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
