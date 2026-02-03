
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestComplaints() {
    console.log('🔍 Checking Latest Complaints...\n');

    const { data: complaints, error } = await supabase
        .from('complaints')
        .select(`
            id, 
            report_number, 
            created_at,
            user_id,
            complaint_type,
            warranty_file,
            receipt_file,
            users (full_name, ic_number)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('❌ Error fetching complaints:', error.message);
        return;
    }

    complaints.forEach(c => {
        console.log(`📄 Report: ${c.report_number}`);
        console.log(`   User: ${c.users?.full_name} (${c.users?.ic_number})`);
        console.log(`   Type: ${c.complaint_type}`);
        console.log(`   Warranty File: ${c.warranty_file || 'NULL'}`);
        console.log(`   Receipt File: ${c.receipt_file || 'NULL'}`);
        console.log('---');
    });
}

checkLatestComplaints();
