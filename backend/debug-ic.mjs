
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test the verify-ic API endpoint directly
const testVerifyIC = async () => {
    const ic_number = '020116110323';

    console.log('Testing IC verification for:', ic_number);
    console.log('IC length:', ic_number.length);

    // Check if IC length is valid
    if (!ic_number || ic_number.length !== 12) {
        console.log('Invalid IC length');
        return;
    }

    const { data: user, error } = await supabase
        .from('users')
        .select('id, full_name, ic_number, contact_no, address, state')
        .eq('ic_number', ic_number)
        .single();

    if (error || !user) {
        console.log('Error:', error);
        console.log('Result: User not found');
    } else {
        console.log('Result: User found');
        console.log(JSON.stringify(user, null, 2));
    }
};

testVerifyIC();
