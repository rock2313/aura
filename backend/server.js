const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File-based persistence
const DATA_FILE = path.join(__dirname, 'data-store.json');

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      console.log('📂 Loaded data from file:', {
        users: parsed.users?.length || 0,
        properties: parsed.properties?.length || 0,
        offers: parsed.offers?.length || 0,
        transactions: parsed.transactions?.length || 0
      });
      return parsed;
    }
  } catch (error) {
    console.error('⚠️  Error loading data file:', error.message);
  }
  return {
    users: [],
    properties: [],
    offers: [],
    transactions: [],
    escrows: []
  };
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
    console.log('💾 Data saved to file');
  } catch (error) {
    console.error('⚠️  Error saving data:', error.message);
  }
}

// Auto-save every 10 seconds
setInterval(saveData, 10000);

// In-memory data store (now persisted to file)
const store = loadData();

// Initialize demo users if empty
function initDemoUsers() {
  if (store.users.length === 0) {
    console.log('📝 Initializing demo users...');

    const demoUsers = [
      {
        userId: 'ADMIN_001',
        name: 'Admin Officer',
        email: 'admin@landregistry.gov',
        phone: '1234567890',
        aadhar: '1111-1111-1111',
        pan: 'ADMIN1111A',
        address: 'Land Registry Office, Government Building',
        role: 'ADMIN',
        walletAddress: '0xAdmin000...',
        passwordHash: btoa('admin123'),
        isVerified: true,
        documents: [],
        registeredAt: new Date().toISOString()
      },
      {
        userId: 'USER_SELLER_001',
        name: 'Ramesh Kumar',
        email: 'ramesh@example.com',
        phone: '9876543210',
        aadhar: '2222-2222-2222',
        pan: 'RAMSH2222B',
        address: 'Plot 123, Jubilee Hills, Hyderabad',
        role: 'USER',
        walletAddress: '0xSeller001...',
        passwordHash: btoa('seller123'),
        isVerified: true,
        documents: [],
        registeredAt: new Date().toISOString()
      },
      {
        userId: 'USER_BUYER_001',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543211',
        aadhar: '3333-3333-3333',
        pan: 'PRIYA3333C',
        address: 'Flat 45, Banjara Hills, Hyderabad',
        role: 'USER',
        walletAddress: '0xBuyer001...',
        passwordHash: btoa('buyer123'),
        isVerified: true,
        documents: [],
        registeredAt: new Date().toISOString()
      }
    ];

    store.users.push(...demoUsers);
    console.log(`✅ Created ${demoUsers.length} demo users`);
    saveData();
  }
}

// Initialize demo properties for demo users
function initDemoProperties() {
  const sellerUser = store.users.find(u => u.userId === 'USER_SELLER_001');
  if (sellerUser && store.properties.length <= 1) {
    console.log('🏠 Initializing demo properties...');

    const demoProperties = [
      {
        propertyId: 'PROP_DEMO_001',
        owner: 'USER_SELLER_001',
        ownerName: 'Ramesh Kumar',
        location: 'Plot 45, Jubilee Hills, Hyderabad, Telangana',
        area: 2000,
        price: 15000000,
        propertyType: 'Residential',
        description: 'Beautiful 2000 sq ft residential plot in prime location',
        latitude: 17.4239,
        longitude: 78.4738,
        status: 'VERIFIED',
        listedForSale: true,
        documents: [],
        verifiedBy: 'ADMIN_001',
        verifiedAt: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        views: 15
      },
      {
        propertyId: 'PROP_DEMO_002',
        owner: 'USER_SELLER_001',
        ownerName: 'Ramesh Kumar',
        location: 'Survey No 123, Gachibowli, Hyderabad, Telangana',
        area: 3000,
        price: 25000000,
        propertyType: 'Commercial',
        description: 'Commercial plot near IT hub, excellent investment',
        latitude: 17.4400,
        longitude: 78.3489,
        status: 'VERIFIED',
        listedForSale: false,
        documents: [],
        verifiedBy: 'ADMIN_001',
        verifiedAt: new Date().toISOString(),
        registeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        views: 8
      },
      {
        propertyId: 'PROP_DEMO_003',
        owner: 'USER_SELLER_001',
        ownerName: 'Ramesh Kumar',
        location: 'House 789, Madhapur, Hyderabad, Telangana',
        area: 1500,
        price: 8500000,
        propertyType: 'Residential',
        description: 'Ready to move 3BHK house with modern amenities',
        latitude: 17.4483,
        longitude: 78.3915,
        status: 'PENDING',
        listedForSale: false,
        documents: [],
        verifiedBy: '',
        verifiedAt: '',
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
        views: 3
      }
    ];

    store.properties = store.properties.filter(p => !p.propertyId.startsWith('PROP_DEMO'));
    store.properties.push(...demoProperties);

    // Create transactions for demo properties
    demoProperties.forEach(prop => {
      createTransaction('PROPERTY_REGISTERED', {
        propertyId: prop.propertyId,
        toOwner: prop.owner,
        amount: prop.price,
        status: 'COMPLETED'
      });

      if (prop.status === 'VERIFIED') {
        createTransaction('PROPERTY_VERIFIED', {
          propertyId: prop.propertyId,
          toOwner: prop.owner,
          amount: prop.price,
          status: 'COMPLETED'
        });
      }

      if (prop.listedForSale) {
        createTransaction('PROPERTY_LISTED', {
          propertyId: prop.propertyId,
          toOwner: prop.owner,
          amount: prop.price,
          status: 'COMPLETED'
        });
      }
    });

    console.log(`✅ Created ${demoProperties.length} demo properties`);
    saveData();
  }
}

