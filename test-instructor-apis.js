import axios from 'axios';

// Test script for instructor APIs
const BASE_URL = 'http://localhost:5002/api';

async function testInstructorAPIs() {
  console.log('🧪 Testing Instructor APIs...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data);

    // Test 2: Get instructor exams (this would require authentication in real scenario)
    console.log('\n2. Testing instructor exams endpoint...');
    try {
      const examsResponse = await axios.get(`${BASE_URL}/exams/instructor/test-instructor`);
      console.log('✅ Instructor exams endpoint accessible');
      console.log('Response:', examsResponse.data);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Authentication working correctly (403 Forbidden)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Get instructor stats
    console.log('\n3. Testing instructor stats endpoint...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/instructor/stats/test-instructor`);
      console.log('✅ Instructor stats endpoint accessible');
      console.log('Response:', statsResponse.data);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Authentication working correctly (403 Forbidden)');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 4: Create exam (POST) - this would require authentication
    console.log('\n4. Testing exam creation endpoint...');
    try {
      const createExamResponse = await axios.post(`${BASE_URL}/exams`, {
        title: 'Test Exam',
        subject: 'Mathematics',
        duration: 60,
        totalMarks: 100,
        passingMarks: 50,
        status: 'draft'
      });
      console.log('✅ Exam creation endpoint accessible');
      console.log('Response:', createExamResponse.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('✅ Authentication working correctly');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Instructor API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 5000');
    }
  }
}

// Run the tests
testInstructorAPIs();
