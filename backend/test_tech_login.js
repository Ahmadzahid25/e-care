// Test technician login with auto-detect system
const API_URL = 'http://localhost:3000/api';

async function testTechnicianLogin() {
    console.log('=== TECHNICIAN LOGIN TEST ===\n');
    console.log('Testing: afnan / afnan123\n');

    // Test 1: Try admin login (should fail)
    console.log('STEP 1: Try admin login (should FAIL)...');
    try {
        const adminRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'afnan',
                password: 'afnan123',
                role: 'admin'
            })
        });
        const adminData = await adminRes.json();
        if (adminRes.ok) {
            console.log('✓ Admin login successful (unexpected!)');
            console.log('  Role: admin');
            return;
        } else {
            console.log('✗ Admin login failed (expected):', adminData.error);
        }
    } catch (error) {
        console.log('✗ Admin login failed:', error.message);
    }

    // Test 2: Try technician login (should succeed)
    console.log('\nSTEP 2: Try technician login (should SUCCEED)...');
    try {
        const techRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'afnan',
                password: 'afnan123',
                role: 'technician'
            })
        });
        const techData = await techRes.json();
        if (techRes.ok) {
            console.log('✓ Technician login SUCCESSFUL!');
            console.log('  Name:', techData.user?.name);
            console.log('  Username:', techData.user?.username);
            console.log('  Department:', techData.user?.department);
            console.log('  Token received:', techData.token ? 'Yes' : 'No');
        } else {
            console.log('✗ Technician login FAILED:', techData.error);
        }
    } catch (error) {
        console.log('✗ Technician login failed:', error.message);
    }

    console.log('\n=== TEST COMPLETED ===');
}

testTechnicianLogin().catch(console.error);
