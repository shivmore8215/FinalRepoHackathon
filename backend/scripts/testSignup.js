import dotenv from 'dotenv';

dotenv.config();

const testSignupAPI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        email: 'testuser123@example.com',
        password: 'password123',
        fullName: 'Test User 123'
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Signup successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Signup failed!');
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testSignupAPI();