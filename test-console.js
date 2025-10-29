// BROWSER CONSOLE TEST SCRIPT
// Copy and paste this into your browser console (F12) to test the system

console.log('=== Testing LandChain Integration ===');

// Test 1: Check if mockDataStore is accessible
async function test1_checkMockDataStore() {
  console.log('\n📋 Test 1: Checking mockDataStore...');
  try {
    const { mockDataStore } = await import('./src/services/mockDataStore.ts');
    console.log('✅ mockDataStore imported successfully');
    console.log('Current data:', mockDataStore.getData ? 'Has getData' : 'No getData');

    // Try to get all data
    const allTransactions = mockDataStore.getAllTransactions();
    console.log('📊 Current transactions:', allTransactions.length);

    const allProperties = mockDataStore.getAllProperties();
    console.log('🏠 Current properties:', allProperties.length);

    const allUsers = mockDataStore.getAllUsers();
    console.log('👤 Current users:', allUsers.length);

    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

// Test 2: Check if fabricClient is accessible
async function test2_checkFabricClient() {
  console.log('\n📋 Test 2: Checking fabricClient...');
  try {
    const { fabricClient } = await import('./src/services/fabricClient.ts');
    console.log('✅ fabricClient imported successfully');
    console.log('Is connected:', fabricClient.isConnected);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

// Test 3: Try to register a test user
async function test3_registerTestUser() {
  console.log('\n📋 Test 3: Registering test user...');
  try {
    const { userChaincode } = await import('./src/services/fabricClient.ts');

    const userId = `TEST_USER_${Date.now()}`;
    const result = await userChaincode.registerUser({
      userId,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      aadhar: '123456789012',
      pan: 'ABCDE1234F',
      address: 'Test Address',
      role: 'USER',
      walletAddress: 'Not connected',
      passwordHash: 'test123'
    });

    console.log('✅ User registered:', result);

    // Verify user was added to mockDataStore
    const { mockDataStore } = await import('./src/services/mockDataStore.ts');
    const users = mockDataStore.getAllUsers();
    const foundUser = users.find(u => u.userId === userId);

    if (foundUser) {
      console.log('✅ User found in mockDataStore:', foundUser.name);
      return true;
    } else {
      console.error('❌ User NOT found in mockDataStore');
      console.log('All users:', users.map(u => u.name));
      return false;
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

// Test 4: Try to register a test property
async function test4_registerTestProperty() {
  console.log('\n📋 Test 4: Registering test property...');
  try {
    const { propertyChaincode } = await import('./src/services/fabricClient.ts');

    const propertyId = `TEST_PROP_${Date.now()}`;
    await propertyChaincode.registerProperty({
      propertyId,
      owner: 'TEST_OWNER',
      ownerName: 'Test Owner',
      location: 'Test Location',
      area: 1000,
      price: 1000000,
      propertyType: 'Residential',
      description: 'Test property',
      latitude: 0,
      longitude: 0
    });

    console.log('✅ Property registered');

    // Verify property was added to mockDataStore
    const { mockDataStore } = await import('./src/services/mockDataStore.ts');
    const properties = mockDataStore.getAllProperties();
    const foundProperty = properties.find(p => p.propertyId === propertyId);

    if (foundProperty) {
      console.log('✅ Property found in mockDataStore:', foundProperty.location);

      // Check if transaction was created
      const transactions = mockDataStore.getAllTransactions();
      const propertyTx = transactions.find(t => t.propertyId === propertyId);

      if (propertyTx) {
        console.log('✅ Transaction created:', propertyTx.type);
        return true;
      } else {
        console.error('❌ Transaction NOT created');
        console.log('All transactions:', transactions);
        return false;
      }
    } else {
      console.error('❌ Property NOT found in mockDataStore');
      console.log('All properties:', properties.map(p => p.location));
      return false;
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Test 5: Check localStorage
function test5_checkLocalStorage() {
  console.log('\n📋 Test 5: Checking localStorage...');
  try {
    const data = localStorage.getItem('landchain_mock_data');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('✅ localStorage has data');
      console.log('Users:', parsed.users?.length || 0);
      console.log('Properties:', parsed.properties?.length || 0);
      console.log('Offers:', parsed.offers?.length || 0);
      console.log('Transactions:', parsed.transactions?.length || 0);
      return true;
    } else {
      console.log('⚠️ localStorage is empty');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting tests...\n');

  const results = {
    test1: await test1_checkMockDataStore(),
    test2: await test2_checkFabricClient(),
    test3: await test3_registerTestUser(),
    test4: await test4_registerTestProperty(),
    test5: test5_checkLocalStorage()
  };

  console.log('\n=== Test Results ===');
  console.log('Test 1 (mockDataStore):', results.test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 2 (fabricClient):', results.test2 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 3 (Register User):', results.test3 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 4 (Register Property):', results.test4 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 5 (localStorage):', results.test5 ? '✅ PASS' : '❌ FAIL');

  const passedCount = Object.values(results).filter(r => r).length;
  console.log(`\n📊 ${passedCount}/5 tests passed`);

  if (passedCount === 5) {
    console.log('\n🎉 All tests passed! System is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check errors above for details.');
  }
}

// Run the tests
runAllTests();
