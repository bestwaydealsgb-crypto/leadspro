'use client';

import { useEffect, useState } from 'react';
import { Lead, GeneratedMessage } from '@/types';
import { Header } from '@/components/layout/Header';
import { Phone, Mail, MapPin, Globe, Copy, MessageSquare } from 'lucide-react';

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<GeneratedMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'instagram' | 'sms'>('whatsapp');

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const response = await fetch(`/api/leads/${params.id}`);
      const data = await response.json();
      setLead(data);
      fetchMessages();
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?leadId=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const generateMessages = async () => {
    setGeneratingMessages(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: params.id }),
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error generating messages:', error);
      alert('Failed to generate messages');
    } finally {
      setGeneratingMessages(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Lead not found</div>;

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-600';
    if (score >= 75) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h1 className="text-3xl font-bold mb-2">{lead.business_name}</h1>
            <div className="flex gap-4 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {lead.business_category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {lead.city}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                lead.lead_priority === 'HIGH'
                  ? 'bg-red-100 text-red-800'
                  : lead.lead_priority === 'MEDIUM'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
              }`}>
                Priority: {lead.lead_priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Website Analysis */}
              {lead.website_url && (
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold mb-4">Website Analysis</h2>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(lead.website_score)}`}>
                        {lead.website_score || 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Overall</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {lead.mobile_score || '—'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Mobile</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {lead.desktop_score || '—'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Desktop</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {lead.seo_score || '—'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">SEO</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {lead.design_score || '—'}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Design</p>
                    </div>
                  </div>

                  {/* Issues */}
                  {lead.issues_found.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Issues Found:</h3>
                      <ul className="space-y-1">
                        {lead.issues_found.map((issue, i) => (
                          <li key={i} className="text-red-600 text-sm flex items-start gap-2">
                            <span className="mt-1">✕</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* AI Messages */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">AI Generated Messages</h2>
                  <button
                    onClick={generateMessages}
                    disabled={generatingMessages}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-semibold rounded-lg"
                  >
                    {generatingMessages ? 'Generating...' : 'Generate Messages'}
                  </button>
                </div>

                {messages ? (
                  <>
                    <div className="flex gap-2 mb-4 border-b border-gray-200">
                      {(['whatsapp', 'email', 'instagram', 'sms'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                            activeTab === tab
                              ? 'border-yellow-500 text-yellow-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4 min-h-32">
                      {activeTab === 'whatsapp' && (
                        <p className="text-sm whitespace-pre-wrap">{messages.whatsapp}</p>
                      )}
                      {activeTab === 'email' && (
                        <div>
                          <p className="text-sm font-semibold mb-2">Subject: {messages.email_subject}</p>
                          <p className="text-sm whitespace-pre-wrap">{messages.email_body}</p>
                        </div>
                      )}
                      {activeTab === 'instagram' && (
                        <p className="text-sm whitespace-pre-wrap">{messages.instagram_dm}</p>
                      )}
                      {activeTab === 'sms' && (
                        <p className="text-sm whitespace-pre-wrap">{messages.sms}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        const text =
                          activeTab === 'email'
                            ? `${messages.email_subject}\n\n${messages.email_body}`
                            : activeTab === 'whatsapp'
                              ? messages.whatsapp
                              : activeTab === 'instagram'
                                ? messages.instagram_dm
                                : messages.sms;
                        copyToClipboard(text);
                      }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Message
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600">No messages generated yet. Click "Generate Messages" to create them.</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Contact Info</h2>

                {lead.phone_numbers.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-sm">Phone Numbers</p>
                    </div>
                    {lead.phone_numbers.map((phone, i) => (
                      <a
                        key={i}
                        href={`tel:${phone}`}
                        className="block text-blue-600 hover:underline text-sm mb-1"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                )}

                {lead.email_addresses.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-sm">Email Addresses</p>
                    </div>
                    {lead.email_addresses.map((email, i) => (
                      <a
                        key={i}
                        href={`mailto:${email}`}
                        className="block text-blue-600 hover:underline text-sm mb-1"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                )}

                {lead.whatsapp_number && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-2">WhatsApp</p>
                    <a
                      href={`https://wa.me/${lead.whatsapp_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {lead.whatsapp_number}
                    </a>
                  </div>
                )}

                {lead.facebook_url && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-2">Facebook</p>
                    <a
                      href={lead.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {lead.facebook_url}
                    </a>
                  </div>
                )}

                {lead.instagram_url && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-2">Instagram</p>
                    <a
                      href={lead.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {lead.instagram_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Business Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Business Info</h2>

                {lead.address && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-sm">Address</p>
                    </div>
                    <p className="text-sm text-gray-700">{lead.address}</p>
                  </div>
                )}

                {lead.website_url && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <p className="font-semibold text-sm">Website</p>
                    </div>
                    <a
                      href={lead.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm break-all"
                    >
                      {lead.website_url}
                    </a>
                  </div>
                )}

                {lead.owner_name && (
                  <div className="mb-4">
                    <p className="font-semibold text-sm mb-1">Owner</p>
                    <p className="text-sm text-gray-700">{lead.owner_name}</p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-semibold text-sm mb-1">Status</p>
                  <p className="text-sm text-gray-700">{lead.lead_status.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
