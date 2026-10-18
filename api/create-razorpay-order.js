import fs from 'fs';
import path from 'path';
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', (req.headers && req.headers.origin) || '*');
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

  if (key_id === 'rzp_test_T0P4HP3XQF8ksO' || !key_id) {
    key_id = 'rzp_test_TpN1RYQAhmX0OC';
  }
  if (key_secret === 'ZaYJYekC9IM9WyP9o9QViDpF' || !key_secret) {
    key_secret = 'Hxp5Ku9Ooo2cga90b5grQxu2';
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
