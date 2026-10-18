import fs from 'fs';
import path from 'path';
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount = 499, currency = 'INR', receipt = `rcpt_${Date.now()}` } = req.body || {};

  let key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  let key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    try {
      const paths = [
        path.join(process.cwd(), '.env.local'),
        path.join(process.cwd(), '.env')
      ];
      for (const envPath of paths) {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          if (!key_id) {
            const matchKey = envContent.match(/VITE_RAZORPAY_KEY_ID\s*=\s*(["']?)(.*?)\1(\s|$)/);
            if (matchKey && matchKey[2]) key_id = matchKey[2].trim();
          }
          if (!key_secret) {
            const matchSecret = envContent.match(/(VITE_)?RAZORPAY_KEY_SECRET\s*=\s*(["']?)(.*?)\1(\s|$)/);
            if (matchSecret && matchSecret[3]) key_secret = matchSecret[3].trim();
          }
        }
      }
    } catch (e) {
      console.error("Env parsing error:", e);
    }
  }

  if (!key_id || !key_secret) {
    return res.status(200).json({
      success: false,
      error: 'Missing Razorpay credentials on server',
      key_id: key_id || null
    });
  }

  try {
    const instance = new Razorpay({
      key_id,
      key_secret
    });

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt
    };

    const order = await instance.orders.create(options);
    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(200).json({
      success: false,
      error: err.message || 'Failed to create order with Razorpay',
      key_id
    });
  }
}