// Call initialization functions
initDemoUsers();
initDemoProperties();

// Helper to create transactions
function createTransaction(type, data) {
  const transaction = {
    transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    propertyId: data.propertyId || '',
    fromOwner: data.fromOwner || '',
    toOwner: data.toOwner || '',
    amount: data.amount || 0,
    status: data.status || 'COMPLETED',
    offerId: data.offerId || '',
    timestamp: new Date().toISOString(),
    type: type
  };
  store.transactions.push(transaction);
  console.log('📝 Transaction created:', type, transaction.transactionId);
  saveData(); // Save immediately after transaction
  return transaction;
}

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'MOCK',
    timestamp: new Date().toISOString(),
    stats: {
      users: store.users.length,
      properties: store.properties.length,
      offers: store.offers.length,
      transactions: store.transactions.length
    }
  });
});

// Sync data (accept data from frontend)
app.post('/api/sync', (req, res) => {
  try {
    const { users, properties, offers, transactions, escrows } = req.body;
    if (users) store.users = users;
    if (properties) store.properties = properties;
    if (offers) store.offers = offers;
    if (transactions) store.transactions = transactions;
    if (escrows) store.escrows = escrows;
    console.log('🔄 Data synced from frontend');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all data
app.get('/api/data', (req, res) => {
  res.json({ success: true, data: store });
});

// User APIs
app.post('/api/users/register', (req, res) => {
  try {
    console.log('👤 Register user:', req.body.name);
    const userData = {
      ...req.body,
      registeredAt: new Date().toISOString()
    };
    store.users.push(userData);
    saveData(); // Save immediately
    res.json({ success: true, userId: userData.userId, data: userData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  res.json({ success: true, data: store.users });
});

app.get('/api/users/:userId', (req, res) => {
  const user = store.users.find(u => u.userId === req.params.userId);
  res.json({ success: true, data: user });
});

// Property APIs
app.post('/api/properties/register', (req, res) => {
  try {
    console.log('🏠 Register property:', req.body.location);
    const propertyData = {
      ...req.body,
      status: 'PENDING',
      listedForSale: false,
      documents: [],
      verifiedBy: '',
      verifiedAt: '',
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      views: 0
    };
    store.properties.push(propertyData);

    // Create transaction (saveData() is called inside createTransaction)
    createTransaction('PROPERTY_REGISTERED', {
      propertyId: propertyData.propertyId,
      toOwner: propertyData.owner,
      amount: propertyData.price,
      status: 'COMPLETED'
    });

    res.json({ success: true, propertyId: propertyData.propertyId, data: propertyData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/properties', (req, res) => {
  res.json({ success: true, data: store.properties });
});

// Get properties owned by a specific user
app.get('/api/properties/user/:userId', (req, res) => {
  const userProperties = store.properties.filter(p => p.owner === req.params.userId);
  res.json({ success: true, data: userProperties });
});

// Get marketplace listings (properties for sale)
app.get('/api/properties/marketplace/all', (req, res) => {
  const marketplace = store.properties.filter(p =>
    p.status === 'VERIFIED' && p.listedForSale === true
  );
  res.json({ success: true, data: marketplace });
});

app.get('/api/properties/:propertyId', (req, res) => {
  const property = store.properties.find(p => p.propertyId === req.params.propertyId);
  res.json({ success: true, data: property });
});

// List property for sale
app.put('/api/properties/:propertyId/list-for-sale', (req, res) => {
  try {
    const property = store.properties.find(p => p.propertyId === req.params.propertyId);
    if (property) {
      if (property.status !== 'VERIFIED') {
        return res.status(400).json({
          error: 'Property must be verified before listing for sale'
        });
      }
      property.listedForSale = true;
      property.lastUpdated = new Date().toISOString();

      createTransaction('PROPERTY_LISTED', {
        propertyId: property.propertyId,
        toOwner: property.owner,
        amount: property.price,
        status: 'COMPLETED'
      });

      res.json({ success: true, data: property });
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlist property from sale
app.put('/api/properties/:propertyId/unlist', (req, res) => {
  try {
    const property = store.properties.find(p => p.propertyId === req.params.propertyId);
    if (property) {
      property.listedForSale = false;
      property.lastUpdated = new Date().toISOString();

      createTransaction('PROPERTY_UNLISTED', {
        propertyId: property.propertyId,
        toOwner: property.owner,
        amount: property.price,
        status: 'COMPLETED'
      });

      res.json({ success: true, data: property });
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin verifies property
app.put('/api/properties/:propertyId/verify', (req, res) => {
  try {
    const { adminId } = req.body;
    const property = store.properties.find(p => p.propertyId === req.params.propertyId);
    if (property) {
      property.status = 'VERIFIED';
      property.verifiedBy = adminId;
      property.verifiedAt = new Date().toISOString();
      property.lastUpdated = new Date().toISOString();

      createTransaction('PROPERTY_VERIFIED', {
        propertyId: property.propertyId,
        toOwner: property.owner,
        amount: property.price,
        status: 'COMPLETED'
      });

      res.json({ success: true, data: property });
    } else {
      res.status(404).json({ error: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Offer APIs
app.post('/api/offers/create', (req, res) => {
  try {
    console.log('💰 Create offer:', req.body.offerId);
    const offerData = {
      ...req.body,
      status: 'PENDING',
      adminVerified: false,
      adminId: '',
      verifiedAt: '',
      sepoliaTxHash: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.offers.push(offerData);

    // Create transaction (saveData() is called inside createTransaction)
    createTransaction('OFFER_CREATED', {
      propertyId: offerData.propertyId,
      fromOwner: offerData.buyerId,
      toOwner: offerData.sellerId,
      amount: offerData.offerAmount,
      status: 'PENDING',
      offerId: offerData.offerId
    });

    res.json({ success: true, offerId: offerData.offerId, data: offerData });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/offers', (req, res) => {
  res.json({ success: true, data: store.offers });
});

app.get('/api/offers/:offerId', (req, res) => {
  const offer = store.offers.find(o => o.offerId === req.params.offerId);
  res.json({ success: true, data: offer });
});

app.put('/api/offers/:offerId/accept', (req, res) => {
  try {
    const offer = store.offers.find(o => o.offerId === req.params.offerId);
    if (offer) {
      offer.status = 'ACCEPTED';
      offer.updatedAt = new Date().toISOString();

      // Create transaction
      createTransaction('OFFER_ACCEPTED', {
        propertyId: offer.propertyId,
        fromOwner: offer.sellerId,
        toOwner: offer.buyerId,
        amount: offer.offerAmount,
        status: 'PENDING',
        offerId: offer.offerId
      });

      res.json({ success: true, data: offer });
    } else {
      res.status(404).json({ error: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/offers/:offerId/reject', (req, res) => {
  try {
    const offer = store.offers.find(o => o.offerId === req.params.offerId);
    if (offer) {
      offer.status = 'REJECTED';
      offer.updatedAt = new Date().toISOString();

      // Create transaction
      createTransaction('OFFER_REJECTED', {
        propertyId: offer.propertyId,
        fromOwner: offer.sellerId,
        toOwner: offer.buyerId,
        amount: offer.offerAmount,
        status: 'CANCELLED',
        offerId: offer.offerId
      });

      res.json({ success: true, data: offer });
    } else {
      res.status(404).json({ error: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/offers/:offerId/verify', (req, res) => {
  try {
    const { adminId, sepoliaTxHash } = req.body;
    const offer = store.offers.find(o => o.offerId === req.params.offerId);
    if (offer) {
      offer.status = 'ADMIN_VERIFIED';
      offer.adminVerified = true;
      offer.adminId = adminId;
      offer.verifiedAt = new Date().toISOString();
      offer.sepoliaTxHash = sepoliaTxHash;
      offer.updatedAt = new Date().toISOString();

      // Create transaction
      createTransaction('OFFER_VERIFIED', {
        propertyId: offer.propertyId,
        fromOwner: offer.sellerId,
        toOwner: offer.buyerId,
        amount: offer.offerAmount,
        status: 'VERIFIED',
        offerId: offer.offerId
      });

      res.json({ success: true, data: offer });
    } else {
      res.status(404).json({ error: 'Offer not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transaction APIs
app.get('/api/transactions', (req, res) => {
  res.json({ success: true, data: store.transactions });
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const tx = store.transactions.find(t => t.transactionId === req.params.transactionId);
  res.json({ success: true, data: tx });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 LandChain Backend Server Started');
  console.log('='.repeat(60));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Mode: MOCK (In-Memory Storage)`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  console.log('\n✅ Server ready to handle requests\n');
  console.log('Available endpoints:');
  console.log('  GET    /api/health');
  console.log('  POST   /api/users/register');
  console.log('  GET    /api/users');
  console.log('  POST   /api/properties/register');
  console.log('  GET    /api/properties');
  console.log('  POST   /api/offers/create');
  console.log('  GET    /api/offers');
  console.log('  PUT    /api/offers/:id/accept');
  console.log('  PUT    /api/offers/:id/reject');
  console.log('  PUT    /api/offers/:id/verify');
  console.log('  GET    /api/transactions');
  console.log('\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  saveData(); // Save data before exit
  process.exit(0);
});
