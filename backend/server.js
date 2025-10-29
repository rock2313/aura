const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store (syncs with frontend mockDataStore)
const store = {
  users: [],
  properties: [],
  offers: [],
  transactions: [],
  escrows: []
};

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
      documents: [],
      verifiedBy: '',
      verifiedAt: '',
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      views: 0
    };
    store.properties.push(propertyData);

    // Create transaction
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

app.get('/api/properties/:propertyId', (req, res) => {
  const property = store.properties.find(p => p.propertyId === req.params.propertyId);
  res.json({ success: true, data: property });
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

    // Create transaction
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
  process.exit(0);
});
