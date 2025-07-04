// Simple test to verify the limit parameter fix
const axios = require('axios');

const API_BASE = 'http://localhost:4001/api';

async function testLimitParameter() {
  try {
    console.log('Testing notification API with limit parameter...');
    
    // Test notifications with limit
    const notificationResponse = await axios.get(
      `${API_BASE}/notifications/user/user123?limit=5`,
      { validateStatus: () => true }
    );
    
    console.log(`Notification API Status: ${notificationResponse.status}`);
    if (notificationResponse.status === 400) {
      console.log('Error:', notificationResponse.data);
    } else {
      console.log('✅ Notification API with limit works!');
    }
    
    console.log('\nTesting events API with limit parameter...');
    
    // Test events with limit
    const eventsResponse = await axios.get(
      `${API_BASE}/events?limit=10`,
      { validateStatus: () => true }
    );
    
    console.log(`Events API Status: ${eventsResponse.status}`);
    if (eventsResponse.status === 400) {
      console.log('Error:', eventsResponse.data);
    } else {
      console.log('✅ Events API with limit works!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLimitParameter();
