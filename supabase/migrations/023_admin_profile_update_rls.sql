-- MIGRATION: 023_admin_profile_update_rls.sql
-- Allow administrators to update any user profile (e.g. for UPI verification, badge approvals, and manual review)

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
