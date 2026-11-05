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
  Users,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  ShieldCheck
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
    totalReels,
    instagramCount,
    youtubeCount
  } = useApp();

  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
      showNotification('⚠️ Select at least one contact to receive alerts!');
      return;
    }
    setIsSending(true);
    await triggerManualAlert();
    setIsSending(false);
    showNotification(`✅ Dispatched alert to ${selectedPartners.length} selected contact(s)!`);
  };

  const handleSingleSms = async (phone: string, name: string) => {
    const text = `🚨 NeuroGuard Alert: Your partner reached their daily limit of ${settings.dailyReelLimit} reels (${totalReels} watched today: ${instagramCount} IG, ${youtubeCount} YT). Please call to check in!`;
    await openNativeSms(phone, text);
  };

  const handleSingleWhatsApp = async (phone: string, name: string) => {
    const text = `🚨 NeuroGuard Alert: Your partner reached their daily limit of ${settings.dailyReelLimit} reels (${totalReels} watched today: ${instagramCount} IG, ${youtubeCount} YT). Please call to check in!`;
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
    <div className="space-y-6 pb-28 text-white select-none">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#30D158] text-black text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 animate-fade-in flex items-center space-x-2">
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase">Social Accountability</span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-0.5">Accountability Network</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Select friends and parents who will automatically receive alerts when you exceed your daily quota.
        </p>
      </div>

      {/* Active Safeguard Status Banner */}
      <div className={`p-5 rounded-[32px] bg-[#121214] border shadow-2xl transition-all ${
        selectedPartners.length > 0 ? 'border-[#30D158]/30' : 'border-amber-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              selectedPartners.length > 0 ? 'bg-[#30D158]/15 text-[#30D158]' : 'bg-amber-500/15 text-amber-400'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-white">
                {selectedPartners.length > 0
                  ? `${selectedPartners.length} Contact${selectedPartners.length > 1 ? 's' : ''} Armed`
                  : 'No Contacts Armed'}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedPartners.length > 0
                  ? `Recipients: ${selectedPartners.map((p) => p.name).join(', ')}`
                  : 'Select at least one parent or friend below'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 px-3.5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white border border-white/10 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Quick Selection Presets */}
      <div className="space-y-2">
        <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider px-1">
          Quick Filters
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => selectPreset('all')}
            className="py-2.5 px-2 text-center rounded-2xl bg-zinc-900 border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            All
          </button>
          <button
            onClick={() => selectPreset('friends')}
            className="py-2.5 px-2 text-center rounded-2xl bg-zinc-900 border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            Friends
          </button>
          <button
            onClick={() => selectPreset('parents')}
            className="py-2.5 px-2 text-center rounded-2xl bg-zinc-900 border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            Parents
          </button>
          <button
            onClick={() => selectPreset('none')}
            className="py-2.5 px-2 text-center rounded-2xl bg-zinc-900 border border-white/[0.08] text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-all active:scale-95"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Contact Cards List */}
      <div className="space-y-3">
        <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider px-1">
          Configured Contacts
        </label>
        {partners.map((p) => {
          const isSelected = p.selected;
          const roleBadgeColor =
            p.role === 'Best Friend'
              ? 'text-[#FA114F] bg-[#FA114F]/10 border-[#FA114F]/30'
              : p.role === 'Parent'
              ? 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30'
              : 'text-[#A8FF00] bg-[#A8FF00]/10 border-[#A8FF00]/30';

          return (
            <div
              key={p.id}
              className={`p-4.5 rounded-[28px] border transition-all ${
                isSelected
                  ? 'bg-[#121214] border-white/20 shadow-xl'
                  : 'bg-zinc-900/40 border-white/[0.04] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Select Toggle + Info */}
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => togglePartnerSelected(p.id)}
                    className="mt-0.5 text-zinc-400 hover:text-white transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#30D158]" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-600" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{p.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                        {p.role}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center space-x-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{p.phone || 'No phone number'}</span>
                    </div>

                    <div className="text-[11px] text-zinc-500 pt-0.5">
                      {isSelected ? (
                        <span className="text-[#30D158] font-medium flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Armed: will receive alert at {settings.dailyReelLimit} reels
                        </span>
                      ) : (
                        <span className="text-zinc-600">Alerts muted for this contact</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1-Tap SMS & WhatsApp Launchers */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleSingleSms(p.phone, p.name)}
                    title="Send SMS"
                    className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSingleWhatsApp(p.phone, p.name)}
                    title="Send WhatsApp"
                    className="p-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-[#30D158] transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  {partners.length > 1 && (
                    <button
                      onClick={() => removePartner(p.id)}
                      title="Delete Contact"
                      className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all active:scale-95"
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

      {/* Global Dispatch Test Alert Button */}
      <button
        onClick={handleSendTestToAll}
        disabled={isSending || selectedPartners.length === 0}
        className={`w-full py-4 rounded-[28px] font-black text-sm shadow-2xl flex items-center justify-center space-x-2 transition-all ${
          selectedPartners.length > 0
            ? 'bg-white hover:bg-zinc-200 text-black active:scale-[0.98]'
            : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5'
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-[32px] bg-[#121214] border border-white/15 p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white">Add Contact</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-3 py-1 rounded-full bg-zinc-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Relationship Role</label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {roles.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        newRole === r
                          ? 'bg-white text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alex or Mom"
                  className="w-full bg-zinc-900 rounded-2xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +1 555 123 4567"
                  className="w-full bg-zinc-900 rounded-2xl px-4 py-3 text-sm text-white border border-white/10 focus:outline-none focus:border-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm transition-all"
              >
                Save Contact
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dispatched Alerts History Log */}
      <div className="space-y-3">
        <label className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider px-1">
          Alerts Log
        </label>
        {alerts.length === 0 ? (
          <div className="p-6 rounded-[28px] bg-[#121214] border border-white/[0.06] text-center text-xs text-zinc-500">
            No alerts triggered yet today. Tap "Send Test Alert" to verify delivery!
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div key={a.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-white/[0.04] space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">To: {a.partnerName} ({a.partnerRole})</span>
                  <span className="text-[10px] text-[#30D158] font-bold px-2 py-0.5 rounded-full bg-[#30D158]/10 border border-[#30D158]/20">
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
