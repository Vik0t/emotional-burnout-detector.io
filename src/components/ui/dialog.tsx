"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X as XIcon } from "lucide-react";
import { cn } from "./utils";

/*
  Lightweight dialog implementation using SDEK kit classes (.p-dialog).
  - Keeps the same exported names used in the codebase.
  - Uses internal state: <Dialog> provides context and <DialogTrigger> toggles open.
  - <DialogContent> renders a portal with backdrop and kit-styled dialog.
*/

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
} | null>(null);

function Dialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }} data-slot="dialog">
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild, ...props }: any) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const { setOpen } = ctx;
  const onClick = (e: React.MouseEvent) => {
    setOpen(true);
    if (props.onClick) props.onClick(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, { onClick, ...props });
  }

  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  );
}

function DialogOverlay({ className, onClick }: any) {
  return <div className={cn("fixed inset-0 bg-black/50 z-40", className)} onClick={onClick} />;
}

function DialogContent({ className, children, onOpenChange }: any) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;

  React.useEffect(() => {
    if (typeof onOpenChange === "function") onOpenChange(open);
  }, [open, onOpenChange]);

  if (!open) return null;

  const node = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <DialogOverlay onClick={() => setOpen(false)} />
      <div className={cn("p-dialog relative z-50 max-w-lg w-full mx-4", className)} role="dialog" aria-modal>
        {children}
        <button
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="p-dialog-header-icon absolute top-4 right-4">
          <XIcon />
        </button>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

function DialogHeader({ className, ...props }: any) {
  return <div className={cn("p-dialog-header", className)} {...props} />;
}

function DialogFooter({ className, ...props }: any) {
  return <div className={cn("p-dialog-footer", className)} {...props} />;
}

function DialogTitle({ className, ...props }: any) {
  return <div className={cn("p-dialog-title", className)} {...props} />;
}

function DialogDescription({ className, ...props }: any) {
  return <div className={cn("p-dialog-content", className)} {...props} />;
}

function DialogClose({ children, ...props }: any) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) return null;
  const { setOpen } = ctx;
  return (
    <button type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>
  );
}

function DialogPortal(props: any) {
  return <>{props.children}</>;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
