"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
    useCreateAdminSpecialtyMutation,
} from "@/store/fmdApi";
import { AppModal } from "../common/AppModal";
const specialtySchema = z.object({
    name: z.string().min(1, "Name required"),
    icon: z.string().default(""),
});
type SpecialtyForm = z.input<typeof specialtySchema>;
type SpecialtyPayload = z.output<typeof specialtySchema>;
export function AddSpecialtyForm({ onSaved }: { onSaved: () => void }) {
    const [open, setOpen] = useState(false);
    const [createSpecialty, { isLoading }] = useCreateAdminSpecialtyMutation();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<z.input<typeof specialtySchema>>({
        resolver: zodResolver(specialtySchema),
    });

    async function onSubmit(data: SpecialtyForm) {
        try {
            const payload: SpecialtyPayload = specialtySchema.parse(data);
            await createSpecialty(payload).unwrap();
            toast.success(`Specialty "${payload.name}" added`);
            reset();
            setOpen(false);
            onSaved();
        } catch (e: unknown) {
            toast.error((e as { error?: string })?.error ?? "Failed");
        }
    }
    const inputCls =
        "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none";
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-[color:var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]"
            >
                + Add Specialty
            </button>
            <AppModal
                open={open}
                onClose={() => setOpen(false)}
                title="Add Specialty"
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
                            form="specialty-form"
                            disabled={isLoading}
                            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isLoading ? "Adding…" : "Add"}
                        </button>
                    </>
                }
            >
                <form
                    id="specialty-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-3"
                >
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[color:var(--text-muted)]">
                            Name
                        </label>
                        <input
                            {...register("name")}
                            placeholder="e.g. Cardiology"
                            className={inputCls}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[color:var(--text-muted)]">
                            Icon (emoji)
                        </label>
                        <input
                            {...register("icon")}
                            placeholder="e.g. ❤️"
                            className={inputCls}
                        />
                    </div>
                </form>
            </AppModal>
        </>
    );
}