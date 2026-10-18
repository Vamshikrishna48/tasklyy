import fs from 'fs';
import path from 'path';

// Dynamic Razorpay key exposure endpoint
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Prioritize Vercel environment variables first
  let key = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

  // Filter out any stale/revoked keys
  const REVOKED = ['rzp_test_T0P4HP3XQF8ksO', 'your_razorpay_key_id', 'rzp_test_SwrcccCFd0O03j', 'rzp_test_Ss6UkuAHYOxOPV'];
  if (!key || REVOKED.includes(key)) {
    key = 'rzp_test_TpN1RYQAhmX0OC';
  }

  return res.status(200).json({ key });
}
