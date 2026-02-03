
const API_URL = 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall(method, endpoint, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}

async function testAllLogins() {
    console.log('🧪 Testing E-CARE System Login & Dashboard\n');
    console.log('='.repeat(50));

    // 1. Test User Login
    console.log('\n👤 TEST 1: User Login');
    console.log('-'.repeat(40));
    try {
        const userLogin = await apiCall('POST', '/auth/login', {
            ic_number: '020116110323',
            password: 'Ecare@2026',
            role: 'user'
        });
        console.log('✅ User Login SUCCESS');
        console.log('   User:', userLogin.user.full_name);
        console.log('   IC:', userLogin.user.ic_number);
        console.log('   Email:', userLogin.user.email);

        // Test fetching complaints
        const complaints = await apiCall('GET', '/complaints', null, userLogin.token);
        console.log('   Complaints:', complaints.complaints.length);
        complaints.complaints.forEach(c => {
            console.log(`      - ${c.report_number}: ${c.status}`);
        });
    } catch (error) {
        console.log('❌ User Login FAILED:', error.message);
    }

    // 2. Test Admin Login
    console.log('\n👑 TEST 2: Admin Login');
    console.log('-'.repeat(40));
    try {
        const adminLogin = await apiCall('POST', '/auth/login', {
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        });
        console.log('✅ Admin Login SUCCESS');
        console.log('   Admin:', adminLogin.user.admin_name);
        console.log('   Username:', adminLogin.user.username);

        // Test fetching all complaints
        const complaints = await apiCall('GET', '/complaints', null, adminLogin.token);
        console.log('   Total Complaints:', complaints.complaints.length);

        // Test fetching users
        const users = await apiCall('GET', '/admin/users', null, adminLogin.token);
        console.log('   Total Users:', users.users.length);
        users.users.forEach(u => {
            console.log(`      - ${u.full_name} (${u.ic_number})`);
        });

        // Test fetching technicians
        const techs = await apiCall('GET', '/admin/technicians', null, adminLogin.token);
        console.log('   Total Technicians:', techs.technicians.length);
        techs.technicians.forEach(t => {
            console.log(`      - ${t.name} (${t.username})`);
        });

        // Test fetching categories
        const categories = await apiCall('GET', '/categories', null, adminLogin.token);
        console.log('   Total Categories:', categories.categories.length);

        // Test fetching brands
        const brands = await apiCall('GET', '/brands', null, adminLogin.token);
        console.log('   Total Brands:', brands.brands.length);

        // Test fetching states
        const states = await apiCall('GET', '/states', null, adminLogin.token);
        console.log('   Total States:', states.states.length);

    } catch (error) {
        console.log('❌ Admin Login FAILED:', error.message);
    }

    // 3. Test Technician Login
    console.log('\n🔧 TEST 3: Technician Login');
    console.log('-'.repeat(40));
    try {
        const techLogin = await apiCall('POST', '/auth/login', {
            username: 'afnan',
            password: 'Ecare@2026',
            role: 'technician'
        });
        console.log('✅ Technician Login SUCCESS');
        console.log('   Technician:', techLogin.user.name);
        console.log('   Username:', techLogin.user.username);
        console.log('   Department:', techLogin.user.department);

        // Test fetching assigned complaints
        const complaints = await apiCall('GET', '/complaints', null, techLogin.token);
        console.log('   Assigned Complaints:', complaints.complaints.length);
    } catch (error) {
        console.log('❌ Technician Login FAILED:', error.message);
    }

    // 4. Test IC Verification (Public Complaint)
    console.log('\n🔍 TEST 4: IC Verification (Public Complaint)');
    console.log('-'.repeat(40));
    try {
        const verifyIC = await apiCall('POST', '/auth/verify-ic', {
            ic_number: '020116110323'
        });
        console.log('✅ IC Verification SUCCESS');
        console.log('   Registered:', verifyIC.registered);
        console.log('   User:', verifyIC.user.full_name);
    } catch (error) {
        console.log('❌ IC Verification FAILED:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 All tests completed!');
}

testAllLogins();
