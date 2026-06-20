"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateAdminAmbulanceMutation } from "@/store/fmdApi";
import { AppModal } from "../common/AppModal";

const ambulanceSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number required"),
  driverName: z.string().min(1, "Driver name required"),
  driverPhone: z.string().min(1, "Driver phone required"),
  baseLocation: z.string().min(1, "Base location required"),
});

type AmbulanceForm = z.infer<typeof ambulanceSchema>;

export function AddAmbulanceForm({ onSaved }: { onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [createAmbulance, { isLoading }] = useCreateAdminAmbulanceMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AmbulanceForm>({
    resolver: zodResolver(ambulanceSchema),
  });

  async function onSubmit(data: AmbulanceForm) {
    try {
      await createAmbulance(data).unwrap();
      toast.success(`Ambulance "${data.vehicleNumber}" added`);
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
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        🚑 Add Ambulance
      </button>

      <AppModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Ambulance"
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
              className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? "Adding…" : "Add"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Vehicle Number</label>
            <input
              {...register("vehicleNumber")}
              className={inputCls}
              placeholder="DHK-1234"
            />
            {errors.vehicleNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.vehicleNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Driver Name</label>
            <input
              {...register("driverName")}
              className={inputCls}
              placeholder="Abdul Karim"
            />
            {errors.driverName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.driverName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Driver Phone</label>
            <input
              {...register("driverPhone")}
              className={inputCls}
              placeholder="+8801711111111"
            />
            {errors.driverPhone && (
              <p className="text-xs text-red-500 mt-1">
                {errors.driverPhone.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Base Location</label>
            <input
              {...register("baseLocation")}
              className={inputCls}
              placeholder="Dhanmondi, Dhaka"
            />
            {errors.baseLocation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.baseLocation.message}
              </p>
            )}
          </div>
        </form>
      </AppModal>
    </>
  );
}
