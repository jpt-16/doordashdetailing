-- Trigger functions run as triggers only; they should not be callable via /rest/v1/rpc.
-- is_admin() stays executable: RLS policies call it as the requesting role.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_profile_role() from public, anon, authenticated;
revoke execute on function public.guard_detailer_admin_fields() from public, anon, authenticated;
