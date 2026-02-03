
const API_URL = 'http://localhost:3000/api';

async function testResetPassword() {
    console.log('🔐 Testing Technician Reset Password API\n');

    // First login as admin
    try {
        console.log('1. Logging in as admin...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            })
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
            throw new Error(loginData.error);
        }
        console.log('   ✅ Admin login successful');

        // Get technicians list
        console.log('\n2. Getting technicians list...');
        const techResponse = await fetch(`${API_URL}/admin/technicians`, {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const techData = await techResponse.json();
        console.log(`   Found ${techData.technicians.length} technicians:`);
        techData.technicians.forEach(t => {
            console.log(`   - ${t.name} (${t.username}) ID: ${t.id}`);
        });

        // Find Afnan's ID
        const afnan = techData.technicians.find(t => t.username === 'afnan');
        if (!afnan) {
            throw new Error('Technician Afnan not found');
        }

        // Test reset password
        console.log(`\n3. Resetting password for ${afnan.name} (${afnan.id})...`);
        const resetResponse = await fetch(`${API_URL}/admin/technicians/${afnan.id}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                new_password: 'NewPass123'
            })
        });

        const resetData = await resetResponse.json();
        if (!resetResponse.ok) {
            throw new Error(resetData.error);
        }
        console.log('   ✅ Password reset successful');
        console.log('   Message:', resetData.message);

        // Verify by logging in with new password
        console.log('\n4. Verifying by logging in with new password...');
        const verifyLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'afnan',
                password: 'NewPass123',
                role: 'technician'
            })
        });

        const verifyData = await verifyLogin.json();
        if (!verifyLogin.ok) {
            console.log('   ❌ Login with new password FAILED:', verifyData.error);
        } else {
            console.log('   ✅ Login with new password SUCCESSFUL');
            console.log('   Technician:', verifyData.user.name);
        }

        // Reset back to original password
        console.log('\n5. Resetting password back to Ecare@2026...');
        const resetBack = await fetch(`${API_URL}/admin/technicians/${afnan.id}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                new_password: 'Ecare@2026'
            })
        });

        if (resetBack.ok) {
            console.log('   ✅ Password reset back to Ecare@2026');
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n✅ Reset password test completed!');
}

testResetPassword();
