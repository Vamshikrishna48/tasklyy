import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { payment_id, expected_amount } = req.body;

  if (!payment_id || !expected_amount) {
    return res.status(400).json({ error: 'Missing payment_id or expected_amount' });
  }

  // Load Razorpay credentials
  let key_id = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  let key_secret = process.env.RAZORPAY_KEY_SECRET || process.env.VITE_RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    try {
      const envPath = path.join(process.cwd(), '.env');
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
    } catch (err) {
      console.error("Failed to parse .env file dynamically:", err);
    }
  }

  if (!key_id || !key_secret) {
    console.error("Razorpay API credentials missing from backend env configuration.");
    return res.status(500).json({ error: 'Razorpay credentials not configured on backend' });
  }

  try {
    // Call Razorpay API to fetch payment details
    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay API request failed:", errorText);
      return res.status(400).json({ success: false, error: 'Failed to verify payment with Razorpay' });
    }

    const data = await response.json();

    // Verify payment state, amount, and currency
    const isSuccess = data.status === 'captured' || data.status === 'authorized';
    
    // Razorpay amounts are in paise (expected_amount * 100)
    const expectedPaise = Math.round(Number(expected_amount) * 100);
    const amountMatches = Math.abs(data.amount - expectedPaise) <= 5; // tolerance of 5 paise

    if (isSuccess && amountMatches && data.currency === 'INR') {
      console.log(`Payment verified successfully! ID: ${payment_id}, Amount: ₹${data.amount/100}`);
      return res.status(200).json({ 
        success: true, 
        status: data.status, 
        amount: data.amount,
        payment_id: data.id
      });
    } else {
      console.error("Payment verification checks failed:", {
        id: data.id,
        status: data.status,
        amount: data.amount,
        expectedPaise,
        currency: data.currency
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification checks failed (status mismatch or amount mismatch)' 
      });
    }
  } catch (err) {
    console.error("Error during payment verification request:", err);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
}
