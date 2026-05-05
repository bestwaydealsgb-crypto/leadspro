'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Home, Search, Users, MessageSquare, BarChart3, Settings, CheckCircle } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/scan', icon: Search, label: 'New Scan' },
    { href: '/leads', icon: Users, label: 'All Leads' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/export', icon: BarChart3, label: 'Export' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    { href: '/setup', icon: CheckCircle, label: 'Setup' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <Zap className="w-8 h-8 text-yellow-400" />
        <h1 className="text-2xl font-bold">LeadHunter Pro</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-yellow-500 text-slate-900 font-semibold'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom Stats */}
      <div className="border-t border-slate-700 pt-4">
        <div className="text-sm text-gray-400">
          <p className="mb-2">Total Leads</p>
          <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>
    </div>
  );
}
