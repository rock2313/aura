// Mock Data Store for Demo
// This simulates blockchain storage using localStorage

interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  aadhar: string;
  pan: string;
  address: string;
  role: string;
  walletAddress: string;
  passwordHash: string;
  isVerified: boolean;
  documents: any[];
  registeredAt: string;
}

interface Property {
  propertyId: string;
  owner: string;
  ownerName: string;
  location: string;
  area: number;
  price: number;
  status: string;
  propertyType: string;
  description: string;
  documents: string[];
  verifiedBy: string;
  verifiedAt: string;
  registeredAt: string;
  lastUpdated: string;
  views: number;
  latitude: number;
  longitude: number;
}

interface Offer {
  offerId: string;
  propertyId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  offerAmount: number;
  status: string;
  message: string;
  adminVerified: boolean;
  adminId: string;
  verifiedAt: string;
  sepoliaTxHash: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  transactionId: string;
  propertyId: string;
  fromOwner: string;
  toOwner: string;
  amount: number;
  status: string;
  offerId: string;
  timestamp: string;
  type: string; // 'PROPERTY_SALE', 'OFFER_CREATED', 'OFFER_ACCEPTED', etc.
}

interface Escrow {
  escrowId: string;
  propertyId: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  transactionHash: string;
  createdAt: string;
  updatedAt: string;
}

class MockDataStore {
  private storageKey = 'landchain_mock_data';

