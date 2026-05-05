'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { Lead } from '@/types';
import { Download, Trash2 } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    city: '',
    search: '',
    page: 1,
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page.toString());
      params.append('limit', '25');

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lead?')) {
      try {
        await fetch(`/api/leads/${id}`, { method: 'DELETE' });
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.city) params.append('city', filters.city);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/export?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export');
    }
  };

  const pages = Math.ceil(total / 25);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">All Leads</h1>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Search by name, city..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Status</option>
                <option value="NO_WEBSITE">No Website</option>
                <option value="BAD_WEBSITE">Bad Website</option>
                <option value="AVERAGE_WEBSITE">Average Website</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <button
                onClick={() =>
                  setFilters({
                    status: '',
                    priority: '',
                    city: '',
                    search: '',
                    page: 1,
                  })
                }
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Leads Table */}
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : leads.length > 0 ? (
            <>
              <LeadsTable leads={leads} onDelete={handleDelete} />

              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`px-3 py-2 rounded ${
                      filters.page === page
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
              No leads found. Start a scan to find businesses!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
