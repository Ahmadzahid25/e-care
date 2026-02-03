const axios = require('axios');

async function testUserLogin() {
    try {
        console.log('Testing user login...');
        const response = await axios.post('http://localhost:3000/api/auth/user/login', {
            ic_number: '020116110323',
            password: 'Ecare@2026'
        });
        console.log('SUCCESS!');
        console.log('User:', response.data.user?.full_name || response.data.user);
        console.log('Token received:', response.data.token ? 'Yes' : 'No');
    } catch (error) {
        console.log('ERROR:', error.response?.status, error.response?.data?.error || error.message);
    }
}

testUserLogin();
