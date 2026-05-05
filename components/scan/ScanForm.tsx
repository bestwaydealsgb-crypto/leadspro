'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface ScanFormProps {
  onScanStart?: (scanId: string) => void;
}

export function ScanForm({ onScanStart }: ScanFormProps) {
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!niche || !location) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, location }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to start scan'}`);
        return;
      }

      const data = await response.json();
      if (data.scanId) {
        onScanStart?.(data.scanId);
        setNiche('');
        setLocation('');
        alert('Scan started successfully!');
      } else {
        alert('No scan ID returned');
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to start scan'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Scan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Business Niche (e.g., Restaurants, Dentists)"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        />
        <input
          type="text"
          placeholder="City/Location (e.g., Karachi, Lahore)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
        />
        <button
          onClick={handleScan}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="w-5 h-5" />
          {loading ? 'Scanning...' : 'Start Scanning'}
        </button>
      </div>
    </div>
  );
}
