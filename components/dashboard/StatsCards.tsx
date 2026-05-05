'use client';

import { TrendingUp, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  totalLeads: number;
  noWebsite: number;
  badWebsite: number;
  contacted: number;
}

export function StatsCards({ totalLeads, noWebsite, badWebsite, contacted }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: TrendingUp,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'No Website',
      value: noWebsite,
      icon: AlertCircle,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Bad Website',
      value: badWebsite,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Contacted',
      value: contacted,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className={`${card.bgColor} p-6 rounded-lg border border-gray-200`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 ${card.textColor}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
