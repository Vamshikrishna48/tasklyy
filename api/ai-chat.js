import fs from 'fs';
import path from 'path';

function loadKey() {
  let key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    try {
      for (const envPath of [path.join(process.cwd(), '.env.local'), path.join(process.cwd(), '.env')]) {
        if (!fs.existsSync(envPath)) continue;
        const envContent = fs.readFileSync(envPath, 'utf8');
        const m = envContent.match(/(?:VITE_)?GEMINI_API_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (m?.[2]) {
          key = m[2].trim();
          break;
        }
      }
    } catch (_) {}
  }
  return key || 'AQ.Ab8RN6KqT8EoHYGyAlaWFrTMqeHBVLHrSU_LvwO9ipCq0DuaqQ';
}

const TASSKLY_SYSTEM_PROMPT = `You are Tasskly AI, the official intelligent assistant for Tasskly (tasskly.com) — India's premier student task marketplace and campus skill network.
Tasskly connects college students across India for micro-tasks, gigs, homework assistance, coding projects, and creative tasks with 100% Escrow security and UPI withdrawals.

Key platform knowledge:
1. Posting Tasks: Set title, instructions, category, budget, deadline, and optional tags (⚡ 10 Min Task, 🚨 Urgent, 🎓 Campus Only).
2. Bidding: Students browse jobs, submit proposal pitch, delivery time, and bid amount. Employers accept the best bid.
3. Escrow Security: Employers deposit into Escrow on bid acceptance. Platform locks funds safely until deliverable is submitted and verified.
4. Worker Levels: Level 1 (Starter - 70% payout / 30% fee), Level 2 (Expert, 10+ jobs - 80% payout / 20% fee), Level 3 (Elite, 25+ jobs - 90% payout / 10% fee).
5. UPI Withdrawals: Exclusively via verified UPI ID (no bank account required). Admin approves UPI in 24 hours. Withdraw anytime from Earnings tab.
6. Support: WhatsApp: https://wa.me/919640008684 | Email: support@tasskly.com.

Tone: Friendly, intelligent, concise, supportive, format with bold text, bullet points, and appropriate emojis.`;

const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-flash-latest'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = loadKey();

  const contents = (Array.isArray(history) ? history.slice(-8) : []).map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));

  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const payload = {
    systemInstruction: { parts: [{ text: TASSKLY_SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ success: true, reply, model });
        }
      }
    } catch (_) {}
  }

  return res.status(200).json({
    success: true,
    reply: "Tasskly is India's leading student marketplace for tasks, homework help, and freelance gigs with 100% Escrow security and UPI payouts. How can I assist you today? For direct support, chat with us on WhatsApp: https://wa.me/919640008684",
    model: 'fallback'
  });
}
