'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function SetupPage() {
  const [checks, setChecks] = useState<{
    [key: string]: 'pending' | 'success' | 'error';
  }>({
    supabase_url: 'pending',
    supabase_key: 'pending',
    openai_key: 'pending',
    database_connection: 'pending',
    database_tables: 'pending',
  });

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = async () => {
    // Check 1: Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    setChecks((prev) => ({
      ...prev,
      supabase_url: supabaseUrl ? 'success' : 'error',
    }));

    // Check 2: Supabase Key
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setChecks((prev) => ({
      ...prev,
      supabase_key: supabaseKey ? 'success' : 'error',
    }));

    // Check 3: OpenAI Key
    const openaiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    setChecks((prev) => ({
      ...prev,
      openai_key: openaiKey ? 'success' : 'error',
    }));

    // Check 4: Database Connection
    try {
      const response = await fetch('/api/check-db', { method: 'GET' });
      const data = await response.json();
      setChecks((prev) => ({
        ...prev,
        database_connection: data.connected ? 'success' : 'error',
      }));
    } catch (error) {
      console.error('Database connection check failed:', error);
      setChecks((prev) => ({
        ...prev,
        database_connection: 'error',
      }));
    }

    // Check 5: Database Tables
    try {
      const response = await fetch('/api/check-tables', { method: 'GET' });
      const data = await response.json();
      setChecks((prev) => ({
        ...prev,
        database_tables: data.tables_exist ? 'success' : 'error',
      }));
    } catch (error) {
      console.error('Database tables check failed:', error);
      setChecks((prev) => ({
        ...prev,
        database_tables: 'error',
      }));
    }
  };

  const getIcon = (status: string) => {
    if (status === 'pending') {
      return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const allChecksPass = Object.values(checks).every((v) => v === 'success');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Setup Checker</h1>
        <p className="text-gray-600 mb-8">
          Verify that your LeadHunter Pro is properly configured
        </p>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration Status</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(checks.supabase_url)}
                <span className="font-medium text-gray-900">Supabase URL</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  checks.supabase_url === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {checks.supabase_url === 'success' ? 'Configured' : 'Missing'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(checks.supabase_key)}
                <span className="font-medium text-gray-900">Supabase API Key</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  checks.supabase_key === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {checks.supabase_key === 'success' ? 'Configured' : 'Missing'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(checks.openai_key)}
                <span className="font-medium text-gray-900">OpenAI API Key</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  checks.openai_key === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {checks.openai_key === 'success' ? 'Configured' : 'Missing'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(checks.database_connection)}
                <span className="font-medium text-gray-900">Database Connection</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  checks.database_connection === 'success'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {checks.database_connection === 'success' ? 'Connected' : 'Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(checks.database_tables)}
                <span className="font-medium text-gray-900">Database Tables</span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  checks.database_tables === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {checks.database_tables === 'success' ? 'Exists' : 'Missing'}
              </span>
            </div>
          </div>
        </div>

        {allChecksPass ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Everything is set up!</h3>
            </div>
            <p className="text-green-700">
              You can now go to the dashboard and start scanning for leads.
            </p>
            <a
              href="/dashboard"
              className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="font-semibold text-red-900">Setup Required</h3>
            </div>
            <p className="text-red-700 mb-4">
              Please fix the issues above before using the application.
            </p>

            <div className="space-y-4 text-sm text-red-700">
              <div>
                <h4 className="font-semibold mb-2">Steps to Fix:</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Copy `.env.example` to `.env.local` in your project root
                  </li>
                  <li>
                    Go to <a href="https://supabase.com" className="underline">Supabase.com</a> and create a new project
                  </li>
                  <li>
                    Add your Supabase URL and API key to `.env.local`
                  </li>
                  <li>
                    Run the SQL initialization script in Supabase SQL editor
                  </li>
                  <li>
                    Add your OpenAI API key to `.env.local`
                  </li>
                  <li>
                    Restart the development server: `npm run dev`
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Environment Variables (.env.local)</h3>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded text-xs overflow-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
SERPAPI_KEY=your_serpapi_key (optional)
SCRAPERAPI_KEY=your_scraperapi_key (optional)`}
          </pre>
        </div>
      </div>
    </div>
  );
}
