
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = 'http://localhost:3000/api';

async function testUnderWarrantyFlow() {
    console.log('🧪 Testing Under Warranty Complaint Flow\n');
    console.log('='.repeat(50));

    try {
        // Step 1: Verify IC
        console.log('\n1️⃣ Verifying IC Number...');
        const verifyResponse = await fetch(`${API_URL}/auth/verify-ic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ic_number: '020116110323' })
        });
        const verifyData = await verifyResponse.json();

        if (!verifyData.registered) {
            throw new Error('IC not registered');
        }
        console.log('   ✅ IC Verified:', verifyData.user.full_name);
        console.log('   Token received');

        const token = verifyData.token;

        // Step 2: Create complaint with files using FormData
        // Note: We can't easily test file upload via Node.js fetch, 
        // so let's check if we can create a complaint and verify storage

        console.log('\n2️⃣ Checking Supabase Storage Buckets...');
        const { data: warBuckets } = await supabase.storage.listBuckets();
        console.log('   Available buckets:', warBuckets?.map(b => b.name).join(', '));

        // Step 3: Check existing complaints with files
        console.log('\n3️⃣ Checking Existing Complaints for File Fields...');
        const { data: complaints } = await supabase
            .from('complaints')
            .select('id, report_number, complaint_type, warranty_file, receipt_file')
            .order('created_at', { ascending: false })
            .limit(5);

        console.log('   Recent complaints:');
        complaints?.forEach(c => {
            console.log(`   - ${c.report_number} (${c.complaint_type})`);
            console.log(`     Warranty file: ${c.warranty_file || 'NULL'}`);
            console.log(`     Receipt file: ${c.receipt_file || 'NULL'}`);
        });

        // Step 4: Check storage files
        console.log('\n4️⃣ Checking Storage Contents...');
        const { data: warFiles } = await supabase.storage.from('warranty-docs').list();
        const { data: recFiles } = await supabase.storage.from('receipt-docs').list();

        console.log(`   Warranty docs: ${warFiles?.length || 0} files`);
        warFiles?.forEach(f => console.log(`     - ${f.name}`));

        console.log(`   Receipt docs: ${recFiles?.length || 0} files`);
        recFiles?.forEach(f => console.log(`     - ${f.name}`));

        // Step 5: Test complaint retrieval via API
        console.log('\n5️⃣ Testing Complaint Retrieval via API...');
        const complaintResponse = await fetch(`${API_URL}/complaints`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const complaintData = await complaintResponse.json();

        console.log(`   Total complaints for user: ${complaintData.complaints.length}`);
        complaintData.complaints.forEach(c => {
            console.log(`   - ${c.report_number}: ${c.status}`);
            if (c.warranty_file) console.log(`     WARRANTY: ${c.warranty_file.substring(0, 60)}...`);
            if (c.receipt_file) console.log(`     RECEIPT: ${c.receipt_file.substring(0, 60)}...`);
        });

        console.log('\n' + '='.repeat(50));
        console.log('✅ Under Warranty flow check completed!');
        console.log('\n📌 To fully test file upload:');
        console.log('   1. Go to http://localhost:5173/complaint?type=kerosakan');
        console.log('   2. Enter IC: 020116110323');
        console.log('   3. Select "Under Warranty"');
        console.log('   4. Upload warranty and receipt files');
        console.log('   5. Submit and check dashboard');

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testUnderWarrantyFlow();
