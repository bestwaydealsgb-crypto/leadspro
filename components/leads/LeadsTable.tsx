'use client';

import Link from 'next/link';
import { Lead } from '@/types';
import { Phone, Mail, Trash2, Eye } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  onDelete?: (id: string) => void;
}

export function LeadsTable({ leads, onDelete }: LeadsTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NO_WEBSITE':
        return 'bg-red-100 text-red-800';
      case 'BAD_WEBSITE':
        return 'bg-orange-100 text-orange-800';
      case 'AVERAGE_WEBSITE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-600';
    if (score >= 75) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
              Business Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">City</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{lead.business_name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{lead.city}</td>
              <td className={`px-6 py-4 text-sm font-semibold ${getScoreColor(lead.website_score)}`}>
                {lead.website_score ? `${lead.website_score}/100` : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.lead_status)}`}>
                  {lead.lead_status.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-2 py-1 text-xs font-semibold ${
                  lead.lead_priority === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : lead.lead_priority === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {lead.lead_priority}
                </span>
              </td>
              <td className="px-6 py-4 text-sm space-x-2">
                <Link href={`/leads/${lead.id}`}>
                  <button className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
