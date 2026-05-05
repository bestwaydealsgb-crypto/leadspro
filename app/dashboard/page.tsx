'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ScanForm } from '@/components/scan/ScanForm';
import { ScanProgress } from '@/components/dashboard/ScanProgress';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { Lead } from '@/types';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    no_website: 0,
    bad_website: 0,
    contacted: 0,
  });
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentLeads();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads?limit=1000');
      const data = await response.json();

      const no_website = data.leads?.filter((l: Lead) => l.lead_status === 'NO_WEBSITE').length || 0;
      const bad_website = data.leads?.filter((l: Lead) => l.lead_status === 'BAD_WEBSITE').length || 0;
      const contacted = data.leads?.filter((l: Lead) => l.outreach_status === 'CONTACTED').length || 0;

      setStats({
        total: data.total || 0,
        no_website,
        bad_website,
        contacted,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentLeads = async () => {
    try {
      const response = await fetch('/api/leads?limit=10&sortBy=created_at&sortOrder=desc');
      const data = await response.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = () => {
    setActiveScanId(null);
    fetchStats();
    fetchRecentLeads();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

          {/* Stats */}
          <StatsCards
            totalLeads={stats.total}
            noWebsite={stats.no_website}
            badWebsite={stats.bad_website}
            contacted={stats.contacted}
          />

          {/* Scan Form */}
          <ScanForm onScanStart={setActiveScanId} />

          {/* Scan Progress */}
          {activeScanId && (
            <ScanProgress scanId={activeScanId} onComplete={handleScanComplete} />
          )}

          {/* Recent Leads */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : leads.length > 0 ? (
              <LeadsTable leads={leads} />
            ) : (
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
                No leads found. Start a scan to find businesses!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
