import * as React from "react";
import { cva } from "class-variance-authority@0.7.1";
import { ChevronDownIcon } from "lucide-react";
import { PopoverTrigger, PopoverContent } from "./popover";

import { cn } from "./utils";

type NavigationMenuContextValue = {
  viewport: boolean;
  setViewportContent: (c: React.ReactNode | null) => void;
  viewportRef: React.RefObject<HTMLDivElement | null>;
};

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null);

function NavigationMenu({ className, children, viewport = true }: { className?: string; children?: React.ReactNode; viewport?: boolean }) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportContent, setViewportContent] = React.useState<React.ReactNode | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  return (
    <NavigationMenuContext.Provider value={{ viewport, setViewportContent: setViewportContent as any, viewportRef }}>
      <div data-slot="navigation-menu" data-viewport={viewport} className={cn("p-megamenu p-megamenu-horizontal relative flex max-w-max flex-1 items-center justify-center", className)}>
        <ul
          data-slot="navigation-menu-list"
          ref={listRef}
          className={cn("p-megamenu-root-list flex flex-1 list-none items-center justify-center gap-1")}
          onKeyDown={(e) => {
            const el = listRef.current;
            if (!el) return;
            const links = Array.from(el.querySelectorAll<HTMLElement>('[data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"]'));
            if (!links.length) return;
            const idx = links.indexOf(document.activeElement as HTMLElement);
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              const next = links[(idx + 1) % links.length];
              next.focus();
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const prev = links[(idx - 1 + links.length) % links.length];
              prev.focus();
            }
          }}
        >
          {children}
        </ul>
        {viewport && (
          <div ref={viewportRef} className={cn("navigation-menu-viewport-container absolute top-full left-0 z-50 w-full flex justify-center")}>
            {viewportContent}
          </div>
        )}
      </div>
    </NavigationMenuContext.Provider>
  );
}

function NavigationMenuList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <ul data-slot="navigation-menu-list" className={cn("p-megamenu-root-list group flex flex-1 list-none items-center justify-center gap-1", className)}>
      {children}
    </ul>
  );
}

function NavigationMenuItem({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <li data-slot="navigation-menu-item" className={cn("p-menuitem relative", className)}>
      {children}
    </li>
  );
}

const navigationMenuTriggerStyle = cva(
  "p-megamenu-button inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({ className, children, ...props }: { className?: string; children?: React.ReactNode } & React.ComponentProps<typeof PopoverTrigger>) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.click();
    }
    if (props.onKeyDown) props.onKeyDown(e as any);
  };

  return (
    <PopoverTrigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), "group", className)} onKeyDown={handleKeyDown} {...props}>
      {children} <ChevronDownIcon className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180" aria-hidden="true" />
    </PopoverTrigger>
  );
}

function NavigationMenuContent({ className, children, side = "bottom", align = "center", ...props }: { className?: string; children?: React.ReactNode; side?: string; align?: string }) {
  const ctx = React.useContext(NavigationMenuContext);
  if (ctx?.viewport) {
    // Render into the viewport area using context
    const content = (
      <div data-slot="navigation-menu-content" className={cn("p-megamenu-panel p-megamenu-panel-grid", className)} {...(props as any)}>
        {children}
      </div>
    );
    // When used with viewport, the parent NavigationMenuItem is responsible for providing child to viewport
    return <>{content}</>;
  }

  // Fallback: popover content
  return (
    <PopoverContent data-slot="navigation-menu-content" className={cn("p-overlaypanel bg-popover text-popover-foreground rounded-md border p-2 shadow-md", className)}>
      <div className="p-overlaypanel-content">{children}</div>
    </PopoverContent>
  );
}

function NavigationMenuViewport({ className, children }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(NavigationMenuContext);
  return (
    <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center", className)}>
      <div data-slot="navigation-menu-viewport" className={cn("p-megamenu-panel-list origin-top-center bg-popover text-popover-foreground relative mt-1.5 overflow-hidden rounded-md border shadow md:w-auto w-full", className)}>
        {children}
      </div>
    </div>
  );
}

function NavigationMenuLink({ className, children, ...props }: React.ComponentProps<"a">) {
  return (
    <a data-slot="navigation-menu-link" className={cn("p-menuitem-link p-menuitem-text data-[active=true]:bg-accent data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1 text-sm transition-all outline-none", className)} {...props}>
      {children}
    </a>
  );
}

function NavigationMenuIndicator({ className }: { className?: string }) {
  return (
    <div data-slot="navigation-menu-indicator" className={cn("p-menuitem-indicator top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden", className)}>
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
