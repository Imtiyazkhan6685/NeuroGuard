import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PartnerRole } from '../types';
import {
  ShieldAlert,
  Send,
  MessageSquare,
  Phone,
  User,
  CheckCircle,
  Copy,
  Clock,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export const AccountabilityView: React.FC = () => {
  const { partner, updatePartner, settings, triggerManualAlert, alerts, events } = useApp();
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const roles: PartnerRole[] = ['Parent', 'Best Friend', 'Partner', 'Sibling', 'Mentor'];

  const handleSendTest = async () => {
    setIsSending(true);
    await triggerManualAlert();
    setIsSending(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(partner.customTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Social Safeguard</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Accountability Partner</h1>
        <p className="text-xs text-zinc-400 mt-1">
          When you exceed your daily quota of reels, NeuroGuard notifies your designated partner automatically.
        </p>
      </div>

      {/* Partner Configuration Card */}
      <div className="ios-glass rounded-3xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-rose-400">
          <HeartHandshake className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Partner Profile</span>
        </div>

        {/* Role Selector Pills */}
        <div>
          <label className="text-xs text-zinc-400 font-medium">Relationship Role</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => updatePartner({ role: r, relationshipTag: r })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  partner.role === r
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium">Partner Name</label>
          <div className="flex items-center space-x-2 bg-zinc-900/80 rounded-2xl px-3.5 py-2.5 border border-white/10">
            <User className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={partner.name}
              onChange={(e) => updatePartner({ name: e.target.value })}
              placeholder="e.g. Sarah (Mom) or Alex (Best Friend)"
              className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none flex-1"
            />
          </div>
        </div>

        {/* Phone number input */}
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-400 font-medium">Partner Mobile Number (SMS / WhatsApp)</label>
          <div className="flex items-center space-x-2 bg-zinc-900/80 rounded-2xl px-3.5 py-2.5 border border-white/10">
            <Phone className="w-4 h-4 text-zinc-500" />
            <input
              type="tel"
              value={partner.phone}
              onChange={(e) => updatePartner({ phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none flex-1 font-mono"
            />
          </div>
        </div>

        {/* Channel toggles */}
        <div className="pt-2 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">Direct SMS Alert</span>
              <p className="text-[10px] text-zinc-400">Native Android SMS dispatch</p>
            </div>
            <input
              type="checkbox"
              checked={partner.autoSmsEnabled}
              onChange={(e) => updatePartner({ autoSmsEnabled: e.target.checked })}
              className="toggle-checkbox accent-rose-500 w-5 h-5 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">WhatsApp & Cloud Webhook</span>
              <p className="text-[10px] text-zinc-400">Webhook delivery via API</p>
            </div>
            <input
              type="checkbox"
              checked={partner.whatsappEnabled}
              onChange={(e) => updatePartner({ whatsappEnabled: e.target.checked })}
              className="toggle-checkbox accent-rose-500 w-5 h-5 rounded"
            />
          </div>
        </div>
      </div>

      {/* Message Template Editor */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Accountability Message Template</h2>
          <button
            onClick={handleCopyTemplate}
            className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-white"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-400">
          Available tags: <span className="font-mono text-purple-400">{'{user}'}</span>, <span className="font-mono text-purple-400">{'{limit}'}</span>, <span className="font-mono text-purple-400">{'{watched}'}</span>, <span className="font-mono text-purple-400">{'{avg_span}'}</span>, <span className="font-mono text-purple-400">{'{boredom_pct}'}</span>
        </p>

        <textarea
          rows={4}
          value={partner.customTemplate}
          onChange={(e) => updatePartner({ customTemplate: e.target.value })}
          className="w-full bg-zinc-950/70 border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-rose-500/50 leading-relaxed font-sans"
        />

        {/* Trigger Test Button */}
        <button
          onClick={handleSendTest}
          disabled={isSending}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSending ? 'Dispatching Message...' : 'Test Trigger Message Now'}</span>
        </button>

        {successToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Simulated message delivered to {partner.name}! Check history below.</span>
          </div>
        )}
      </div>

      {/* Dispatched Alerts History */}
      <div className="ios-glass-card rounded-3xl p-5 border border-white/10 space-y-3">
        <h2 className="text-sm font-bold text-white">Alert Dispatch Log</h2>
        <p className="text-[11px] text-zinc-400">Audit trail of automated messages sent to your partner</p>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No limit alerts triggered yet today. Keep up the good focus!
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">{alert.partnerName}</span>
                    <span className="text-[10px] text-zinc-500">({alert.partnerPhone})</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 italic bg-black/40 p-2 rounded-xl border border-white/5">
                  "{alert.messageText}"
                </p>
                <div className="flex items-center space-x-3 text-[10px] text-zinc-500">
                  <span>Reels: {alert.reelsWatched}/{alert.dailyLimit}</span>
                  <span>•</span>
                  <span>Avg Attention: {alert.avgAttentionSec}s</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{alert.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
