'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types/events';
import { Contact } from '@/types';
import { useContacts } from '@/hooks/queries/useContacts';

interface EventInviteModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface InviteRecipient {
  id: string;
  name: string;
  email: string;
  type: 'contact' | 'team' | 'new';
}

// Email template IDs as provided by the user
const EMAIL_TEMPLATES = {
  presentation: {
    opportunity: {
      live: {
        en: '4ca32706-59d2-47fe-8fb0-de7e3f6fbc15',
        gr: '2cca8a5b-a2f4-4236-a953-3dcf1598c986'
      },
      online: {
        en: 'ad7cbaf8-d6cf-425d-bf3d-25e21087cb18',
        gr: 'e4ddd266-36d1-47dc-88f5-5d4aab684f09'
      }
    },
    product: {
      live: {
        en: '4ca32706-59d2-47fe-8fb0-de7e3f6fbc15', // Using same as opportunity for now
        gr: '2cca8a5b-a2f4-4236-a953-3dcf1598c986'
      },
      online: {
        en: 'ad7cbaf8-d6cf-425d-bf3d-25e21087cb18',
        gr: 'e4ddd266-36d1-47dc-88f5-5d4aab684f09'
      }
    }
  },
  training: {
    en: '29136692-427c-4013-af4c-3dcd6768b7fc',
    gr: '7c320974-7552-4e0c-8cd1-8dd3d47728de'
  }
};

