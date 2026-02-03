
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkComplaint() {
    // Get the most recent complaint (A00002)
    const { data: complaint, error } = await supabase
        .from('complaints')
        .select('id, report_number, complaint_type, warranty_file, receipt_file')
        .eq('report_number', 'A00002')
        .single();

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Complaint A00002:');
        console.log(JSON.stringify(complaint, null, 2));
    }
}

checkComplaint();
