"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateAdminMedicineMutation } from "@/store/fmdApi";
import { AppModal } from "../common/AppModal";

const medicineSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  company: z.string().optional(),
  class: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative").default(0),
  stock: z.coerce.number().min(0, "Stock cannot be negative").default(0),
});

type MedicineForm = z.input<typeof medicineSchema>;
type MedicinePayload = z.output<typeof medicineSchema>;

export function AddMedicineForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [createMedicine, { isLoading }] = useCreateAdminMedicineMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineForm>({
    resolver: zodResolver(medicineSchema),
  });

  async function onSubmit(data: MedicineForm) {
    try {
      const payload: MedicinePayload = medicineSchema.parse(data);
      await createMedicine(payload).unwrap();
      toast.success(`Medicine "${payload.name}" added`);
      reset();
      setOpen(false);
      onSaved();
    } catch (e: unknown) {
      toast.error((e as { error?: string })?.error ?? "Failed");
    }
  }

  const inputCls =
    "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none w-full";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
      >
        💊 Add Medicine
      </button>

      <AppModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Medicine"
        footer={
          <>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? "Adding…" : "Add"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input {...register("name")} className={inputCls} placeholder="Paracetamol 500mg" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea {...register("description")} className={inputCls} rows={2} placeholder="Description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Company</label>
              <input {...register("company")} className={inputCls} placeholder="Square Pharma" />
            </div>
            <div>
              <label className="text-sm font-medium">Class</label>
              <input {...register("class")} className={inputCls} placeholder="Analgesic" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Price (৳)</label>
              <input type="number" step="0.01" {...register("price")} className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Stock</label>
              <input type="number" {...register("stock")} className={inputCls} placeholder="100" />
            </div>
          </div>
        </form>
      </AppModal>
    </>
  );
}
