"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppModal } from "@/components/common/AppModal";
import {
    useCreateMedicineOrderMutation,
    useGetMedicinesQuery,
} from "@/store/fmdApi";
import { useAppDispatch } from "@/store/hooks";
import { setMedicineOrderInfo } from "@/store/bookingSlice";
import type { Medicine, MedicineListParams } from "@/types/domain";

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
    { value: "asc", label: "Price ↑" },
    { value: "desc", label: "Price ↓" },
];

function MedicineCard({
    medicine,
    onOrder,
}: {
    medicine: Medicine;
    onOrder: () => void;
}) {
    return (
        <div className="rounded-3xl border border-(--border) bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-3xl bg-(--teal-pale)">
                {medicine.imageUrl ? (
                    <img
                        src={medicine.imageUrl}
                        alt={medicine.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-(--teal) text-3xl font-black text-white">
                        {medicine.name.slice(0, 2).toUpperCase()}
                    </div>
                )}
            </div>
            <div className="space-y-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">
                        {medicine.class || "General"}
                    </p>
                    <h2 className="text-lg font-semibold text-(--text)">{medicine.name}</h2>
                </div>
                <p className="min-h-12 text-sm leading-6 text-(--text-muted)">
                    {medicine.description || "Effective medicine for your health needs."}
                </p>
                <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-(--text-muted)">{medicine.company || "Trusted brand"}</span>
                    <span className="font-semibold text-(--teal)">৳{medicine.price.toLocaleString()}</span>
                </div>
                <button
                    type="button"
                    onClick={onOrder}
                    className="mt-5 w-full rounded-2xl bg-(--teal) px-4 py-2 text-sm font-semibold text-white hover:bg-(--teal-light)"
                >
                    Order medicine
                </button>
            </div>
        </div>
    );
}

function MedicineList() {
    const [params, setParams] = useState<MedicineListParams>({ page: "1", limit: String(PAGE_SIZE), sort: "asc" });
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [guestPhone, setGuestPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("online");
    const [createMedicineOrder, { isLoading: isOrdering }] = useCreateMedicineOrderMutation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const queryParams = useMemo(() => {
        const result: MedicineListParams = { page: params.page, limit: params.limit };
        if (search.trim()) result.search = search.trim();
        if (classFilter.trim()) result.class = classFilter.trim();
        if (companyFilter.trim()) result.company = companyFilter.trim();
        if (params.sort) result.sort = params.sort;
        return result;
    }, [search, classFilter, companyFilter, params]);

    const { data, isFetching, isLoading } = useGetMedicinesQuery(queryParams);
    const medicines = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = data?.totalPages ?? 0;
    const activePage = Number(params.page);

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    function resetOrderForm() {
        setQuantity(1);
        setGuestPhone("");
    }

    async function submitOrder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!selectedMedicine) return;

        try {
            if (paymentMethod === "online") {
                toast.loading("Processing mock online payment...");
                await new Promise((resolve) => setTimeout(resolve, 1400));
                toast.dismiss();
                toast.success("Mock payment successful");
            }

            const result = await createMedicineOrder({
                medicineId: selectedMedicine.id,
                quantity,
                guestPhone: guestPhone.trim(),
                address: address.trim(),
            }).unwrap();
            dispatch(setMedicineOrderInfo(result));
            router.push("/success");
            resetOrderForm();
        } catch (error: unknown) {
            toast.error(
                (error as { data?: { message?: string } })?.data?.message ??
                "Failed to place medicine order",
            );
        }
    }

    function updateParam(key: keyof MedicineListParams, value: string) {
        setParams((prev) => ({ ...prev, [key]: value, page: key === "search" || key === "class" || key === "company" ? "1" : prev.page }));
    }

    return (
        <div className="px-[5%] py-12">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-(--teal)">Medicine Showcase</p>
                    <h1 className="mt-3 font-serif text-4xl font-black text-(--text)">Browse Medicines & Prices</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-muted)">
                        Explore all medicines available in the system, search by name, filter by class or company, and sort by price.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        placeholder="Search medicine..."
                        value={search}
                        onChange={(e) => updateParam("search", e.target.value)}
                        className="rounded-2xl border border-(--border) bg-white px-4 py-3 text-sm outline-none focus:border-(--teal)"
                    />
                    <input
                        placeholder="Class (e.g. Antibiotic)"
                        value={classFilter}
                        onChange={(e) => updateParam("class", e.target.value)}
                        className="rounded-2xl border border-(--border) bg-white px-4 py-3 text-sm outline-none focus:border-(--teal)"
                    />
                    <input
                        placeholder="Company"
                        value={companyFilter}
                        onChange={(e) => updateParam("company", e.target.value)}
                        className="rounded-2xl border border-(--border) bg-white px-4 py-3 text-sm outline-none focus:border-(--teal)"
                    />
                    <select
                        value={params.sort}
                        onChange={(e) => updateParam("sort", e.target.value)}
                        className="rounded-2xl border border-(--border) bg-white px-4 py-3 text-sm outline-none focus:border-(--teal)"
                    >
                        <option value="asc">Sort by Price</option>
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-(--text-muted)">
                <span>
                    Showing {medicines.length} of {total} medicines
                </span>
                <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setClassFilter("");
                        setCompanyFilter("");
                        setParams({ page: "1", limit: String(PAGE_SIZE), sort: params.sort ?? "asc" });
                    }}
                    className="rounded-full border border-(--border) px-4 py-2 text-xs font-semibold text-(--text) hover:border-(--teal) hover:text-(--teal)"
                >
                    Reset filters
                </button>
            </div>

            {isLoading || isFetching ? (
                <div className="rounded-3xl border border-(--border) bg-white p-10 text-center text-sm text-(--text-muted)">
                    Loading medicines...
                </div>
            ) : medicines.length === 0 ? (
                <div className="rounded-3xl border border-(--border) bg-white p-10 text-center text-sm text-(--text-muted)">
                    No medicines found. Try a different search or filter.
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {medicines.map((medicine) => (
                        <MedicineCard
                            key={medicine.id}
                            medicine={medicine}
                            onOrder={() => setSelectedMedicine(medicine)}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setParams((prev) => ({ ...prev, page: String(Math.max(Number(prev.page ?? "1") - 1, 1)) }))}
                        disabled={activePage <= 1}
                        className="rounded-xl border border-(--border) px-4 py-2 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {pageNumbers.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setParams((prev) => ({ ...prev, page: String(pageNumber) }))}
                            className={`rounded-xl px-4 py-2 text-sm ${pageNumber === activePage ? "bg-(--teal) text-white" : "border border-(--border) text-(--text)"}`}
                        >
                            {pageNumber}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => setParams((prev) => ({ ...prev, page: String(Math.min(Number(prev.page ?? "1") + 1, totalPages)) }))}
                        disabled={activePage >= totalPages}
                        className="rounded-xl border border-(--border) px-4 py-2 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            <AppModal
                open={selectedMedicine !== null}
                onClose={() => {
                    setSelectedMedicine(null);
                    resetOrderForm();
                }}
                title={selectedMedicine ? `Order ${selectedMedicine.name}` : "Order Medicine"}
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedMedicine(null);
                                resetOrderForm();
                            }}
                            className="rounded-lg border border-(--border) px-4 py-1.5 text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="medicine-order-form"
                            disabled={isOrdering}
                            className="rounded-lg bg-(--teal) px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {isOrdering ? "Placing order…" : "Place order"}
                        </button>
                    </>
                }
            >
                {selectedMedicine && (
                    <form
                        id="medicine-order-form"
                        onSubmit={submitOrder}
                        className="space-y-4"
                    >
                        <p className="text-sm text-(--text-muted)">
                            This order will be placed for <strong>{selectedMedicine.name}</strong>.
                        </p>
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-(--text-muted)">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                className="w-full rounded-lg border border-(--border) px-3 py-2 text-sm focus:border-(--teal) focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-(--text-muted)">
                                Phone number
                            </label>
                            <input
                                type="tel"
                                value={guestPhone}
                                onChange={(e) => setGuestPhone(e.target.value)}
                                className="w-full rounded-lg border border-(--border) px-3 py-2 text-sm focus:border-(--teal) focus:outline-none"
                                placeholder="01XXXXXXXXX"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-(--text-muted)">
                                Delivery address
                            </label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-(--border) px-3 py-2 text-sm focus:border-(--teal) focus:outline-none"
                                placeholder="House, road, area, city, postal code"
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-(--text-muted)">Payment method</p>
                            <div className="flex flex-col gap-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online"
                                        checked={paymentMethod === "online"}
                                        onChange={() => setPaymentMethod("online")}
                                        className="h-4 w-4 text-(--teal)"
                                    />
                                    Mock online payment
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash"
                                        checked={paymentMethod === "cash"}
                                        onChange={() => setPaymentMethod("cash")}
                                        className="h-4 w-4 text-(--teal)"
                                    />
                                    Cash on delivery
                                </label>
                            </div>
                        </div>
                    </form>
                )}
            </AppModal>
        </div>
    );
}

export default function MedicinePage() {
    return (
        <Suspense
            fallback={
                <div className="px-[5%] py-12 text-(--text-muted)">
                    Loading medicine showcase...
                </div>
            }
        >
            <MedicineList />
        </Suspense>
    );
}
