
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
    console.log('Creating default user account...');

    try {
        const hash = await bcrypt.hash('user123', 10);

        // Check if user already exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('ic_number', '123456789012')
            .single();

        if (existing) {
            // Update password
            const { error } = await supabase
                .from('users')
                .update({ password_hash: hash })
                .eq('ic_number', '123456789012');

            if (error) console.error('Update error:', error);
            else console.log('User password updated to "user123".');
        } else {
            // Create new user
            const { error } = await supabase
                .from('users')
                .insert({
                    full_name: 'Test User',
                    ic_number: '123456789012',
                    email: 'testuser@example.com',
                    contact_no: '0123456789',
                    address: 'Kampung Raja, Besut, Terengganu',
                    state: 'Terengganu',
                    password_hash: hash,
                    status: 'Active'
                });

            if (error) console.error('Insert error:', error);
            else console.log('User created successfully!');
        }

        console.log('\nUser Credentials:');
        console.log('  IC Number: 123456789012');
        console.log('  Password:  user123');
    } catch (err) {
        console.error('Script error:', err);
    }
}

createUser();
