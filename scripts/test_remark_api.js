// Test script to verify Edit/Delete remark API endpoints
const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTests() {
    console.log('=== Testing Edit/Delete Remark API ===\n');

    // Step 1: Login as technician
    console.log('1. Login as technician (afnan/afnan123)...');
    try {
        const loginRes = await makeRequest('POST', '/auth/login', {
            username: 'afnan',
            password: 'afnan123',
            role: 'technician'
        });
        console.log('   Status:', loginRes.status);

        if (loginRes.status !== 200) {
            console.log('   Login failed:', loginRes.data);
            return;
        }

        const token = loginRes.data.token;
        console.log('   ✅ Login successful! Token received.\n');

        // Step 2: Get complaint #9 to find a remark ID
        console.log('2. Fetching complaint #9...');
        const complaintRes = await makeRequest('GET', '/complaints/9', null, token);
        console.log('   Status:', complaintRes.status);

        if (complaintRes.status !== 200) {
            console.log('   Failed to get complaint:', complaintRes.data);
            return;
        }

        const techRemarks = complaintRes.data.techRemarks || [];
        console.log('   Found', techRemarks.length, 'technician remarks');

        if (techRemarks.length === 0) {
            console.log('   No technician remarks to test. Please add one first.');
            return;
        }

        const remarkToTest = techRemarks[0];
        console.log('   Testing with remark ID:', remarkToTest.id);
        console.log('   Current remark text:', remarkToTest.remark, '\n');

        // Step 3: Update the remark
        console.log('3. Testing UPDATE remark (PUT /complaints/remarks/' + remarkToTest.id + ')...');
        const updateRes = await makeRequest('PUT', '/complaints/remarks/' + remarkToTest.id, {
            note_transport: remarkToTest.note_transport || '',
            checking: remarkToTest.checking || '',
            remark: (remarkToTest.remark || '') + ' - API TEST UPDATE',
            status: remarkToTest.status || 'pending'
        }, token);
        console.log('   Status:', updateRes.status);
        console.log('   Response:', JSON.stringify(updateRes.data));

        if (updateRes.status === 200) {
            console.log('   ✅ UPDATE SUCCESS!\n');
        } else {
            console.log('   ❌ UPDATE FAILED\n');
        }

        // Step 4: Verify the update
        console.log('4. Verifying update...');
        const verifyRes = await makeRequest('GET', '/complaints/9', null, token);
        const updatedRemark = verifyRes.data.techRemarks?.find(r => r.id === remarkToTest.id);
        if (updatedRemark) {
            console.log('   Updated remark text:', updatedRemark.remark);
            if (updatedRemark.remark?.includes('API TEST UPDATE')) {
                console.log('   ✅ Update verified!\n');
            }
        }

        console.log('=== Test Complete ===');

    } catch (error) {
        console.log('Error:', error.message);
    }
}

runTests();
