const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store for mock data (fallback when Fabric is not running)
let mockMode = false;
const mockData = {
  users: [],
  properties: [],
  offers: [],
  transactions: [],
  escrows: []
};

// Fabric connection configuration
const ccpPath = path.resolve(__dirname, '..', 'network', 'connection-org1.json');
const walletPath = path.resolve(__dirname, 'wallet');

let gateway;
let contract;

// Initialize Fabric connection
async function initFabric() {
  try {
    console.log('🔗 Connecting to Hyperledger Fabric network...');

    // Check if connection profile exists
    if (!fs.existsSync(ccpPath)) {
      console.warn('⚠️  Connection profile not found. Running in MOCK MODE.');
      mockMode = true;
      return;
    }

    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin identity exists
    const identity = await wallet.get('admin');
    if (!identity) {
      console.warn('⚠️  Admin identity not found. Running in MOCK MODE.');
      mockMode = true;
      return;
    }

    // Connect to gateway
    gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get network and contract
    const network = await gateway.getNetwork('landregistry');
    contract = network.getContract('property-contract');

    console.log('✅ Connected to Fabric network successfully!');
    mockMode = false;
  } catch (error) {
    console.error('❌ Failed to connect to Fabric:', error.message);
    console.log('⚠️  Running in MOCK MODE');
    mockMode = true;
  }
}

// Helper function to execute chaincode
async function executeChaincode(contractName, functionName, ...args) {
  if (mockMode) {
    console.log(`[MOCK] ${contractName}.${functionName}(${args.join(', ')})`);
    return { success: true, message: 'Mock transaction successful', data: args };
  }

  try {
    const result = await contract.submitTransaction(functionName, ...args);
    return { success: true, data: JSON.parse(result.toString()) };
  } catch (error) {
    console.error(`Error executing ${functionName}:`, error);
    throw error;
  }
}

// Helper to add to mock storage and track transactions
function addToMockStorage(type, data) {
  mockData[type].push(data);

  // Auto-create transaction
  if (type === 'properties') {
    mockData.transactions.push({
      transactionId: `TXN_${Date.now()}`,
      propertyId: data.propertyId,
      fromOwner: '',
      toOwner: data.owner,
      amount: data.price,
      status: 'COMPLETED',
      offerId: '',
      timestamp: new Date().toISOString(),
      type: 'PROPERTY_REGISTERED'
    });
  } else if (type === 'offers') {
    mockData.transactions.push({
      transactionId: `TXN_${Date.now()}`,
      propertyId: data.propertyId,
      fromOwner: data.buyerId,
      toOwner: data.sellerId,
      amount: data.offerAmount,
      status: 'PENDING',
      offerId: data.offerId,
      timestamp: new Date().toISOString(),
      type: 'OFFER_CREATED'
    });
  }
}

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: mockMode ? 'MOCK' : 'FABRIC',
    timestamp: new Date().toISOString()
  });
});

// User APIs
app.post('/api/users/register', async (req, res) => {
  try {
    console.log('📝 Register user:', req.body.name);
    const userData = req.body;

    if (mockMode) {
      mockData.users.push(userData);
      res.json({ success: true, userId: userData.userId });
    } else {
      await executeChaincode(
        'user-contract',
        'RegisterUser',
        userData.userId,
        userData.name,
        userData.email,
        userData.phone,
        userData.aadhar,
        userData.pan,
        userData.address,
        userData.role,
        userData.walletAddress,
        userData.passwordHash
      );
      res.json({ success: true, userId: userData.userId });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (mockMode) {
      const user = mockData.users.find(u => u.userId === userId);
      res.json({ success: true, data: user });
    } else {
      const result = await contract.evaluateTransaction('GetUser', userId);
      res.json({ success: true, data: JSON.parse(result.toString()) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Property APIs
app.post('/api/properties/register', async (req, res) => {
  try {
    console.log('🏠 Register property:', req.body.location);
    const propertyData = req.body;

    if (mockMode) {
      addToMockStorage('properties', propertyData);
      res.json({ success: true, propertyId: propertyData.propertyId });
    } else {
      await executeChaincode(
        'property-contract',
        'RegisterProperty',
        propertyData.propertyId,
        propertyData.owner,
        propertyData.ownerName,
        propertyData.location,
        propertyData.area.toString(),
        propertyData.price.toString(),
        propertyData.propertyType,
        propertyData.description,
        propertyData.latitude.toString(),
        propertyData.longitude.toString()
      );
      res.json({ success: true, propertyId: propertyData.propertyId });
    }
  } catch (error) {
    console.error('Error registering property:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/properties', async (req, res) => {
  try {
    if (mockMode) {
      res.json({ success: true, data: mockData.properties });
    } else {
      const result = await contract.evaluateTransaction('GetAllProperties');
      res.json({ success: true, data: JSON.parse(result.toString()) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/properties/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (mockMode) {
      const property = mockData.properties.find(p => p.propertyId === propertyId);
      res.json({ success: true, data: property });
    } else {
      const result = await contract.evaluateTransaction('GetProperty', propertyId);
      res.json({ success: true, data: JSON.parse(result.toString()) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Offer APIs
app.post('/api/offers/create', async (req, res) => {
  try {
    console.log('💰 Create offer:', req.body.offerId);
    const offerData = req.body;

    if (mockMode) {
      addToMockStorage('offers', offerData);
      res.json({ success: true, offerId: offerData.offerId });
    } else {
      await executeChaincode(
        'offer-contract',
        'CreateOffer',
        offerData.offerId,
        offerData.propertyId,
        offerData.buyerId,
        offerData.buyerName,
        offerData.sellerId,
        offerData.sellerName,
        offerData.offerAmount.toString(),
        offerData.message
      );
      res.json({ success: true, offerId: offerData.offerId });
    }
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    if (mockMode) {
      res.json({ success: true, data: mockData.offers });
    } else {
      const result = await contract.evaluateTransaction('GetAllOffers');
      res.json({ success: true, data: JSON.parse(result.toString()) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/offers/:offerId/accept', async (req, res) => {
  try {
    const { offerId } = req.params;

    if (mockMode) {
      const offer = mockData.offers.find(o => o.offerId === offerId);
      if (offer) {
        offer.status = 'ACCEPTED';
        mockData.transactions.push({
          transactionId: `TXN_${Date.now()}`,
          propertyId: offer.propertyId,
          fromOwner: offer.sellerId,
          toOwner: offer.buyerId,
          amount: offer.offerAmount,
          status: 'PENDING',
          offerId: offer.offerId,
          timestamp: new Date().toISOString(),
          type: 'OFFER_ACCEPTED'
        });
      }
      res.json({ success: true });
    } else {
      await executeChaincode('offer-contract', 'AcceptOffer', offerId);
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction APIs
app.get('/api/transactions', async (req, res) => {
  try {
    if (mockMode) {
      res.json({ success: true, data: mockData.transactions });
    } else {
      const result = await contract.evaluateTransaction('GetAllTransactions');
      res.json({ success: true, data: JSON.parse(result.toString()) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  await initFabric();
  console.log('✅ Server ready to handle requests');
  console.log(`Mode: ${mockMode ? '⚠️  MOCK (no Fabric)' : '✅ FABRIC CONNECTED'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (gateway) {
    await gateway.disconnect();
  }
  process.exit(0);
});
