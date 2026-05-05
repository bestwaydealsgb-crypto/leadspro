'use client';

import { useEffect, useState } from 'react';
import { ScanJob } from '@/types';

interface ScanProgressProps {
  scanId: string;
  onComplete?: () => void;
}

export function ScanProgress({ scanId, onComplete }: ScanProgressProps) {
  const [scan, setScan] = useState<ScanJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pollScan = async () => {
      try {
        const response = await fetch(`/api/scan?id=${scanId}`);
        const data = await response.json();
        setScan(data);

        if (data.status === 'COMPLETED') {
          onComplete?.();
          setLoading(false);
        } else if (data.status === 'FAILED') {
          setLoading(false);
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    };

    if (scanId) {
      pollScan();
      const interval = setInterval(pollScan, 2000);
      return () => clearInterval(interval);
    }
  }, [scanId, onComplete]);

  if (!scan) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Scan Progress</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{scan.progress}%</span>
          <span className="text-sm text-gray-600">{scan.current_action}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${scan.progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-xs text-gray-600">Found</p>
          <p className="text-2xl font-bold text-blue-600">{scan.total_found}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded">
          <p className="text-xs text-gray-600">Analyzing</p>
          <p className="text-2xl font-bold text-orange-600">{scan.total_analyzed}</p>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <p className="text-xs text-gray-600">Leads</p>
          <p className="text-2xl font-bold text-red-600">{scan.total_leads}</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-xs text-gray-600">Skipped</p>
          <p className="text-2xl font-bold text-green-600">{scan.total_skipped}</p>
        </div>
      </div>

      {scan.status === 'COMPLETED' && (
        <div className="bg-green-50 p-4 rounded border border-green-200 text-green-700">
          ✓ Scan completed successfully! {scan.total_leads} leads found.
        </div>
      )}
    </div>
  );
}
