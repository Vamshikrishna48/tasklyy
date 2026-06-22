import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  res.status(200).json({
    hasUrl: !!url,
    urlPrefix: url.substring(0, 15),
    hasKey: !!key,
    keyPrefix: key.substring(0, 10),
  });
}
