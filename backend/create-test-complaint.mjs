
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestComplaint() {
    console.log('📝 Creating Test Complaint for User 020116110323...\n');

    // 1. Get User ID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('ic_number', '020116110323')
        .single();

    if (userError || !user) {
        console.error('❌ User not found:', userError?.message);
        return;
    }
    console.log(`   User found: ${user.full_name} (${user.id})`);

    // 2. Generate Report Number
    // Simple logic: find max report number and increment, or just use a timestamp based one for testing
    // For consistency with app logic, let's fetch the last one
    const { data: lastComplaint } = await supabase
        .from('complaints')
        .select('report_number')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    let nextNum = 1000;
    if (lastComplaint?.report_number) {
        const numPart = parseInt(lastComplaint.report_number.substring(1));
        if (!isNaN(numPart)) nextNum = numPart + 1;
    }
    const reportNumber = `A${String(nextNum).padStart(5, '0')}`;

    // 3. Create Complaint
    // Using sample placeholder images for visual verification
    // In a real scenario these would be Supabase Storage URLs
    const sampleWarrantyUrl = 'https://placehold.co/600x800/e2e8f0/1e293b?text=WARRANTY+DOC';
    const sampleReceiptUrl = 'https://placehold.co/400x600/f1f5f9/0f172a?text=RECEIPT';

    const { data: complaint, error: createError } = await supabase
        .from('complaints')
        .insert({
            user_id: user.id,
            category_id: 1, // Repair
            subcategory: 'Mesin Basuh',
            brand_name: 'TEST BRAND',
            state: 'KAMPUNG RAJA (BESUT)',
            complaint_type: 'Under Warranty',
            details: 'TEST COMPLAINT - DISPLAY VERIFICATION\nChecking if warranty and receipt files appear in dashboard.',
            status: 'pending',
            report_number: reportNumber,
            warranty_file: sampleWarrantyUrl,
            receipt_file: sampleReceiptUrl
        })
        .select()
        .single();

    if (createError) {
        console.error('❌ Failed to create complaint:', createError.message);
    } else {
        console.log('✅ Test Complaint Created Successfully!');
        console.log(`   Report Number: ${complaint.report_number}`);
        console.log(`   Warranty File: ${complaint.warranty_file}`);
        console.log(`   Receipt File: ${complaint.receipt_file}`);
    }
}

createTestComplaint();
