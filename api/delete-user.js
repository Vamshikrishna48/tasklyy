import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAILS = [
  'karthikmethuku180@gmail.com',
  'shrikarakarapu@gmail.com',
  'karshikalamvamshi48@gmail.com',
  'karshikalamvamshi34@gmail.com',
  'tasskly@admin.com',
  'admin@tasskly.com',
  'admin@gmail.com',
];

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

  const { supabaseUrl, supabaseServiceKey } = loadEnv();
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requester }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !requester) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const requesterEmail = (requester.email || '').toLowerCase().trim();
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .maybeSingle();

    const isAdmin =
      requesterProfile?.role === 'admin' || ADMIN_EMAILS.includes(requesterEmail);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can delete users' });
    }

    const { userId } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (userId === requester.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    // Best-effort related cleanup (in case client missed tables / RLS blocked)
    const safeDelete = async (table, column, value) => {
      try {
        await supabase.from(table).delete().eq(column, value);
      } catch (e) {
        console.warn(`delete-user cleanup ${table}:`, e?.message || e);
      }
    };

    await safeDelete('bids', 'bidder_id', userId);
    await safeDelete('job_submissions', 'freelancer_id', userId);
    await safeDelete('messages', 'sender_id', userId);
    await safeDelete('notifications', 'user_id', userId);
    await safeDelete('withdrawals', 'user_id', userId);
    await safeDelete('verification_documents', 'user_id', userId);
    await safeDelete('verification_requests', 'user_id', userId);
    await safeDelete('job_files', 'uploader_id', userId);

    try {
      await supabase
        .from('escrow_transactions')
        .delete()
        .or(`poster_id.eq.${userId},worker_id.eq.${userId}`);
    } catch (_) { /* ignore */ }

    try {
      await supabase
        .from('admin_ledger')
        .delete()
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
    } catch (_) { /* ignore */ }

    try {
      const { data: userJobs } = await supabase
        .from('jobs')
        .select('id')
        .or(`poster_id.eq.${userId},worker_id.eq.${userId},posted_by.eq.${userId}`);
      if (userJobs?.length) {
        const ids = userJobs.map((j) => j.id);
        await supabase.from('bids').delete().in('job_id', ids);
        await supabase.from('job_submissions').delete().in('job_id', ids);
        await supabase.from('job_files').delete().in('job_id', ids);
        await supabase.from('messages').delete().in('job_id', ids);
        await supabase.from('escrow_transactions').delete().in('job_id', ids);
        await supabase.from('jobs').delete().in('id', ids);
      }
    } catch (e) {
      console.warn('delete-user jobs cleanup:', e?.message || e);
    }

    await safeDelete('profiles', 'id', userId);

    const { error: deleteAuthErr } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      console.error('Auth delete failed:', deleteAuthErr);
      return res.status(500).json({
        success: false,
        error: 'Profile cleaned but Auth delete failed: ' + deleteAuthErr.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted from database and Auth',
    });
  } catch (err) {
    console.error('delete-user error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
