"use client";

import * as React from "react";
import { cn } from "./utils";
import { buttonVariants } from "./button";
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from "./dialog";

function AlertDialog({ children }: { children?: React.ReactNode }) {
  return <Dialog>{children}</Dialog>;
}

function AlertDialogTrigger({ children, ...props }: any) {
  return <DialogTrigger {...props}>{children}</DialogTrigger>;
}

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <DialogPortal>{children}</DialogPortal>;
}

function AlertDialogOverlay({ className, ...props }: any) {
  return <DialogOverlay className={cn("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />;
}

function AlertDialogContent({ className, children }: any) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <DialogContent className={cn("max-w-[calc(100%-2rem)] sm:max-w-lg grid gap-4 p-6", className)}>{children}</DialogContent>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: any) {
  return <DialogTitle className={cn("text-lg font-semibold", className)} {...props} />;
}

function AlertDialogDescription({ className, ...props }: any) {
  return <DialogDescription className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

function AlertDialogAction({ className, ...props }: any) {
  return (
    <DialogClose className={cn(buttonVariants(), className)} {...props} />
  );
}

function AlertDialogCancel({ className, ...props }: any) {
  return <DialogClose className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
