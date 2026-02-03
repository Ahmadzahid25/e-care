
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupComplaints() {
    console.log('🧹 Cleaning up ALL complaints history...');

    // 1. Delete all complaints
    // Using RPC or raw query is best for sequence reset, but client only allows table operations
    // We can delete all rows.

    const { error: deleteError, count } = await supabase
        .from('complaints')
        .delete()
        .neq('id', 0); // Delete all where id != 0 (effectively all serial IDs)

    if (deleteError) {
        console.error('❌ Error deleting complaints:', deleteError.message);
        return;
    }

    console.log(`✅ Deleted ${count || 'all'} complaints.`);

    // 2. Reset Sequence
    // Supabase JS client doesn't support executing raw SQL directly unless via RPC
    // We can try to use a stored procedure if one exists, or just accept sequence continues
    // However, for a clean slate, resetting sequence is better.
    // Let's try to call 'reset_report_sequence' rpc if we can create it?
    // Actually, we can't create functions via JS client without admin privileges on SQL editor usually.
    // But we are using SERVICE_ROLE_KEY.
    // Just deleting rows is what the user asked (remove data). Resetting sequence is a bonus.

    // Attempting to call a raw query via rpc if we had a function for it.
    // Since we don't have a 'exec_sql' function exposed, we might skip sequence reset 
    // OR we can just tell the user the data is gone.

    console.log('ℹ️ Note: Report number sequence depends on database state.');
    console.log('   New complaints will continue sequence unless manually reset in SQL Editor.');
    console.log('   (Run: ALTER SEQUENCE report_number_seq RESTART WITH 1; in Supabase SQL Editor)');

}

cleanupComplaints();
