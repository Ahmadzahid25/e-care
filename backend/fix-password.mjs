
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserPassword() {
    console.log('🔧 Fixing user password for AHMAD ZAHID...\n');

    const newHash = await bcrypt.hash('Ecare@2026', 10);

    const { error } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('ic_number', '020116110323');

    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Password updated successfully');
        console.log('   IC: 020116110323');
        console.log('   New Password: Ecare@2026');
    }
}

fixUserPassword();
