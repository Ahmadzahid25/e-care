
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testIC() {
    console.log('Checking IC: 020116110323');

    const { data: user, error } = await supabase
        .from('users')
        .select('id, full_name, ic_number, contact_no, address, state')
        .eq('ic_number', '020116110323')
        .single();

    if (error) {
        console.log('Error:', error.message);
        console.log('IC not registered');
    } else {
        console.log('User found:', JSON.stringify(user, null, 2));
    }
}

testIC();
