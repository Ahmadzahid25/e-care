// Test script to check if user exists in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUser() {
    console.log('Checking user with IC: 020116110323...\n');

    const { data, error } = await supabase
        .from('users')
        .select('id, ic_number, full_name, status, password_hash')
        .eq('ic_number', '020116110323')
        .single();

    if (error) {
        console.log('ERROR:', error.message);
        return;
    }

    if (!data) {
        console.log('User NOT FOUND in database!');
        return;
    }

    console.log('User FOUND:');
    console.log('- ID:', data.id);
    console.log('- IC:', data.ic_number);
    console.log('- Name:', data.full_name);
    console.log('- Status:', data.status);
    console.log('- Has Password Hash:', data.password_hash ? 'Yes' : 'No');
    console.log('- Password Hash Preview:', data.password_hash ? data.password_hash.substring(0, 20) + '...' : 'N/A');

    // Test password comparison
    const bcrypt = require('bcrypt');
    const testPassword = 'Ecare@2026';
    const isMatch = await bcrypt.compare(testPassword, data.password_hash);
    console.log('\nPassword Test:');
    console.log('- Testing password:', testPassword);
    console.log('- Password Match:', isMatch ? 'YES ✓' : 'NO ✗');
}

checkUser().catch(console.error);
