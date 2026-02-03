-- ============================================
-- DIAGNOSE & FIX REPORT NUMBER ISSUE
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- LANGKAH 1: Check semua trigger pada table complaints
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'complaints'::regclass;

-- LANGKAH 2: Check function yang ada untuk report_number
SELECT 
    proname AS function_name,
    prosrc AS function_source
FROM pg_proc 
WHERE proname LIKE '%report%' OR proname LIKE '%generate%';

-- LANGKAH 3: Jika ada trigger, DROP ia:
-- (Uncomment selepas tahu nama trigger dari langkah 1)
-- DROP TRIGGER IF EXISTS [trigger_name] ON complaints;

-- LANGKAH 4: Check jika ada function generate_report_number
-- dan lihat isi function tersebut
SELECT prosrc FROM pg_proc WHERE proname = 'generate_report_number';
