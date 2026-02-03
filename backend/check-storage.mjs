
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorageBuckets() {
    console.log('Checking Supabase storage buckets...');

    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.log('Error listing buckets:', error.message);
    } else {
        console.log('Available buckets:', buckets.map(b => b.name));
    }

    // Try to create the buckets if they don't exist
    const requiredBuckets = ['warranty-docs', 'receipt-docs'];

    for (const bucketName of requiredBuckets) {
        const exists = buckets?.find(b => b.name === bucketName);
        if (!exists) {
            console.log(`Creating bucket: ${bucketName}`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
            });
            if (createError) {
                console.log(`Error creating ${bucketName}:`, createError.message);
            } else {
                console.log(`Created bucket: ${bucketName}`);
            }
        } else {
            console.log(`Bucket exists: ${bucketName}`);
        }
    }
}

checkStorageBuckets();
