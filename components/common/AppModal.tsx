"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";

interface AppModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function AppModal({
  isOpen = false,
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: AppModalProps) {
  // Support both `isOpen` and legacy `open` props
  const resolvedOpen = Boolean(isOpen ?? open);

  return (
    <Dialog open={resolvedOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={`w-full ${sizeClasses[size]} rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col`}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)]">
              <DialogTitle className="text-lg font-semibold text-[color:var(--text)]">
                {title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[color:var(--text-muted)] hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-5 py-4 border-t border-[color:var(--border)] bg-gray-50 rounded-b-2xl flex flex-wrap gap-3 justify-end">
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
