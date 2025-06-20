-- DIAGNOSTIC QUERY - Check current database state
-- Run this to see what tables currently exist

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if specific tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'communications' THEN 'NEEDED FOR DASHBOARD'
        WHEN table_name = 'training_videos' THEN 'NEEDED FOR DASHBOARD' 
        WHEN table_name = 'member_progress' THEN 'NEEDED FOR DASHBOARD'
        WHEN table_name = 'contacts' THEN 'EXISTS'
        WHEN table_name = 'members' THEN 'EXISTS'
        WHEN table_name = 'companies' THEN 'EXISTS'
        ELSE 'OTHER'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('communications', 'training_videos', 'member_progress', 'contacts', 'members', 'companies')
ORDER BY table_name; 