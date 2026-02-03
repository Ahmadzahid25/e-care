// Debug script to test admin stats endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAdminStats() {
    console.log('=== Testing Admin Dashboard Stats ===\n');

    try {
        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: 'admin',
                username: 'admin',
                password: 'admin123'
            })
        });

        const loginData = await loginRes.json();
        console.log('Login response:', loginRes.status, JSON.stringify(loginData, null, 2));

        if (!loginData.token) {
            console.log('❌ Login failed - no token received');
            return;
        }

        const token = loginData.token;
        console.log('✅ Login successful, token received\n');

        // Step 2: Test /admin/stats
        console.log('2. Testing /admin/stats...');
        const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Stats response status:', statsRes.status);
        const statsData = await statsRes.json();
        console.log('Stats data:', JSON.stringify(statsData, null, 2));

        if (statsRes.ok) {
            console.log('✅ Stats endpoint working!\n');
        } else {
            console.log('❌ Stats endpoint failed\n');
        }

        // Step 3: Test /admin/technician-stats
        console.log('3. Testing /admin/technician-stats...');
        const techRes = await fetch(`${BASE_URL}/admin/technician-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Technician stats response status:', techRes.status);
        const techData = await techRes.json();
        console.log('Technician stats data:', JSON.stringify(techData, null, 2));

        if (techRes.ok) {
            console.log('✅ Technician stats endpoint working!\n');
        } else {
            console.log('❌ Technician stats endpoint failed\n');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.cause) {
            console.error('Cause:', error.cause);
        }
    }
}

testAdminStats();
