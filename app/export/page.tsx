'use client';

import { Header } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

export default function ExportPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Export Leads</h1>
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <p className="mb-4">Export your leads to Excel with multiple formatting options.</p>
            <button
              onClick={() => router.push('/leads')}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
            >
              Go to Leads and Export
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
