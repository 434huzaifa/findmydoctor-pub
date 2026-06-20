"use client";

import { Fragment, type ReactNode } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-4xl",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function Modal({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) {
  // Ensure isOpen is always a boolean
  const open = Boolean(isOpen);
  
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={closeOnOverlayClick ? onClose : () => {}}
      >
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={cn(
                  "w-full rounded-2xl bg-white shadow-xl",
                  "max-h-[90vh] flex flex-col",
                  sizeClasses[size]
                )}
              >
                {/* Header */}
                {(title || description) && (
                  <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                      {title && (
                        <DialogTitle className="text-lg font-semibold text-gray-900">
                          {title}
                        </DialogTitle>
                      )}
                      {description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Close modal"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-wrap gap-3 justify-end">
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ─── Close Icon ─────────────────────────────────────────────────────────────

function CloseIcon() {
  return (
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
  );
}

// ─── Confirm Modal ──────────────────────────────────────────────────────────

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
    info: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            "px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50",
            variantStyles[variant]
          )}
        >
          {isLoading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
