
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    // Try explicit path if .env fails to load vars
    console.log('Trying fallback env path...');
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Check again
if (!process.env.SUPABASE_URL) {
    console.error('STILL Missing Supabase credentials. Env:', process.env);
    process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
        .select('id, report_number, user_id, assigned_to')
        .eq('user_id', userId);

    if (complaintError) {
        console.error('Complaint Error:', complaintError);
    } else {
        console.log(`Found ${complaints.length} complaints for this user.`);
        console.log(complaints);
    }
}

checkUserComplaints();
