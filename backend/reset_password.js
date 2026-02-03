// Script to reset user password
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetPassword() {
    const icNumber = '020116110323';
    const newPassword = '020116110323';

    console.log('Resetting password for IC:', icNumber);
    console.log('New password:', newPassword);

    // Generate new password hash
    const passwordHash = await bcrypt.hash(newPassword, 10);
    console.log('New hash generated:', passwordHash.substring(0, 30) + '...');

    // Update user password
    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('ic_number', icNumber)
        .select('id, ic_number, full_name');

    if (error) {
        console.log('ERROR:', error.message);
        return;
    }

    console.log('\n✓ Password reset successful!');
    console.log('Updated user:', data[0]?.full_name);
    console.log('\nYou can now login with:');
    console.log('  IC: 020116110323');
    console.log('  Password: Ecare@2026');
}

resetPassword().catch(console.error);
