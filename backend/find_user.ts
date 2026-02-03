
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findUser() {
    const searchTerm = 'AHMAD ZAHID';
    console.log(`Searching for user: ${searchTerm}`);

    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('full_name', `%${searchTerm}%`);

    if (error) {
        console.error('Error finding user:', error);
    } else {
        if (users.length === 0) {
            console.log('No user found with that name.');
        } else {
            console.log(`Found ${users.length} user(s):`);
            console.log(users);
        }
    }
}

findUser();
