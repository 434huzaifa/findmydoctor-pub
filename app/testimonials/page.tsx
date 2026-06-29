import React from 'react';
import { Card } from '@/shared/components/ui/Card';

const testimonials = [
  {
    name: "Rahim Ahmed",
    role: "Patient",
    text: "The process of finding a doctor and booking an appointment was incredibly smooth. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sumi Akter",
    role: "Patient",
    text: "Ordered medicines and received them within 2 hours. The pharmacy service is top-notch.",
    rating: 5,
  },
  {
    name: "Kamal Hossain",
    role: "Patient",
    text: "The home doctor service saved us during an emergency. Very professional and caring doctors.",
    rating: 4,
  },
  {
    name: "Fatima Begum",
    role: "Patient",
    text: "Great platform for healthcare in Bangladesh. It makes everything so accessible.",
    rating: 5,
  },
];

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[color:var(--text)] sm:text-4xl">
          What Our Patients Say
        </h1>
        <p className="mt-4 text-lg text-[color:var(--text-muted)]">
          Hear from the thousands of patients who trust us with their health.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <Card key={i} className="p-6 flex flex-col h-full">
            <div className="flex gap-1 mb-4 text-yellow-400">
              {[...Array(t.rating)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p className="text-gray-600 italic mb-6 flex-1">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                {t.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
