import React from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';

const dummyMessages = [
  {
    id: 1,
    sender: "Rahim Ahmed",
    email: "rahim@example.com",
    subject: "Booking Issue",
    message: "I tried to book an appointment with Dr. Smith but it says the slot is full. Is there any other time?",
    date: "2026-06-28",
    status: "unread",
  },
  {
    id: 2,
    sender: "Sumi Akter",
    email: "sumi@example.com",
    subject: "Medicine Delivery",
    message: "My order #12345 hasn't arrived yet. Please check the status.",
    date: "2026-06-27",
    status: "read",
  },
  {
    id: 3,
    sender: "Kamal Hossain",
    email: "kamal@example.com",
    subject: "Home Visit Request",
    message: "I need a home visit for my elderly father tomorrow morning. How do I schedule this?",
    date: "2026-06-26",
    status: "unread",
  },
];

export default function AdminMessagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Messages</h1>
          <p className="text-gray-500">Manage and respond to patient inquiries</p>
        </div>
        <Button variant="outline">Export to CSV</Button>
      </div>

      <div className="grid gap-4">
        {dummyMessages.map((msg) => (
          <Card key={msg.id} className="p-6 hover:border-teal-500 transition-colors cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{msg.sender}</h3>
                  <Badge variant={msg.status === 'unread' ? 'default' : 'outline'}>
                    {msg.status === 'unread' ? 'Unread' : 'Read'}
                  </Badge>
                  <span className="text-xs text-gray-400">{msg.date}</span>
                </div>
                <p className="font-medium text-gray-700 mb-2">{msg.subject}</p>
                <p className="text-gray-600 line-clamp-2 text-sm">{msg.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">View</Button>
                <Button size="sm">Reply</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
