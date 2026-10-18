import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Unified Withdrawal Handler (Request & Process)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  const token = authHeader.replace('Bearer ', '');

  // Load Supabase credentials
  let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    try {
      const paths = [
        path.join(process.cwd(), '.env.local'),
        path.join(process.cwd(), '.env')
      ];
      for (const envPath of paths) {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          if (!supabaseUrl) {
            const matchUrl = envContent.match(/VITE_SUPABASE_URL\s*=\s*(["']?)(.*?)\1(\s|$)/);
            if (matchUrl && matchUrl[2]) supabaseUrl = matchUrl[2].trim();
          }
          if (!supabaseServiceKey) {
            const matchServKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
            if (matchServKey && matchServKey[2]) supabaseServiceKey = matchServKey[2].trim();
          }
        }
      }
    } catch (err) {
      console.error("Failed to parse env files dynamically:", err);
    }
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase API credentials missing from backend configuration.");
    return res.status(500).json({ error: 'Supabase credentials not configured on backend' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
    }

    const { withdrawal_id, status, admin_note, amount } = req.body || {};

    // ─────────────────────────────────────────────────────────────
    // BRANCH A: PROCESS WITHDRAWAL (Admin Action: approve / reject)
    // ─────────────────────────────────────────────────────────────
    if (withdrawal_id) {
      if (!status || (status !== 'approved' && status !== 'rejected')) {
        return res.status(400).json({ error: 'Invalid or missing parameters (withdrawal_id, status)' });
      }

      const { data: requesterProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileErr || !requesterProfile || requesterProfile.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins are authorized to process withdrawals.' });
      }

      const { data: withdrawal, error: withdrawalErr } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', withdrawal_id)
        .single();

      if (withdrawalErr || !withdrawal) {
        return res.status(404).json({ error: `Withdrawal request with ID ${withdrawal_id} not found.` });
      }

      if (withdrawal.status !== 'pending') {
        return res.status(400).json({ error: `This withdrawal request has already been ${withdrawal.status}.` });
      }

      if (status === 'approved') {
        const { error: updateErr } = await supabase
          .from('withdrawals')
          .update({
            status: 'approved',
            admin_note: admin_note || 'Approved and processed',
            processed_at: new Date().toISOString()
          })
          .eq('id', withdrawal_id);

        if (updateErr) throw updateErr;
      } else {
        const { error: updateErr } = await supabase
          .from('withdrawals')
          .update({
            status: 'rejected',
            admin_note: admin_note || 'Rejected by Admin',
            processed_at: new Date().toISOString()
          })
          .eq('id', withdrawal_id);

        if (updateErr) throw updateErr;

        // Refund the balance back to user's wallet_balance
        const { data: targetProfile, error: targetProfileErr } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', withdrawal.user_id)
          .single();

        if (targetProfileErr || !targetProfile) {
          throw new Error("Target user profile not found for refund");
        }

        const currentBalance = Number(targetProfile.wallet_balance) || 0;
        const refundAmount = Number(withdrawal.amount);
        const refundedBalance = currentBalance + refundAmount;

        const { error: refundErr } = await supabase
          .from('profiles')
          .update({ wallet_balance: refundedBalance })
          .eq('id', withdrawal.user_id);

        if (refundErr) {
          await supabase
            .from('withdrawals')
            .update({
              status: 'pending',
              admin_note: null,
              processed_at: null
            })
            .eq('id', withdrawal_id);
          throw new Error("Failed to refund amount back to wallet balance");
        }
      }

      return res.status(200).json({ 
        success: true, 
        message: `Withdrawal request successfully ${status}.` 
      });
    }

    // ─────────────────────────────────────────────────────────────
    // BRANCH B: REQUEST WITHDRAWAL (User Action)
    // ─────────────────────────────────────────────────────────────
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid or missing withdrawal amount' });
    }
    const withdrawalAmount = Number(amount);

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('wallet_balance, upi_id, full_name')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (!profile.upi_id) {
      return res.status(400).json({ 
        error: 'Please configure your UPI ID in your profile settings before requesting a withdrawal.' 
      });
    }

    const currentBalance = Number(profile.wallet_balance) || 0;
    if (currentBalance < withdrawalAmount) {
      return res.status(400).json({ 
        error: `Insufficient balance. Available balance is ₹${currentBalance}.` 
      });
    }

    const newBalance = currentBalance - withdrawalAmount;
    const { error: balanceUpdateErr } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', user.id);

    if (balanceUpdateErr) {
      throw new Error("Failed to deduct amount from wallet balance");
    }

    const payoutUpi = profile.upi_id;
    const payoutHolder = profile.full_name || 'UPI Holder';

    const { error: withdrawalErr } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user.id,
        amount: withdrawalAmount,
        status: 'pending',
        bank_name: 'UPI Payout',
        bank_account_number: payoutUpi,
        bank_ifsc_code: 'UPI0000000',
        bank_account_holder_name: payoutHolder
      });

    if (withdrawalErr) {
      await supabase
        .from('profiles')
        .update({ wallet_balance: currentBalance })
        .eq('id', user.id);
      throw new Error("Failed to register withdrawal request");
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Withdrawal request submitted successfully.',
      new_balance: newBalance
    });

  } catch (err) {
    console.error("Error in withdrawal handler:", err);
    return res.status(500).json({ error: err.message || 'Internal server error during withdrawal' });
  }
}
