"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  useGetAdminMessagesQuery, 
  useUpdateMessageStatusMutation 
} from "@/store/fmdApi";
import { Button } from "@/shared/components/ui/Button";
import { AppModal } from "@/components/common/AppModal";

export default function AdminMessagesPage() {
  const [page, setPage] = useState(1);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const limit = 10;

  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetAdminMessagesQuery({ page, limit }, { 
    pollingInterval: 5000 
  });

  const [updateStatus] = useUpdateMessageStatusMutation();

  const messages = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function markAsRead(id: number) {
    try {
      await updateStatus({ id, status: "read" }).unwrap();
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function markAsReplied(id: number) {
    try {
      await updateStatus({ id, status: "replied" }).unwrap();
      toast.success("Marked as replied");
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Messages</h1>
          <p className="text-sm text-gray-500">Manage user inquiries and support requests</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mr-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Auto-refreshing every 5s
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing..." : "🔄 Refresh Now"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Sender</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Phone</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Message Preview</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading messages...
                  </td>
                </tr>
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No messages found.
                  </td>
                </tr>
              ) : (
                messages.map((msg: any) => (
                  <tr key={msg.id} className={`hover:bg-gray-50 transition ${msg.status === 'pending' ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{msg.senderName}</td>
                    <td className="px-6 py-4 text-gray-600">{msg.senderPhone}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{msg.message}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        msg.status === 'pending' ? 'bg-blue-100 text-blue-700' : 
                        msg.status === 'read' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedMsg(msg)} className="text-blue-600 hover:underline font-medium">View</button>
                        {msg.status === 'pending' && (
                          <button onClick={() => markAsRead(msg.id)} className="text-xs text-gray-500 hover:text-blue-600 hover:underline">Mark Read</button>
                        )}
                        {msg.status === 'read' && (
                          <button onClick={() => markAsReplied(msg.id)} className="text-xs text-gray-500 hover:text-green-600 hover:underline">Mark Replied</button>
                        )}
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {selectedMsg && (
        <AppModal 
          isOpen={!!selectedMsg} 
          onClose={() => setSelectedMsg(null)} 
          title={`Message from ${selectedMsg.senderName}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setSelectedMsg(null)}>Close</Button>
              {selectedMsg.status === 'pending' && (
                <Button onClick={() => { markAsRead(selectedMsg.id); setSelectedMsg(null); }}>Mark as Read</Button>
              )}
              {selectedMsg.status === 'read' && (
                <Button onClick={() => { markAsReplied(selectedMsg.id); setSelectedMsg(null); }}>Mark as Replied</Button>
              )}
            </>
          }
        >
          <div className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Sender Name</p>
                <p className="font-semibold">{selectedMsg.senderName}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone Number</p>
                <p className="font-semibold">{selectedMsg.senderPhone}</p>
              </div>
              <div>
                <p className="text-gray-500">Received At</p>
                <p className="font-semibold">{new Date(selectedMsg.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-semibold uppercase">{selectedMsg.status}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Message</p>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedMsg.message}</p>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}
