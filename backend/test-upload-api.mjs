
const API_URL = 'http://localhost:3000/api';

async function testUpload() {
    console.log('🧪 Testing Full Upload API Flow (Simulating Frontend)\n');

    try {
        // 1. Login/Verify IC to get token
        const verifyResponse = await fetch(`${API_URL}/auth/verify-ic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ic_number: '020116110323' })
        });
        const verifyData = await verifyResponse.json();

        if (!verifyData.registered) throw new Error('IC not registered');
        const token = verifyData.token;
        console.log('✅ Token received');

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('category_id', '1');
        formData.append('subcategory', 'Mesin Basuh');
        formData.append('complaint_type', 'Under Warranty');
        formData.append('state', 'JERTEH');
        formData.append('brand_name', 'MIDEA');
        formData.append('model_no', 'TEST-MODEL-API');
        formData.append('details', 'API UPLOAD TEST - Checking full URL storage');

        // Simulate file from Blob/Buffer
        // In Node.js native fetch, we can assume Blob is available or we construct it
        // Creating a minimal 'fake' image file content
        const fakeImage = new Blob(['fake image content'], { type: 'image/jpeg' });
        const fakePdf = new Blob(['fake pdf content'], { type: 'application/pdf' });

        formData.append('warranty_file', fakeImage, 'test_warranty.jpg');
        formData.append('receipt_file', fakePdf, 'test_receipt.pdf');

        // 3. Send Request
        // IMPORTANT: DO NOT set Content-Type header manually when using FormData
        console.log('📤 Sending POST /complaints with FormData...');

        const response = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Content-Type left to browser/fetch to set boundary
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Request Failed:', data);
            return;
        }

        console.log('✅ Request Successful!');
        console.log('   New Report Number:', data.report_number);

        // 4. Verify Backend logs will show up in the other terminal
        // but we can also verify by fetching the complaint back

        // Wait a bit for async stuff? usually not needed

        // Fetch it back
        /*
        const getResponse = await fetch(`${API_URL}/complaints?report_number=${data.report_number}`, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        // Filtering by report number might not be implemented in GET /, 
        // so let's skip automated verification and check logs.
        */

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testUpload();
