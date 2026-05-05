'use client';

import { Header } from '@/components/layout/Header';

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="bg-white p-8 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">API Configuration</h2>
            <p className="text-gray-600 mb-4">Configure your API keys in the .env.local file</p>
            <ul className="space-y-2 text-sm">
              <li>• NEXT_PUBLIC_SUPABASE_URL</li>
              <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>• OPENAI_API_KEY</li>
              <li>• SERPAPI_KEY</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
