
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserComplaints() {
    const userId = 'a69ab85f-7423-4bfd-8ec4-9daf96218bff';

    console.log(`Checking complaints for User ID: ${userId}`);

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (userError) {
        console.error('User Error:', userError);
    } else {
        console.log('User Found:', user.full_name, user.ic_number);
    }

    const { data: complaints, error: complaintError } = await supabase
        .from('complaints')
        .select('id, report_number, user_id')
        .eq('user_id', userId);

    if (complaintError) {
        console.error('Complaint Error:', complaintError);
    } else {
        console.log(`Found ${complaints.length} complaints for this user.`);
        console.log(complaints);
    }

    // Also check if there are complaints with NO user_id or something weird?
    // No, let's just check if the logic in controller might be leaking.
}

checkUserComplaints();
