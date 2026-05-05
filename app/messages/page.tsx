'use client';

import { Header } from '@/components/layout/Header';

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            <p>Message management coming soon. View and manage AI-generated messages for each lead from the Lead Details page.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
