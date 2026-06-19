"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {

    useGetAdminSpecialtiesQuery,
    useCreateAdminDoctorMutation,
} from "@/store/fmdApi";
import { useAppSelector } from "@/store/hooks";
import { AppModal } from "@/components/common/AppModal";
import { RRuleBuilder } from "@/components/common/RRuleBuilder";
import z from "zod";
const doctorSchema = z.object({
    name: z.string().min(1, "Name required"),
    email: z.email("Valid email required"),
    password: z.string().min(6, "Min 6 characters"),
    specialtyId: z.coerce.number().int().positive("Select a specialty"),
    hospital: z.string().min(1, "Required"),
    city: z.string().min(1, "Required"),
    chamberAddress: z.string().optional(),
    exp: z.coerce.number().int().nonnegative(),
    fee: z.coerce.number().int().nonnegative(),
    advanceFee: z.coerce.number().int().nonnegative().default(0),
    totalSeats: z.coerce.number().int().positive(),
    rating: z.coerce.number().min(0).max(5).default(4.5),
    degrees: z.string().optional(),
});
type DoctorForm = z.input<typeof doctorSchema>;
type DoctorPayload = z.output<typeof doctorSchema>;

function generatePassword(len = 12) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    return Array.from(
        { length: len },
        () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
}
export function AddDoctorModal({ onSaved }: { onSaved: () => void }) {
    const [open, setOpen] = useState(false);
    const [rrule, setRrule] = useState("");
    const [openTime, setOpenTime] = useState("09:00");
    const [closeTime, setCloseTime] = useState("17:00");
    const token = useAppSelector((s) => s.auth.token);
    const [createDoctor, { isLoading }] = useCreateAdminDoctorMutation();
    const {
        data: specialties,
        isFetching: isSpecialtiesLoading,
        isError: isSpecialtiesError,
        refetch: refetchSpecialties,
    } = useGetAdminSpecialtiesQuery(undefined, {
        skip: !open || !token,
        refetchOnMountOrArgChange: true,
    });
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<DoctorForm>({ resolver: zodResolver(doctorSchema) });

    function handleClose() {
        setOpen(false);
        reset();
        setRrule("");
    }

    useEffect(() => {
        if (open && token) {
            refetchSpecialties();
        }
    }, [open, token, refetchSpecialties]);

    async function onSubmit(data: DoctorForm) {
        try {
            const payload: DoctorPayload = doctorSchema.parse(data);
            await createDoctor({
                ...payload,
                chamberAddress: payload.chamberAddress || null,
                degrees: payload.degrees || "",
                usedSeats: 0,
                rrule: rrule || null,
                chamberOpenTime: rrule ? openTime : null,
                chamberCloseTime: rrule ? closeTime : null,
            }).unwrap();
            toast.success(`Dr. ${payload.name} added`);
            handleClose();
            onSaved();
        } catch (e: unknown) {
            toast.error((e as { error?: string })?.error ?? "Failed to add doctor");
        }
    }

    const iCls =
        "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none";
    const lCls = "text-xs font-medium text-[color:var(--text-muted)]";
    const fCls = "flex flex-col gap-1";
    const eCls = "text-xs text-red-500";

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-[color:var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]"
            >
                + Add Doctor
            </button>
            <AppModal
                open={open}
                onClose={handleClose}
                title="Add Doctor"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="doctor-form"
                            disabled={isLoading}
                            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isLoading ? "Adding…" : "Add Doctor"}
                        </button>
                    </>
                }
            >
                <form
                    id="doctor-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="max-h-[65vh] overflow-y-auto space-y-3 pr-1"
                >
                    <div className={fCls}>
                        <label className={lCls}>Full name</label>
                        <input
                            {...register("name")}
                            placeholder="Dr. John Doe"
                            className={iCls}
                        />
                        {errors.name && <p className={eCls}>{errors.name.message}</p>}
                    </div>
                    <div className={fCls}>
                        <label className={lCls}>Login email</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="doctor@hospital.com"
                            className={iCls}
                        />
                        {errors.email && <p className={eCls}>{errors.email.message}</p>}
                    </div>
                    <div className={fCls}>
                        <label className={lCls}>Password</label>
                        <div className="flex gap-2">
                            <input
                                {...register("password")}
                                type="text"
                                placeholder="Min 6 characters"
                                className={`${iCls} flex-1`}
                            />
                            <button
                                type="button"
                                onClick={() => setValue("password", generatePassword())}
                                className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)] whitespace-nowrap"
                            >
                                Generate
                            </button>
                        </div>
                        {errors.password && (
                            <p className={eCls}>{errors.password.message}</p>
                        )}
                    </div>
                    <div className={fCls}>
                        <label className={lCls}>Specialty</label>
                        <select {...register("specialtyId")} className={iCls}>
                            <option value="">Select specialty…</option>
                            {isSpecialtiesLoading && <option value="">Loading specialties…</option>}
                            {specialties?.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.icon} {s.name}
                                </option>
                            ))}
                        </select>
                        {isSpecialtiesError && (
                            <p className={eCls}>Could not load specialties. Reopen the modal and try again.</p>
                        )}
                        {!isSpecialtiesLoading && !isSpecialtiesError && !specialties?.length && (
                            <p className={eCls}>No specialties available. Add a specialty first.</p>
                        )}
                        {errors.specialtyId && (
                            <p className={eCls}>{errors.specialtyId.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className={fCls}>
                            <label className={lCls}>Hospital</label>
                            <input
                                {...register("hospital")}
                                placeholder="Hospital name"
                                className={iCls}
                            />
                            {errors.hospital && (
                                <p className={eCls}>{errors.hospital.message}</p>
                            )}
                        </div>
                        <div className={fCls}>
                            <label className={lCls}>City</label>
                            <input
                                {...register("city")}
                                placeholder="Dhaka"
                                className={iCls}
                            />
                            {errors.city && <p className={eCls}>{errors.city.message}</p>}
                        </div>
                    </div>
                    <div className={fCls}>
                        <label className={lCls}>Chamber address</label>
                        <input
                            {...register("chamberAddress")}
                            placeholder="Room 4, Block B…"
                            className={iCls}
                        />
                    </div>
                    <div className={fCls}>
                        <label className={lCls}>Degrees</label>
                        <input
                            {...register("degrees")}
                            placeholder="MBBS, FCPS"
                            className={iCls}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className={fCls}>
                            <label className={lCls}>Experience (years)</label>
                            <input
                                {...register("exp")}
                                type="number"
                                min={0}
                                className={iCls}
                            />
                        </div>
                        <div className={fCls}>
                            <label className={lCls}>Rating (0–5)</label>
                            <input
                                {...register("rating")}
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                className={iCls}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className={fCls}>
                            <label className={lCls}>Fee (৳)</label>
                            <input
                                {...register("fee")}
                                type="number"
                                min={0}
                                className={iCls}
                            />
                            {errors.fee && <p className={eCls}>{errors.fee.message}</p>}
                        </div>
                        <div className={fCls}>
                            <label className={lCls}>Advance (৳)</label>
                            <input
                                {...register("advanceFee")}
                                type="number"
                                min={0}
                                className={iCls}
                            />
                        </div>
                        <div className={fCls}>
                            <label className={lCls}>Total seats</label>
                            <input
                                {...register("totalSeats")}
                                type="number"
                                min={1}
                                className={iCls}
                            />
                            {errors.totalSeats && (
                                <p className={eCls}>{errors.totalSeats.message}</p>
                            )}
                        </div>
                    </div>
                    <RRuleBuilder
                        onChange={(r, ot, ct) => {
                            setRrule(r);
                            setOpenTime(ot);
                            setCloseTime(ct);
                        }}
                    />
                </form>
            </AppModal>
        </>
    );
}