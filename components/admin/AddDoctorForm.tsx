"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCreateAdminDoctorMutation,
  useGetAdminSpecialtiesQuery,
} from "@/store/fmdApi";
import { AppModal } from "../common/AppModal";

const doctorSchema = z.object({
  name: z.string().min(1, "Name required"),
  specialtyId: z.coerce.number().min(1, "Specialty required"),
  hospital: z.string().min(1, "Hospital required"),
  city: z.string().min(1, "City required"),
  exp: z.coerce.number().default(0),
  fee: z.coerce.number().default(0),
  advanceFee: z.coerce.number().default(0),
  totalSeats: z.coerce.number().default(10),
  degrees: z.string().default(""),
  chamberAddress: z.string().optional(),
  roomNumber: z.string().optional(),
});

type DoctorForm = z.input<typeof doctorSchema>;
type DoctorPayload = z.output<typeof doctorSchema>;

export function AddDoctorForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [createDoctor, { isLoading }] = useCreateAdminDoctorMutation();
  const { data: specialties } = useGetAdminSpecialtiesQuery();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
  });

  async function onSubmit(data: DoctorForm) {
    try {
      const payload: DoctorPayload = doctorSchema.parse(data);
      await createDoctor(payload as Record<string, unknown>).unwrap();
      toast.success(`Doctor "${payload.name}" added`);
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
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        🩺 Add Doctor
      </button>

      <AppModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Doctor"
        size="lg"
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
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Adding…" : "Add"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input {...register("name")} className={inputCls} placeholder="Dr. Name" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Specialty</label>
            <select {...register("specialtyId")} className={inputCls}>
              <option value="">Select specialty...</option>
              {specialties?.map((s) => (
                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
              ))}
            </select>
            {errors.specialtyId && <p className="text-xs text-red-500 mt-1">{errors.specialtyId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Hospital</label>
              <input {...register("hospital")} className={inputCls} placeholder="Hospital name" />
              {errors.hospital && <p className="text-xs text-red-500 mt-1">{errors.hospital.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">City</label>
              <input {...register("city")} className={inputCls} placeholder="Dhaka" />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Fee (৳)</label>
              <input type="number" {...register("fee")} className={inputCls} placeholder="1500" />
            </div>
            <div>
              <label className="text-sm font-medium">Advance Fee</label>
              <input type="number" {...register("advanceFee")} className={inputCls} placeholder="500" />
            </div>
            <div>
              <label className="text-sm font-medium">Seats</label>
              <input type="number" {...register("totalSeats")} className={inputCls} placeholder="10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Experience (yrs)</label>
              <input type="number" {...register("exp")} className={inputCls} placeholder="5" />
            </div>
            <div>
              <label className="text-sm font-medium">Room Number</label>
              <input {...register("roomNumber")} className={inputCls} placeholder="301-A" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Degrees</label>
            <input {...register("degrees")} className={inputCls} placeholder="MBBS, MD" />
          </div>

          <div>
            <label className="text-sm font-medium">Chamber Address</label>
            <input {...register("chamberAddress")} className={inputCls} placeholder="Address" />
          </div>
        </form>
      </AppModal>
    </>
  );
}
