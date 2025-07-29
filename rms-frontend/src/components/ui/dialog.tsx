import * as React from "react";
import { cn } from "@/lib/utils";

export const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
  return (
    <div className={open ? "fixed inset-0 z-50 flex items-center justify-center bg-black/30" : "hidden"}>
      {children}
    </div>
  );
};

export const DialogTrigger = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
  <span onClick={onClick} className="inline-block">{children}</span>
);

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative", className)} {...props} />
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-600 mb-4">{children}</p>
);

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex justify-end gap-2">{children}</div>
); 