"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDoctorQuery,
  useUpdateDoctorProfileMutation,
} from "@/store/fmdApi";

export default function DoctorProfilePage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const doctorId = user?.doctorId || undefined;

  const { data: doctor, isLoading } = useGetDoctorQuery(doctorId!, {
    skip: !doctorId,
  });
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateDoctorProfileMutation();

  const [name, setName] = useState("");
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState("");
  const [exp, setExp] = useState("0");
  const [fee, setFee] = useState("0");
  const [advanceFee, setAdvanceFee] = useState("0");
  const [degrees, setDegrees] = useState("");
  const [chamberAddress, setChamberAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    if (!doctor) return;
    setName(doctor.name);
    setHospital(doctor.hospital);
    setCity(doctor.city);
    setExp(String(doctor.exp));
    setFee(String(doctor.fee));
    setAdvanceFee(String(doctor.advanceFee));
    setDegrees(doctor.degrees);
    setChamberAddress(doctor.chamberAddress ?? "");
    setRoomNumber(doctor.roomNumber ?? "");
  }, [doctor]);

  if (!user) {
    router.push("/login");
    return null;
  }

  async function handleSave() {
    if (!doctorId) return;
    try {
      await updateProfile({
        id: doctorId,
        data: {
          name,
          hospital,
          city,
          exp: Number(exp),
          fee: Number(fee),
          advanceFee: Number(advanceFee),
          degrees,
          chamberAddress: chamberAddress || null,
          roomNumber: roomNumber || null,
        },
      }).unwrap();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  }

  const inputCls =
    "w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm";
  const labelCls = "text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">My Profile</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>
                Specialty:{" "}
                <span className="font-medium text-gray-900">
                  {doctor?.specialty?.name}
                </span>
              </span>
              <span>
                Rating:{" "}
                <span className="font-medium text-gray-900">
                  {doctor?.rating}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Hospital</label>
                <input
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Experience (years)</label>
                <input
                  type="number"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Consultation Fee</label>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Advance Fee</label>
                <input
                  type="number"
                  value={advanceFee}
                  onChange={(e) => setAdvanceFee(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Room Number</label>
                <input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Chamber Address</label>
                <input
                  value={chamberAddress}
                  onChange={(e) => setChamberAddress(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Degrees</label>
                <textarea
                  value={degrees}
                  onChange={(e) => setDegrees(e.target.value)}
                  rows={3}
                  className={inputCls}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
