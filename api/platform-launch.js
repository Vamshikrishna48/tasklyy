import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SETTING_KEY = 'is_launched';

function loadEnv() {
  let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
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
      if (!anonKey) {
        const m = envContent.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(["']?)(.*?)\1(\s|$)/);
        if (m?.[2]) anonKey = m[2].trim();
      }
    }
  } catch (_) { /* ignore */ }
  return { supabaseUrl, supabaseServiceKey, anonKey };
}

const ADMIN_EMAILS = [
  'karthikmethuku180@gmail.com',
  'shrikarakarapu@gmail.com',
  'karshikalamvamshi48@gmail.com',
  'karshikalamvamshi34@gmail.com',
  'tasskly@admin.com',
  'admin@tasskly.com',
  'admin@gmail.com',
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { supabaseUrl, supabaseServiceKey, anonKey } = loadEnv();
  if (!supabaseUrl || (!supabaseServiceKey && !anonKey)) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey || anonKey);

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', SETTING_KEY)
        .maybeSingle();

      if (error) {
        console.warn('platform-launch GET:', error.message);
        return res.status(200).json({ launched: true });
      }

      return res.status(200).json({ launched: data?.value !== 'false' });
    }

    if (req.method === 'POST') {
      if (!supabaseServiceKey) {
        return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY required to update launch state' });
      }

      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authorization required' });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authErr } = await adminClient.auth.getUser(token);
      if (authErr || !user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const email = (user.email || '').toLowerCase().trim();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(email);
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can change launch status' });
      }

      const launched = !!req.body?.launched;
      const { error: upsertErr } = await adminClient
        .from('platform_settings')
        .upsert(
          { key: SETTING_KEY, value: launched ? 'true' : 'false', updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );

      if (upsertErr) {
        // Fallback insert/update if upsert shape differs
        const { data: existing } = await adminClient
          .from('platform_settings')
          .select('key')
          .eq('key', SETTING_KEY)
          .maybeSingle();

        let writeErr = upsertErr;
        if (existing) {
          const { error } = await adminClient
            .from('platform_settings')
            .update({ value: launched ? 'true' : 'false', updated_at: new Date().toISOString() })
            .eq('key', SETTING_KEY);
          writeErr = error;
        } else {
          const { error } = await adminClient
            .from('platform_settings')
            .insert({ key: SETTING_KEY, value: launched ? 'true' : 'false' });
          writeErr = error;
        }

        if (writeErr) {
          return res.status(500).json({ error: writeErr.message || 'Failed to save launch state' });
        }
      }

      return res.status(200).json({ success: true, launched });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('platform-launch error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
