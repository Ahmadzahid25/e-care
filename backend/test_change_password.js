// Test script for change password feature using native fetch
const API_URL = 'http://localhost:3000/api';
const IC_NUMBER = '020116110323';
const CURRENT_PASSWORD = 'Ecare@2026';
const NEW_PASSWORD = 'NewPass@2026';

async function testChangePassword() {
    console.log('=== CHANGE PASSWORD TEST ===\n');

    // Step 1: Login to get token
    console.log('STEP 1: Login with current password...');
    let token;
    try {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ic_number: IC_NUMBER,
                password: CURRENT_PASSWORD,
                role: 'user'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(loginData.error || 'Login failed');
        }
        token = loginData.token;
        console.log('✓ Login successful! Token received.');
        console.log('  User:', loginData.user.full_name);
    } catch (error) {
        console.log('✗ Login FAILED:', error.message);
        return;
    }

    // Step 2: Change password
    console.log('\nSTEP 2: Change password...');
    try {
        const changeRes = await fetch(`${API_URL}/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: CURRENT_PASSWORD,
                new_password: NEW_PASSWORD
            })
        });
        const changeData = await changeRes.json();
        if (!changeRes.ok) {
            throw new Error(changeData.error || 'Change password failed');
        }
        console.log('✓ Password changed successfully!');
        console.log('  Message:', changeData.message);
    } catch (error) {
        console.log('✗ Change password FAILED:', error.message);
        return;
    }

    // Step 3: Test login with NEW password
    console.log('\nSTEP 3: Test login with NEW password...');
    try {
        const newLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ic_number: IC_NUMBER,
                password: NEW_PASSWORD,
                role: 'user'
            })
        });
        const newLoginData = await newLoginRes.json();
        if (!newLoginRes.ok) {
            throw new Error(newLoginData.error || 'Login failed');
        }
        console.log('✓ Login with NEW password successful!');
        console.log('  User:', newLoginData.user.full_name);

        // Step 4: Restore original password
        console.log('\nSTEP 4: Restore original password...');
        const restoreRes = await fetch(`${API_URL}/users/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newLoginData.token}`
            },
            body: JSON.stringify({
                current_password: NEW_PASSWORD,
                new_password: CURRENT_PASSWORD
            })
        });
        const restoreData = await restoreRes.json();
        if (!restoreRes.ok) {
            throw new Error(restoreData.error || 'Restore failed');
        }
        console.log('✓ Original password restored!');
    } catch (error) {
        console.log('✗ FAILED:', error.message);
        return;
    }

    console.log('\n=== TEST COMPLETED ===');
    console.log('Password is now:', CURRENT_PASSWORD);
}

testChangePassword().catch(console.error);
