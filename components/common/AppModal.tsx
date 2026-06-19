
"use client";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
type Props = { open: boolean; title: string; children: ReactNode; onClose: () => void; footer?: ReactNode };
export function AppModal({ open, title, children, onClose, footer }: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-slate-900/45" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-2xl">
          <DialogTitle className="mb-3 font-serif text-2xl font-bold text-[color:var(--teal)]">{title}</DialogTitle>
          <div className="text-sm text-[color:var(--text)]">{children}</div>
          {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
