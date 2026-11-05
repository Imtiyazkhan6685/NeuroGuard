import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PartnerRole } from '../types';
import { openNativeSms, openNativeWhatsApp } from '../lib/nativeBridge';
import {
  Send,
  MessageSquare,
  Phone,
  User,
  CheckCircle,
  Plus,
  Trash2,
  Edit2,
  Users,
  CheckSquare,
  Square,
  HeartHandshake,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AccountabilityView: React.FC = () => {
  const {
    partners,
    selectedPartners,
    addPartner,
    removePartner,
    updatePartner,
    togglePartnerSelected,
    selectPreset,
    settings,
    triggerManualAlert,
    alerts,
    events,
    instagramCount,
    youtubeCount
  } = useApp();

  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // New partner form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<PartnerRole>('Best Friend');

  const roles: PartnerRole[] = ['Best Friend', 'Parent', 'Partner', 'Sibling', 'Mentor'];

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSendTestToAll = async () => {
    if (selectedPartners.length === 0) {
      showNotification('⚠️ Please select at least one contact to receive alerts!');
      return;
    }
    setIsSending(true);
    await triggerManualAlert();
    setIsSending(false);
    showNotification(`✅ Alert sent to ${selectedPartners.length} selected contact(s)!`);
  };

  const handleSingleSms = async (phone: string, name: string) => {
    const text = `🚨 NeuroGuard Alert: Your partner reached their daily limit of ${settings.dailyReelLimit} reels (${events.length} watched today: ${instagramCount} IG, ${youtubeCount} YT). Please call to check in!`;
    await openNativeSms(phone, text);
  };

  const handleSingleWhatsApp = async (phone: string, name: string) => {
    const text = `🚨 NeuroGuard Alert: Your partner reached their daily limit of ${settings.dailyReelLimit} reels (${events.length} watched today: ${instagramCount} IG, ${youtubeCount} YT). Please call to check in!`;
    await openNativeWhatsApp(phone, text);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      showNotification('Please enter both name and mobile number.');
      return;
    }
    addPartner({
      name: newName.trim(),
      phone: newPhone.trim(),
      role: newRole,
      relationshipTag: newRole,
      selected: true
    });
    setNewName('');
    setNewPhone('');
    setShowAddModal(false);
    showNotification(`Added ${newName} to accountability contacts!`);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-emerald-500/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-white/20 animate-fade-in flex items-center space-x-2">
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Social Accountability</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Accountability Contacts</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Select friends and parents who will automatically receive a message when you exceed your daily quota of reels.
        </p>
      </div>

      {/* Active Safeguard Status Banner */}
      <div className={`p-4 rounded-3xl ios-glass border transition-all ${
        selectedPartners.length > 0 ? 'border-purple-500/30 bg-purple-950/20' : 'border-amber-500/30 bg-amber-950/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              selectedPartners.length > 0 ? 'bg-purple-600/30 text-purple-300' : 'bg-amber-600/30 text-amber-300'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {selectedPartners.length > 0
                  ? `${selectedPartners.length} Contact${selectedPartners.length > 1 ? 's' : ''} Armed`
                  : 'No Contacts Armed'}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedPartners.length > 0
                  ? `Recipients: ${selectedPartners.map((p) => p.name).join(', ')}`
                  : 'Select at least one friend or parent below'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Quick Selection Presets */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">Quick Select Presets</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => selectPreset('all')}
            className="py-2 px-2 text-center rounded-2xl bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-purple-500/50 transition-all"
          >
            All Contacts
          </button>
          <button
            onClick={() => selectPreset('friends')}
            className="py-2 px-2 text-center rounded-2xl bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-pink-500/50 transition-all"
          >
            Friends Only
          </button>
          <button
            onClick={() => selectPreset('parents')}
            className="py-2 px-2 text-center rounded-2xl bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:border-blue-500/50 transition-all"
          >
            Parents Only
          </button>
          <button
            onClick={() => selectPreset('none')}
            className="py-2 px-2 text-center rounded-2xl bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Contact Cards List */}
      <div className="space-y-3">
        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">Contacts List</label>
        {partners.map((p) => {
          const isSelected = p.selected;
          const roleColor =
            p.role === 'Best Friend'
              ? 'text-pink-400 bg-pink-500/10 border-pink-500/20'
              : p.role === 'Parent'
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
              : 'text-purple-400 bg-purple-500/10 border-purple-500/20';

          return (
            <div
              key={p.id}
              className={`p-4 rounded-3xl ios-glass border transition-all ${
                isSelected ? 'border-purple-500/40 bg-zinc-900/90 shadow-md' : 'border-white/5 bg-zinc-900/40 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Select Toggle + Info */}
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => togglePartnerSelected(p.id)}
                    className="mt-0.5 text-zinc-400 hover:text-purple-400 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-purple-400" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleColor}`}>
                        {p.role}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.phone || 'No phone number set'}</span>
                    </div>

                    <div className="text-[11px] text-zinc-500 pt-0.5">
                      {isSelected ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Will receive automated alert at {settings.dailyReelLimit} reels
                        </span>
                      ) : (
                        <span className="text-zinc-500">Alerts muted for this contact</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleSingleSms(p.phone, p.name)}
                    title="Send SMS"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSingleWhatsApp(p.phone, p.name)}
                    title="Send WhatsApp"
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {partners.length > 1 && (
                    <button
                      onClick={() => removePartner(p.id)}
                      title="Delete Contact"
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Send Test Alert Button */}
      <button
        onClick={handleSendTestToAll}
        disabled={isSending || selectedPartners.length === 0}
        className={`w-full py-4 rounded-3xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all ${
          selectedPartners.length > 0
            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-purple-950/40 hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
        }`}
      >
        <Send className="w-4 h-4" />
        <span>
          {isSending
            ? 'Dispatching Alerts...'
            : `Send Test Alert to All ${selectedPartners.length} Selected Contact${selectedPartners.length !== 1 ? 's' : ''}`}
        </span>
      </button>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/15 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Add Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded-full bg-white/5"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium">Relationship Role</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        newRole === r
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex or Mom"
                  className="w-full bg-zinc-800 rounded-2xl px-3.5 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-medium">Mobile Number (with country code)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or +1 555..."
                  className="w-full bg-zinc-800 rounded-2xl px-3.5 py-2.5 text-sm text-white border border-white/10 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
              >
                Save Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispatched Alerts History Log */}
      <div className="space-y-3">
        <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider px-1">Dispatched Alerts History</label>
        {alerts.length === 0 ? (
          <div className="p-5 rounded-3xl ios-glass border border-white/5 text-center text-xs text-zinc-500">
            No alerts triggered yet. Test the alert above to see delivery logs!
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">To: {a.partnerName} ({a.partnerRole})</span>
                  <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    {a.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">{a.messageText}</p>
                <span className="text-[10px] text-zinc-500">
                  {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Reel count: {a.reelsWatched}/{a.dailyLimit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
