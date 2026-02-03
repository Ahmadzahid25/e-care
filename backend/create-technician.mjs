
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

async function createTechnician() {
    console.log('Creating default technician account...');

    try {
        const hash = await bcrypt.hash('tech123', 10);

        // Check if technician already exists
        const { data: existing } = await supabase
            .from('technicians')
            .select('id')
            .eq('username', 'tech1')
            .single();

        if (existing) {
            // Update password
            const { error } = await supabase
                .from('technicians')
                .update({ password_hash: hash })
                .eq('username', 'tech1');

            if (error) console.error('Update error:', error);
            else console.log('Technician password updated to "tech123".');
        } else {
            // Create new technician
            const { error } = await supabase
                .from('technicians')
                .insert({
                    name: 'Technician 1',
                    department: 'Servis Elektrik',
                    email: 'tech1@ptaservices.com',
                    contact_number: 1234567890,
                    username: 'tech1',
                    password_hash: hash,
                    is_active: true
                });

            if (error) console.error('Insert error:', error);
            else console.log('Technician created successfully!');
        }

        console.log('\nTechnician Credentials:');
        console.log('  Username: tech1');
        console.log('  Password: tech123');
    } catch (err) {
        console.error('Script error:', err);
    }
}

createTechnician();
