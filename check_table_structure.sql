-- Check the structure of the portal_admins table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'portal_admins' 
AND table_schema = 'public'
ORDER BY ordinal_position;