export default function EventInviteModal({ 
  event, 
  isOpen, 
  onClose, 
  onSuccess 
}: EventInviteModalProps) {
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'team' | 'new'>('contacts');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'gr'>('en');
  const [selectedRecipients, setSelectedRecipients] = useState<InviteRecipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // New contact form
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: isLoadingContacts } = useContacts({
    searchQuery: searchQuery
  });

  // Fetch team members
  useEffect(() => {
    if (selectedTab === 'team' && isOpen) {
      fetchTeamMembers();
    }
  }, [selectedTab, isOpen]);

  const fetchTeamMembers = async () => {
    setIsLoadingTeam(true);
    try {
      const response = await fetch('/api/team/downline');
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data?.members || []);
      } else {
        console.error('Failed to fetch team members - API response not ok');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const getEmailTemplateId = () => {
    if (!event) return null;

    const isTraining = event.event_type === 'training_workshop';
    const isOnline = event.format === 'online';
    
    if (isTraining) {
      return EMAIL_TEMPLATES.training[selectedLanguage];
    }

    const presentationType = event.event_type === 'opportunity_presentation' ? 'opportunity' : 'product';
    const formatType = isOnline ? 'online' : 'live';
    
    return EMAIL_TEMPLATES.presentation[presentationType][formatType][selectedLanguage];
  };

  const handleRecipientToggle = (recipient: InviteRecipient) => {
    setSelectedRecipients(prev => {
      const exists = prev.find(r => r.id === recipient.id && r.type === recipient.type);
      if (exists) {
        return prev.filter(r => !(r.id === recipient.id && r.type === recipient.type));
      } else {
        return [...prev, recipient];
      }
    });
  };

  const handleAddNewContact = () => {
    if (newContact.name && newContact.email) {
      const recipient: InviteRecipient = {
        id: `new-${Date.now()}`,
        name: newContact.name,
        email: newContact.email,
        type: 'new'
      };
      setSelectedRecipients(prev => [...prev, recipient]);
      setNewContact({ name: '', email: '', phone: '' });
    }
  };

  const handleSendInvites = async () => {
    if (!event || selectedRecipients.length === 0) return;

    setIsSending(true);
    try {
      const templateId = getEmailTemplateId();
      
      // Group recipients by type for different API calls
      const contactInvites = selectedRecipients.filter(r => r.type === 'contact');
      const teamInvites = selectedRecipients.filter(r => r.type === 'team');
      const newContacts = selectedRecipients.filter(r => r.type === 'new');

      // First, create new contacts
      for (const newContactData of newContacts) {
        try {
          const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newContactData.name,
              email: newContactData.email,
              status: 'lead'
            })
          });
          
          if (!response.ok) {
            console.error(`Failed to create contact: ${newContactData.name}`);
          }
        } catch (error) {
          console.error(`Error creating contact ${newContactData.name}:`, error);
        }
      }

      // Send invitations
      const response = await fetch('/api/events/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          recipients: selectedRecipients.map(r => ({
            id: r.id,
            email: r.email,
            name: r.name,
            type: r.type
          })),
          language: selectedLanguage,
          templateId: templateId
        })
      });

      if (response.ok) {
        console.log('Invitations sent successfully!');
        onSuccess?.();
        onClose();
        // Reset form
        setSelectedRecipients([]);
        setSelectedTab('contacts');
        setSearchQuery('');
      } else {
        const error = await response.json();
        console.error('Failed to send invitations:', error);
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !event) return null;

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTeamMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-['Poppins']">
                📧 Invite People to Event
              </h1>
              <p className="text-blue-100">
                {event.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700">Invitation Language:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLanguage === 'en'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                🇺🇸 English
              </button>
              <button
                onClick={() => setSelectedLanguage('gr')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedLanguage === 'gr'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                🇬🇷 Greek
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedTab('contacts')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'contacts'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Contacts
            </button>
            <button
              onClick={() => setSelectedTab('team')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'team'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌟 My Team
            </button>
            <button
              onClick={() => setSelectedTab('new')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ➕ Add New
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Search Bar */}
          {(selectedTab === 'contacts' || selectedTab === 'team') && (
            <div className="relative mb-6">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Contacts Tab */}
          {selectedTab === 'contacts' && (
            <div className="space-y-3">
              {isLoadingContacts ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-slate-600 mt-2">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No contacts found</p>
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedRecipients.some(r => r.id === contact.id && r.type === 'contact');
                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleRecipientToggle({
                        id: contact.id,
                        name: contact.name,
                        email: contact.email || '',
                        type: 'contact'
                      })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{contact.name}</h3>
                            <p className="text-sm text-slate-600">{contact.email || 'No email'}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Team Tab */}
          {selectedTab === 'team' && (
            <div className="space-y-3">
              {isLoadingTeam ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-slate-600 mt-2">Loading team members...</p>
                </div>
              ) : filteredTeamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No team members found</p>
                </div>
              ) : (
                filteredTeamMembers.map((member) => {
                  const isSelected = selectedRecipients.some(r => r.id === member.id && r.type === 'team');
                  return (
                    <div
                      key={member.id}
                      onClick={() => handleRecipientToggle({
                        id: member.id,
                        name: member.name,
                        email: member.email || '',
                        type: 'team'
                      })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-600">{member.email || 'No email'}</p>
                            <p className="text-xs text-slate-500">@{member.username}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* New Contact Tab */}
          {selectedTab === 'new' && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Add New Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                  />
                </div>
                <button
                  onClick={handleAddNewContact}
                  disabled={!newContact.name || !newContact.email}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium 
                           rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➕ Add to Invite List
                </button>
              </div>

              {/* Added contacts preview */}
              {selectedRecipients.filter(r => r.type === 'new').length > 0 && (
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">New Contacts Added:</h4>
                  <div className="space-y-2">
                    {selectedRecipients.filter(r => r.type === 'new').map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div>
                          <p className="font-medium text-slate-900">{contact.name}</p>
                          <p className="text-sm text-slate-600">{contact.email || 'No email'}</p>
                        </div>
                        <button
                          onClick={() => setSelectedRecipients(prev => prev.filter(r => r.id !== contact.id))}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Recipients Summary */}
        {selectedRecipients.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {selectedRecipients.length} recipient{selectedRecipients.length > 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-slate-600">
                  Template: {selectedLanguage === 'en' ? 'English' : 'Greek'} • {event.event_type.replace('_', ' ')}
                </p>
              </div>
              <div className="flex -space-x-2">
                {selectedRecipients.slice(0, 5).map((recipient, index) => (
                  <div
                    key={`${recipient.id}-${recipient.type}`}
                    className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                  >
                    {recipient.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {selectedRecipients.length > 5 && (
                  <div className="w-8 h-8 bg-slate-300 rounded-full border-2 border-white flex items-center justify-center text-slate-600 text-xs font-medium">
                    +{selectedRecipients.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 bg-slate-100 border border-slate-300 font-medium 
                       rounded-xl hover:bg-slate-200 hover:border-slate-400 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvites}
              disabled={selectedRecipients.length === 0 || isSending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium 
                       rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95"
            >
              {isSending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending Invites...
                </div>
              ) : (
                `📧 Send ${selectedRecipients.length} Invitation${selectedRecipients.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 