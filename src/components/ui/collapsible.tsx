"use client";

import * as React from "react";

type CollapsibleContextValue = {
  open: boolean;
  toggle: () => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function Collapsible({ children, defaultOpen = false }: { children?: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(!!defaultOpen);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);

  return (
    <CollapsibleContext.Provider value={{ open, toggle }}>
      <div data-slot="collapsible" data-open={open}>{children}</div>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleTrigger({ children, ...props }: any) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement<any>;
  const handleClick = (e: any) => {
    ctx.toggle();
    child.props?.onClick?.(e);
  };
  return React.cloneElement(child, { onClick: handleClick, ...props });
}

function CollapsibleContent({ children, className, ...props }: any) {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) return null;
  if (!ctx.open) return null;
  return (
    <div data-slot="collapsible-content" className={className} {...props}>
      {children}
    </div>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
