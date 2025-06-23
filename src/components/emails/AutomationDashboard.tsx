'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  SparklesIcon,
  BoltIcon,
  EnvelopeIcon,
  UserGroupIcon,
  TrophyIcon,
  HeartIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

interface AutomationItem {
  id: string;
  member_id: string;
  contact_id: string | null;
  system_template_id: string;
  scheduled_for: string;
  processed_at: string | null;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error_message: string | null;
  system_email_templates: {
    name: string;
    trigger_event: string;
    language: string;
  };
  members: {
    name: string;
    email: string;
  };
  contact?: {
    name: string;
    email: string;
  };
}

interface AutomationSummary {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

const triggerIcons: Record<string, JSX.Element> = {
  member_welcome: <SparklesIcon className="w-5 h-5" />,
  sponsor_notification: <UserGroupIcon className="w-5 h-5" />,
  rank_achievement: <TrophyIcon className="w-5 h-5" />,
  member_reengagement: <HeartIcon className="w-5 h-5" />
};

const triggerColors: Record<string, string> = {
  member_welcome: 'from-purple-500 to-pink-500',
  sponsor_notification: 'from-blue-500 to-cyan-500',
  rank_achievement: 'from-yellow-500 to-orange-500',
  member_reengagement: 'from-red-500 to-pink-500'
};

const statusConfig = {
  pending: {
    icon: <ClockIcon className="w-5 h-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'Pending'
  },
  processing: {
    icon: <ArrowPathIcon className="w-5 h-5 animate-spin" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Processing'
  },
  sent: {
    icon: <CheckCircleSolidIcon className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Sent'
  },
  failed: {
    icon: <ExclamationCircleIcon className="w-5 h-5" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Failed'
  }
};

export default function AutomationDashboard() {
  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [summary, setSummary] = useState<AutomationSummary>({
    pending: 0,
    sent: 0,
    failed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  const fetchAutomations = async () => {
    try {
      const response = await fetch(`/api/automation/status?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setAutomations(data.automations);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch automations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('automation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'email_automation_queue'
        },
        () => {
          fetchAutomations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter, supabase]);

  const triggerProcessing = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-email-automation`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchAutomations();
      }
    } catch (error) {
      console.error('Failed to trigger processing:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
            <BoltIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
            <p className="text-gray-600">Automated emails that work while you sleep</p>
          </div>
        </div>
        <button
          onClick={triggerProcessing}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          <span>Process Queue</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Automations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary.total}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <EnvelopeIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{summary.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successfully Sent</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{summary.sent}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleSolidIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{summary.failed}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'pending', 'sent', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-medium capitalize transition-all duration-200 border-b-2 ${
              filter === status
                ? 'text-purple-600 border-purple-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Automation List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <ArrowPathIcon className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading automations...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No automations found</p>
          </div>
        ) : (
          automations.map((automation) => (
            <div
              key={automation.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Trigger Icon */}
                  <div className={`p-3 bg-gradient-to-br ${triggerColors[automation.system_email_templates.trigger_event] || 'from-gray-500 to-gray-600'} rounded-lg text-white`}>
                    {triggerIcons[automation.system_email_templates.trigger_event] || <EnvelopeIcon className="w-5 h-5" />}
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">
                      {automation.system_email_templates.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>To:</span>
                        <span className="font-medium">{automation.members.name}</span>
                        <span className="text-gray-400">({automation.members.email})</span>
                      </span>
                      {automation.contact && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center space-x-1">
                            <span>About:</span>
                            <span className="font-medium">{automation.contact.name}</span>
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Scheduled: {formatDistanceToNow(new Date(automation.scheduled_for), { addSuffix: true })}
                      </span>
                      {automation.processed_at && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span>
                            Processed: {formatDistanceToNow(new Date(automation.processed_at), { addSuffix: true })}
                          </span>
                        </>
                      )}
                    </div>
                    {automation.error_message && (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">{automation.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig[automation.status].bgColor}`}>
                  <span className={statusConfig[automation.status].color}>
                    {statusConfig[automation.status].icon}
                  </span>
                  <span className={`text-sm font-medium ${statusConfig[automation.status].color}`}>
                    {statusConfig[automation.status].label}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 