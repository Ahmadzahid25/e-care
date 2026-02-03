
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testPublicUrl() {
    console.log('Testing getPublicUrl...');

    // Test with a dummy path
    const path = '123456_test.jpg';

    const { data } = supabase.storage
        .from('warranty-docs')
        .getPublicUrl(path);

    console.log('Input Path:', path);
    console.log('Output Data:', JSON.stringify(data, null, 2));

    if (data.publicUrl === path) {
        console.log('❌ URL equals path! Something is wrong.');
    } else {
        console.log('✅ URL looks correct.');
    }
}

testPublicUrl();
