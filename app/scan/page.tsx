'use client';

import { Header } from '@/components/layout/Header';
import { ScanForm } from '@/components/scan/ScanForm';
import { ScanProgress } from '@/components/dashboard/ScanProgress';
import { useState } from 'react';

export default function ScanPage() {
  const [activeScanId, setActiveScanId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Start New Scan</h1>

          <ScanForm onScanStart={setActiveScanId} />

          {activeScanId && (
            <ScanProgress scanId={activeScanId} onComplete={() => setActiveScanId(null)} />
          )}
        </div>
      </main>
    </div>
  );
}
