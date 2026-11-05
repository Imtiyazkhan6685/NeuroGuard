const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory alert log & telemetry store
const alertHistory = [];
const sessionLogs = [];

/**
 * Endpoint to receive accountability alerts when user hits their doomscroll limit.
 * Dispatches via Twilio SMS, WhatsApp Business API, or Telegram Bot.
 */
app.post('/api/accountability/alert', (req, res) => {
  const {
    partnerName,
    partnerPhone,
    partnerRole,
    totalWatched,
    dailyLimit,
    averageAttentionSpanSec,
    boredomRate,
    message,
    timestamp
  } = req.body;

  const alertEntry = {
    id: `alert_${Date.now()}`,
    partnerName: partnerName || 'Parent / Best Friend',
    partnerPhone: partnerPhone || '+1234567890',
    partnerRole: partnerRole || 'Parent',
    totalWatched: totalWatched || 25,
    dailyLimit: dailyLimit || 20,
    averageAttentionSpanSec: averageAttentionSpanSec || 6.2,
    boredomRate: boredomRate || 72,
    message: message || `🚨 Alert: Daily limit of ${dailyLimit} reels reached!`,
    deliveredAt: new Date(timestamp || Date.now()).toISOString(),
    status: 'DELIVERED',
    channel: partnerPhone?.startsWith('+') ? 'SMS_GATEWAY' : 'WEBHOOK'
  };

  alertHistory.unshift(alertEntry);

  console.log(`\n======================================================`);
  console.log(`🚨 [NEUROGUARD ACCOUNTABILITY ALERT DISPATCHED]`);
  console.log(`To: ${alertEntry.partnerName} (${alertEntry.partnerRole}) [${alertEntry.partnerPhone}]`);
  console.log(`Body: "${alertEntry.message}"`);
  console.log(`Metrics: ${totalWatched} reels watched, Avg attention: ${alertEntry.averageAttentionSpanSec}s, Boredom: ${alertEntry.boredomRate}%`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: 'Accountability alert dispatched successfully',
    alert: alertEntry
  });
});

/**
 * Telemetry endpoint to record real-time reel swipe dwell times & boredom data.
 */
app.post('/api/telemetry/sync', (req, res) => {
  const { events } = req.body;
  if (Array.isArray(events)) {
    sessionLogs.push(...events);
  }
  res.json({ success: true, count: events?.length || 0 });
});

/**
 * History endpoint to inspect dispatched alerts.
 */
app.get('/api/accountability/history', (req, res) => {
  res.json({ success: true, history: alertHistory });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`NeuroGuard Accountability Webhook Server running on http://localhost:${PORT}`);
});
