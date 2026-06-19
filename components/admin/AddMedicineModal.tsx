"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateAdminMedicineMutation } from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";

const medicineSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().max(1000).optional(),
    company: z.string().max(255).optional(),
    class: z.string().max(100).optional(),
    price: z.coerce.number().min(0, "Price must be non-negative"),
    imageUrl: z.string().max(500).optional(),
});

type MedicineForm = z.input<typeof medicineSchema>;

export function AddMedicineModal({ onSaved }: { onSaved: () => void }) {
    const [open, setOpen] = useState(false);
    const [createMedicine, { isLoading }] = useCreateAdminMedicineMutation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MedicineForm>({
        resolver: zodResolver(medicineSchema),
        defaultValues: {
            name: "",
            description: "",
            company: "",
            class: "",
            price: 0,
            imageUrl: "",
        },
    });

    async function onSubmit(values: MedicineForm) {
        try {
            const payload = medicineSchema.parse(values);
            await createMedicine({
                name: payload.name.trim(),
                description: payload.description?.trim() || null,
                company: payload.company?.trim() || null,
                class: payload.class?.trim() || null,
                price: payload.price,
                imageUrl: payload.imageUrl?.trim() || null,
            }).unwrap();
            toast.success("Medicine added");
            reset();
            setOpen(false);
            onSaved();
        } catch (e: unknown) {
            toast.error(
                (e as { error?: string; data?: { message?: string } })?.data?.message ??
                "Failed to add medicine",
            );
        }
    }

    const fieldClass =
        "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none";
    const labelClass = "text-xs font-medium text-[color:var(--text-muted)]";
    const errorClass = "text-xs text-red-500";

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-[color:var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]"
            >
                + Add Medicine
            </button>
            <AppModal
                open={open}
                onClose={() => setOpen(false)}
                title="Add Medicine"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="medicine-form"
                            disabled={isLoading}
                            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isLoading ? "Adding…" : "Add Medicine"}
                        </button>
                    </>
                }
            >
                <form
                    id="medicine-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="max-h-[65vh] overflow-y-auto space-y-3 pr-1"
                >
                    <div className="flex flex-col gap-1">
                        <label className={labelClass}>Name</label>
                        <input
                            {...register("name")}
                            className={fieldClass}
                            placeholder="Paracetamol 500mg"
                        />
                        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={labelClass}>Description</label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className={`${fieldClass} resize-none`}
                            placeholder="Pain reliever and fever reducer"
                        />
                        {errors.description && (
                            <p className={errorClass}>{errors.description.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Company</label>
                            <input
                                {...register("company")}
                                className={fieldClass}
                                placeholder="Square Pharmaceuticals"
                            />
                            {errors.company && (
                                <p className={errorClass}>{errors.company.message}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Class</label>
                            <input
                                {...register("class")}
                                className={fieldClass}
                                placeholder="Analgesic"
                            />
                            {errors.class && (
                                <p className={errorClass}>{errors.class.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Price</label>
                            <input
                                {...register("price", { valueAsNumber: true })}
                                type="number"
                                min="0"
                                step="0.01"
                                className={fieldClass}
                                placeholder="12.50"
                            />
                            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Image URL</label>
                            <input
                                {...register("imageUrl")}
                                className={fieldClass}
                                placeholder="https://example.com/images/paracetamol.jpg"
                            />
                            {errors.imageUrl && (
                                <p className={errorClass}>{errors.imageUrl.message}</p>
                            )}
                        </div>
                    </div>
                </form>
            </AppModal>
        </>
    );
}