  private getData(): {
    users: User[];
    properties: Property[];
    offers: Offer[];
    transactions: Transaction[];
    escrows: Escrow[];
  } {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      return JSON.parse(data);
    }
    return {
      users: [],
      properties: [],
      offers: [],
      transactions: [],
      escrows: []
    };
  }

  private saveData(data: any) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // User operations
  addUser(user: User) {
    const data = this.getData();
    data.users.push(user);
    this.saveData(data);
  }

  getUser(userId: string): User | null {
    const data = this.getData();
    return data.users.find(u => u.userId === userId) || null;
  }

  getAllUsers(): User[] {
    return this.getData().users;
  }

  // Property operations
  addProperty(property: Property) {
    const data = this.getData();
    data.properties.push(property);
    this.saveData(data);

    // Add transaction for property registration
    this.addTransaction({
      transactionId: `TXN_${Date.now()}`,
      propertyId: property.propertyId,
      fromOwner: '',
      toOwner: property.owner,
      amount: property.price,
      status: 'COMPLETED',
      offerId: '',
      timestamp: new Date().toISOString(),
      type: 'PROPERTY_REGISTERED'
    });
  }

  getProperty(propertyId: string): Property | null {
    const data = this.getData();
    return data.properties.find(p => p.propertyId === propertyId) || null;
  }

  getAllProperties(): Property[] {
    return this.getData().properties;
  }

  getPropertiesByOwner(owner: string): Property[] {
    return this.getData().properties.filter(p => p.owner === owner);
  }

  getPropertiesByStatus(status: string): Property[] {
    return this.getData().properties.filter(p => p.status === status);
  }

  updateProperty(propertyId: string, updates: Partial<Property>) {
    const data = this.getData();
    const index = data.properties.findIndex(p => p.propertyId === propertyId);
    if (index !== -1) {
      data.properties[index] = { ...data.properties[index], ...updates, lastUpdated: new Date().toISOString() };
      this.saveData(data);
    }
  }

  // Offer operations
  addOffer(offer: Offer) {
    const data = this.getData();
    data.offers.push(offer);
    this.saveData(data);

    // Add transaction for offer creation
    this.addTransaction({
      transactionId: `TXN_${Date.now()}`,
      propertyId: offer.propertyId,
      fromOwner: offer.buyerId,
      toOwner: offer.sellerId,
      amount: offer.offerAmount,
      status: 'PENDING',
      offerId: offer.offerId,
      timestamp: new Date().toISOString(),
      type: 'OFFER_CREATED'
    });
  }

  getOffer(offerId: string): Offer | null {
    const data = this.getData();
    return data.offers.find(o => o.offerId === offerId) || null;
  }

  getAllOffers(): Offer[] {
    return this.getData().offers;
  }

  getOffersByProperty(propertyId: string): Offer[] {
    return this.getData().offers.filter(o => o.propertyId === propertyId);
  }

  getOffersByBuyer(buyerId: string): Offer[] {
    return this.getData().offers.filter(o => o.buyerId === buyerId);
  }

  getOffersBySeller(sellerId: string): Offer[] {
    return this.getData().offers.filter(o => o.sellerId === sellerId);
  }

  getOffersByStatus(status: string): Offer[] {
    return this.getData().offers.filter(o => o.status === status);
  }

  getPendingAdminVerifications(): Offer[] {
    return this.getData().offers.filter(o => o.status === 'ACCEPTED');
  }

  updateOffer(offerId: string, updates: Partial<Offer>) {
    const data = this.getData();
    const index = data.offers.findIndex(o => o.offerId === offerId);
    if (index !== -1) {
      const oldStatus = data.offers[index].status;
      data.offers[index] = { ...data.offers[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);

      // Add transaction for status change
      const offer = data.offers[index];
      if (updates.status && updates.status !== oldStatus) {
        let txType = 'OFFER_UPDATED';
        let txStatus = 'PENDING';

        if (updates.status === 'ACCEPTED') {
          txType = 'OFFER_ACCEPTED';
          txStatus = 'PENDING';
        } else if (updates.status === 'REJECTED') {
          txType = 'OFFER_REJECTED';
          txStatus = 'CANCELLED';
        } else if (updates.status === 'ADMIN_VERIFIED') {
          txType = 'OFFER_VERIFIED';
          txStatus = 'VERIFIED';
        } else if (updates.status === 'COMPLETED') {
          txType = 'PROPERTY_TRANSFERRED';
          txStatus = 'COMPLETED';
        }

        this.addTransaction({
          transactionId: `TXN_${Date.now()}`,
          propertyId: offer.propertyId,
          fromOwner: offer.sellerId,
          toOwner: offer.buyerId,
          amount: offer.offerAmount,
          status: txStatus,
          offerId: offer.offerId,
          timestamp: new Date().toISOString(),
          type: txType
        });
      }
    }
  }

  // Transaction operations
  addTransaction(transaction: Transaction) {
    const data = this.getData();
    data.transactions.push(transaction);
    this.saveData(data);
  }

  getTransaction(transactionId: string): Transaction | null {
    const data = this.getData();
    return data.transactions.find(t => t.transactionId === transactionId) || null;
  }

  getAllTransactions(): Transaction[] {
    return this.getData().transactions;
  }

  getTransactionsByUser(userId: string): Transaction[] {
    return this.getData().transactions.filter(
      t => t.fromOwner === userId || t.toOwner === userId
    );
  }

  getTransactionsByProperty(propertyId: string): Transaction[] {
    return this.getData().transactions.filter(t => t.propertyId === propertyId);
  }

  // Escrow operations
  addEscrow(escrow: Escrow) {
    const data = this.getData();
    data.escrows.push(escrow);
    this.saveData(data);
  }

  getEscrow(escrowId: string): Escrow | null {
    const data = this.getData();
    return data.escrows.find(e => e.escrowId === escrowId) || null;
  }

  getAllEscrows(): Escrow[] {
    return this.getData().escrows;
  }

  updateEscrow(escrowId: string, updates: Partial<Escrow>) {
    const data = this.getData();
    const index = data.escrows.findIndex(e => e.escrowId === escrowId);
    if (index !== -1) {
      data.escrows[index] = { ...data.escrows[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
    }
  }

  // Clear all data (for testing)
  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}

// Export types
export type { User, Property, Offer, Transaction, Escrow };

// Create and export instance
const mockDataStore = new MockDataStore();
export { mockDataStore };
