-- Run this SQL in your Supabase dashboard SQL Editor
-- at https://supabase.com/dashboard/project/kccrpozqbtrdwrldddcd/sql

-- Insert superadmin accounts
INSERT INTO public.portal_admins (admin_id, password, full_name, permissions, is_superadmin, is_active) VALUES
('ErgoZFood@elyonmain.app', 'ERGO@ELYON+1234', 'System Administrator', ARRAY['full_access'], true, true),
('HldanaZPresident@elyonmain.app', '!Hldana@ZZZ', 'President, Hldana', ARRAY['full_access'], true, true)
ON CONFLICT (admin_id) DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  permissions = EXCLUDED.permissions,
  is_superadmin = EXCLUDED.is_superadmin,
  is_active = EXCLUDED.is_active;

-- Insert admin accounts (teachers)
INSERT INTO public.portal_admins (admin_id, password, full_name, permissions, is_superadmin, is_active) VALUES
('ZenaZPrestigious@elyonmain.app', 'Zenane@Prestigious', 'Zena Negash', ARRAY['teacher_access'], false, true),
('Asnakew@elyonmain.app', 'Asnakew@2025', 'Asnakew', ARRAY['teacher_access'], false, true),
('Habtamu@elyonmain.app', 'Habtamu@2025', 'Habtamu (Economic Teacher)', ARRAY['teacher_access'], false, true),
('Kassaye@elyonmain.app', 'Kassaye@2025', 'Kassaye (Geography Teacher)', ARRAY['teacher_access'], false, true),
('Tiruneh@elyonmain.app', 'Tiruneh@2025', 'Tiruneh (Physics Teacher)', ARRAY['teacher_access'], false, true)
ON CONFLICT (admin_id) DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  permissions = EXCLUDED.permissions,
  is_superadmin = EXCLUDED.is_superadmin,
  is_active = EXCLUDED.is_active;

-- Insert overseer accounts
INSERT INTO public.portal_admins (admin_id, password, full_name, permissions, is_superadmin, is_active) VALUES
('Lema@elyonmain.app', 'Lema@2025', 'Lema', ARRAY['overseer_access'], false, true),
('Overseer@elyonmain.app', 'Overseer@2025', 'School Director Lema', ARRAY['overseer_access'], false, true)
ON CONFLICT (admin_id) DO UPDATE SET
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  permissions = EXCLUDED.permissions,
  is_superadmin = EXCLUDED.is_superadmin,
  is_active = EXCLUDED.is_active;
