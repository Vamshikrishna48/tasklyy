import fs from 'fs';
import path from 'path';

// Dynamic Razorpay key exposure endpoint
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
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

  // Fallback to local .env file only if not configured in system variables
  if (!key) {
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/VITE_RAZORPAY_KEY_ID\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (match && match[2]) {
          key = match[2].trim();
          console.log("Loaded Razorpay key from .env file: " + key);
        }
      }
    } catch (err) {
      console.error("Failed to parse .env file dynamically:", err);
    }
  }

  return res.status(200).json({ key: key || null });
}
