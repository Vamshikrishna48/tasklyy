import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const KNOWN_UPI_HANDLES = [
  "ybl", "okaxis", "okhdfcbank", "okicici", "oksbi", "paytm", "pthdfc",
  "ptaxis", "ptyes", "ptsbi", "axl", "ibl", "upi", "apl", "abfspay",
  "amazonpay", "axisbank", "barodampay", "birla", "citi", "citibank",
  "dbl", "dbs", "equitas", "federal", "freecharge", "hsbc", "icici", "idbi",
  "idfcbank", "indus", "jupiteraxis", "kbl", "kmbl", "kotak", "kvb", "mahb",
  "mobikwik", "naviaxis", "olamoney", "payzapp", "pingpay", "pnb", "rbl",
  "sbi", "sib", "sliceaxis", "tapicici", "timesbank", "ubi", "unionbank",
  "unity", "vijb", "waicici", "waaxis", "wahdfcbank", "wasbi", "yesbank",
  "yesbankltd", "okbizaxis", "ikwik", "jupiter", "razorpay", "bhim",
];

const UPI_VPA_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

function loadEnv() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    for (const envPath of [path.join(process.cwd(), '.env.local'), path.join(process.cwd(), '.env')]) {
      if (!fs.existsSync(envPath)) continue;
      const envContent = fs.readFileSync(envPath, 'utf8');
      if (!supabaseUrl) {
        const m = envContent.match(/VITE_SUPABASE_URL\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (m?.[2]) supabaseUrl = m[2].trim();
      }
      if (!supabaseServiceKey) {
        const m = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (m?.[2]) supabaseServiceKey = m[2].trim();
      }
    }
  } catch (_) { /* ignore */ }
  return { supabaseUrl, supabaseServiceKey };
}

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

  try {
    const { upi_id } = req.body || {};
    const normalized = String(upi_id || '').trim().toLowerCase().replace(/\s+/g, '');

    if (!normalized) {
      return res.status(400).json({ valid: false, error: 'UPI ID is required' });
    }
    if (!UPI_VPA_REGEX.test(normalized)) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid UPI format. Use name@bank (e.g. 9876543210@ybl)',
      });
    }

    const handle = normalized.split('@')[1] || '';
    if (!KNOWN_UPI_HANDLES.includes(handle)) {
      return res.status(400).json({
        valid: false,
        error: `Unknown UPI handle "@${handle}". Enter a valid bank/PSP UPI ID.`,
      });
    }

    // Optional live VPA check via Razorpay if secret is configured
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    let providerVerified = false;
    let providerName = null;

    if (razorpayKeyId && razorpayKeySecret && !String(razorpayKeyId).includes('your_razorpay')) {
      try {
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const rzRes = await fetch('https://api.razorpay.com/v1/payments/validate/vpa', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vpa: normalized }),
        });
        const rzData = await rzRes.json().catch(() => ({}));
        if (rzRes.ok && (rzData.success === true || rzData.customer_name)) {
          providerVerified = true;
          providerName = rzData.customer_name || null;
        } else if (rzRes.ok === false && rzData.error) {
          return res.status(400).json({
            valid: false,
            error: rzData.error?.description || 'UPI ID could not be verified with the payment network',
          });
        }
      } catch (e) {
        console.warn('Razorpay VPA validate skipped:', e?.message || e);
      }
    }

    // Persist on profile when user is authenticated
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const { supabaseUrl, supabaseServiceKey } = loadEnv();
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          await supabase
            .from('profiles')
            .update({
              upi_id: normalized,
              upi_verified: true,
              upi_verified_at: new Date().toISOString(),
            })
            .eq('id', user.id);
        }
      }
    }

    return res.status(200).json({
      valid: true,
      upi_id: normalized,
      handle,
      provider_verified: providerVerified,
      account_holder_name: providerName,
      message: providerVerified
        ? `UPI verified${providerName ? ` for ${providerName}` : ''} ✅`
        : 'UPI ID format verified successfully ✅',
    });
  } catch (err) {
    console.error('verify-upi error:', err);
    return res.status(500).json({ valid: false, error: err.message || 'Internal server error' });
  }
}
