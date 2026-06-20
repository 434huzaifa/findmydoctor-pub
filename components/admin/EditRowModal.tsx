"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUpdateTableRowMutation } from "@/store/fmdApi";
import { AppModal } from "../common/AppModal";
import type { SchemaColumn } from "@/store/fmdApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  row: Record<string, unknown>;
  columns: SchemaColumn[];
  onSaved: () => void;
}

export function EditRowModal({
  isOpen,
  onClose,
  table,
  row,
  columns,
  onSaved,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const col of columns) {
      init[col.name] = String(row[col.name] ?? "");
    }
    return init;
  });

  const [updateRow, { isLoading }] = useUpdateTableRowMutation();

  const editableColumns = columns.filter(
    (c) => !c.isPrimary && !c.isGenerated && c.name !== "createdAt" && c.name !== "updatedAt"
  );

  async function handleSave() {
    const id = row.id as number;
    if (!id) return;

    try {
      const data: Record<string, unknown> = {};
      for (const col of editableColumns) {
        const val = values[col.name];
        if (col.nullable && val === "") {
          data[col.name] = null;
        } else if (col.type === "int" || col.type === "integer") {
          data[col.name] = parseInt(val) || 0;
        } else if (col.type === "decimal" || col.type === "numeric") {
          data[col.name] = parseFloat(val) || 0;
        } else if (col.type === "boolean" || col.type === "bool") {
          data[col.name] = val === "true" || val === "1";
        } else {
          data[col.name] = val;
        }
      }

      await updateRow({ table, id, data }).unwrap();
      toast.success("Row updated");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to update row");
    }
  }

  const inputCls =
    "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none w-full";

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${table} #${row.id}`}
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {editableColumns.map((col) => (
          <div key={col.name}>
            <label className="text-sm font-medium text-[color:var(--text)]">
              {col.name}
              {col.nullable && (
                <span className="text-xs text-gray-400 ml-1">(optional)</span>
              )}
            </label>
            <input
              value={values[col.name] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [col.name]: e.target.value,
                }))
              }
              className={inputCls}
              placeholder={`${col.type}${col.nullable ? " | null" : ""}`}
            />
          </div>
        ))}
      </div>
    </AppModal>
  );
}
