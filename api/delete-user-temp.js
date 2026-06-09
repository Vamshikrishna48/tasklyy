import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    return res.status(500).json({
      error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in this environment. Please ensure it is set up in Vercel settings.'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Fetch all users from Auth via admin API
    const { data, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = (data?.users || []).find(u => u.email === 'karshikalamvamshi48@gmail.com');

    if (!targetUser) {
      // Clean up public.profiles if any orphaned profile remains
      await supabase.from('profiles').delete().eq('email', 'karshikalamvamshi48@gmail.com');
      return res.status(200).json({
        success: true,
        message: 'User karshikalamvamshi48@gmail.com was not found or is already deleted.'
      });
    }

    // 2. Delete user account from Auth (this cascades to profiles)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUser.id);
    if (deleteError) throw deleteError;

    // 3. Double check public.profiles cleanup
    await supabase.from('profiles').delete().eq('email', 'karshikalamvamshi48@gmail.com');

    return res.status(200).json({
      success: true,
      message: `Successfully deleted user account and profile for karshikalamvamshi48@gmail.com (ID: ${targetUser.id}).`
    });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'An error occurred during deletion.'
    });
  }
}
