"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAdminReviewsQuery,
  useDeleteAdminReviewMutation,
} from "@/store/fmdApi";
import { Button } from "@/shared/components/ui/Button";
import { AppModal } from "@/components/common/AppModal";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Record<string, any> | null>(null);
  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useGetAdminReviewsQuery({ page, limit });
  const [deleteReview, { isLoading: isDeleting }] = useDeleteAdminReviewMutation();

  const reviews = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleDelete(id: number) {
    try {
      await deleteReview(id).unwrap();
      toast.success("Review deleted");
      setSelectedReview(null);
    } catch {
      toast.error("Failed to delete review");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
          <p className="text-sm text-gray-500">Moderate patient ratings and feedback</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "🔄 Refresh"}
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Patient</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Doctor</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Rating</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Comment</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review: any) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">{review.patientName}</td>
                    <td className="px-6 py-4 text-gray-600">{review.doctor?.name ?? `#${review.doctorId}`}</td>
                    <td className="px-6 py-4">{"⭐".repeat(review.rating)}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{review.comment || "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(review.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedReview(review)} className="text-blue-600 hover:underline font-medium">
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={isDeleting}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages} ({data?.total ?? 0} total)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedReview && (
        <AppModal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title={`Review by ${selectedReview.patientName}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedReview(null)}>Close</Button>
              <Button onClick={() => handleDelete(selectedReview.id)} disabled={isDeleting}>
                Delete Review
              </Button>
            </>
          }
        >
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Patient</p>
                <p className="font-semibold">{selectedReview.patientName}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold">{selectedReview.patientPhone}</p>
              </div>
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-semibold">{selectedReview.doctor?.name ?? `#${selectedReview.doctorId}`}</p>
              </div>
              <div>
                <p className="text-gray-500">Rating</p>
                <p className="font-semibold">{"⭐".repeat(selectedReview.rating)}</p>
              </div>
            </div>
            {selectedReview.comment && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Comment</p>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedReview.comment}</p>
              </div>
            )}
          </div>
        </AppModal>
      )}
    </div>
  );
}
