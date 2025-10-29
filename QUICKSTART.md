# LandChain Registry - Quick Start Guide

## For College Project Demo (Frontend Only)

Since this is a demonstration project, you can test the frontend application without setting up the full Hyperledger Fabric network.

### Quick Start (Frontend Only)

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Access the Application**
- Open browser to `http://localhost:5173`
- The frontend uses mock responses from `fabricClient.ts`
- You can test all three roles: Buyer, Seller, Admin

### Testing the 3-Entity System

**Step 1: Register as Seller**
- Fill in KYC form
- Select role: "Seller - I want to sell my land"
- Connect MetaMask wallet (optional for demo)
- Complete registration

**Step 2: Register as Buyer**
- Open incognito/private window
- Fill in KYC form
- Select role: "Buyer - I want to purchase land"
- Connect wallet
- Complete registration

**Step 3: Register as Admin**
- Open another incognito/private window
- Fill in KYC form
- Select role: "Admin - I verify transactions"
- Connect wallet
- Complete registration

### Frontend Features You Can Test

✅ **Working (with mock data)**:
- User registration with role selection
- Wallet connection (MetaMask)
- Dashboard view
- Property listing
- Transaction history
- Role-based navigation
- Admin dashboard UI

❌ **Not Working (needs Fabric network)**:
- Actual blockchain storage
- Real chaincode execution
- Persistent data between sessions
- Hyperledger Fabric integration

---

## For Full Blockchain Demo

If you want to run the complete system with Hyperledger Fabric and Sepolia integration, see [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Prerequisites for Full Setup

1. **System Requirements**
   - Docker Desktop
   - Docker Compose
   - Node.js v16+
   - Go 1.20+
   - 8GB RAM minimum
   - 20GB free disk space

2. **Install Hyperledger Fabric**
```bash
# Download Fabric binaries and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5

# Add to PATH
export PATH=$PATH:$PWD/fabric-samples/bin
```

3. **Setup Network**
```bash
cd /home/user/aura
./scripts/1-setup-network.sh
./scripts/2-create-channel.sh
./scripts/3-deploy-user-chaincode.sh
./scripts/3-deploy-property-chaincode.sh
./scripts/4-deploy-escrow-chaincode.sh
./scripts/6-deploy-offer-chaincode.sh
```

4. **Configure MetaMask**
   - Add Sepolia Test Network
   - Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

### Troubleshooting

**Port Conflicts**
```bash
# Check if ports 7050, 7051, 9051 are in use
lsof -i :7050
lsof -i :7051
lsof -i :9051

# Stop conflicting services if needed
```

**Docker Issues**
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

**Fabric Network Issues**
```bash
# Stop and cleanup
./scripts/cleanup.sh

# Restart fresh
./scripts/deploy-all.sh
```

---

## Project Structure for Demo

```
Frontend Only:
- React application with TypeScript
- Mock blockchain responses
- MetaMask integration (optional)
- Role-based UI

Full Setup:
- Hyperledger Fabric network
- 3 chaincodes (User, Property, Offer)
- Sepolia network integration
- Complete transaction workflow
```

## Demo Presentation Tips

For your college project presentation:

1. **Show the Architecture Diagram**
   - 3 entities: Buyer, Seller, Admin
   - Hyperledger Fabric for data
   - Sepolia for verification

2. **Demo the Workflow**
   - Start with frontend-only demo
   - Explain what happens with blockchain
   - Show code for smart contracts

3. **Explain the Benefits**
   - Immutable records
   - Transparent history
   - Decentralized verification
   - No single point of failure

4. **Discuss Future Enhancements**
   - Production deployment
   - Mobile app
   - IPFS for documents
   - Multi-organization support
