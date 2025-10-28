# Hyperledger Fabric Network Deployment Guide

## Overview
This guide explains how to deploy your Hyperledger Fabric land registry network with property and escrow chaincodes.

## Prerequisites
- Ubuntu 20.04+ or macOS
- Docker and Docker Compose
- Go 1.19+
- Node.js 16+
- Hyperledger Fabric binaries 2.5

## Step 1: Install Hyperledger Fabric

```bash
# Download Fabric samples and binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5

# Add binaries to PATH
export PATH=$PATH:$PWD/fabric-samples/bin
```

## Step 2: Generate Crypto Material

```bash
# Navigate to your project directory
cd hyperledger-fabric

# Generate certificates using cryptogen
cryptogen generate --config=./crypto-config.yaml
```

This creates:
- Certificate authorities (CAs) for each organization
- Admin and user certificates
- TLS certificates for secure communication

## Step 3: Generate Genesis Block and Channel Configuration

```bash
# Create channel-artifacts directory
mkdir channel-artifacts

# Generate genesis block for orderer
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

# Generate channel creation transaction
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/landregistry.tx -channelID landregistry

# Generate anchor peer updates
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID landregistry -asOrg Org1MSP

configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID landregistry -asOrg Org2MSP
```

## Step 4: Start the Network

```bash
# Start all containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see:
- 1 orderer
- 2 peers (Org1, Org2)
- 2 CouchDB instances
- 1 CLI container

## Step 5: Create and Join Channel

```bash
# Access the CLI container
docker exec -it cli bash

# Create channel
peer channel create -o orderer.landregistry.com:7050 -c landregistry -f ./channel-artifacts/landregistry.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

# Join Org1 peer to channel
peer channel join -b landregistry.block

# Switch to Org2 peer
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=peer0.org2.landregistry.com:8051
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/users/Admin@org2.landregistry.com/msp

# Join Org2 peer to channel
peer channel join -b landregistry.block
```

## Step 6: Package and Install Chaincodes

### Property Chaincode

```bash
# Package the chaincode
peer lifecycle chaincode package property-contract.tar.gz --path ./chaincode/property-contract --lang golang --label property-contract_1.0

# Install on Org1 peer
peer lifecycle chaincode install property-contract.tar.gz

# Install on Org2 peer (switch peer environment first)
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=peer0.org2.landregistry.com:8051
peer lifecycle chaincode install property-contract.tar.gz

# Query installed chaincode to get package ID
peer lifecycle chaincode queryinstalled

# Approve for Org1 (use the package ID from query)
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_ADDRESS=peer0.org1.landregistry.com:7051
peer lifecycle chaincode approveformyorg -o orderer.landregistry.com:7050 --channelID landregistry --name property-contract --version 1.0 --package-id <PACKAGE_ID> --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

# Approve for Org2
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_ADDRESS=peer0.org2.landregistry.com:8051
peer lifecycle chaincode approveformyorg -o orderer.landregistry.com:7050 --channelID landregistry --name property-contract --version 1.0 --package-id <PACKAGE_ID> --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

# Commit the chaincode
peer lifecycle chaincode commit -o orderer.landregistry.com:7050 --channelID landregistry --name property-contract --version 1.0 --sequence 1 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem --peerAddresses peer0.org1.landregistry.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt --peerAddresses peer0.org2.landregistry.com:8051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt
```

### Escrow Chaincode
Repeat the same process for the escrow chaincode:

```bash
peer lifecycle chaincode package escrow-contract.tar.gz --path ./chaincode/escrow-contract --lang golang --label escrow-contract_1.0
# ... follow same steps as property chaincode
```

## Step 7: Test Chaincodes

```bash
# Register a property
peer chaincode invoke -o orderer.landregistry.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem -C landregistry -n property-contract --peerAddresses peer0.org1.landregistry.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt -c '{"function":"RegisterProperty","Args":["PROP001","John Doe","Tirupati, AP","1000","5000000"]}'

# Query the property
peer chaincode query -C landregistry -n property-contract -c '{"function":"GetProperty","Args":["PROP001"]}'

# Create escrow
peer chaincode invoke -o orderer.landregistry.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem -C landregistry -n escrow-contract --peerAddresses peer0.org1.landregistry.com:7051 --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt -c '{"function":"CreateEscrow","Args":["ESC001","PROP001","Jane Smith","John Doe","5000000"]}'
```

## Step 8: Connect Your React Frontend

Update `src/services/fabricClient.ts` with your network details:

```typescript
const fabricConfig: FabricConfig = {
  networkUrl: 'http://YOUR_SERVER_IP:7051',
  channelName: 'landregistry',
  chaincodeName: 'property-contract',
  mspId: 'Org1MSP'
};
```

## Step 9: MetaMask Integration

1. **Install MetaMask**: Users need MetaMask browser extension
2. **Configure Sepolia Testnet**: 
   - Network Name: Sepolia Test Network
   - RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   - Chain ID: 11155111
   - Currency Symbol: ETH

3. **Get Test ETH**: 
   - Visit: https://sepoliafaucet.com
   - Enter your MetaMask address
   - Receive test ETH for transactions

## Architecture Flow

1. **User Action** (React Frontend)
   ↓
2. **MetaMask Payment** (Sepolia Testnet)
   ↓
3. **Payment Confirmation** → **Fabric Escrow Created**
   ↓
4. **Escrow Funded** (Tx hash recorded on Fabric)
   ↓
5. **Property Transfer** (Property chaincode invoked)
   ↓
6. **Escrow Released** (Seller receives payment)

## Production Deployment

For production:
1. **Use cloud VMs** (AWS EC2, Azure VMs, Google Compute)
2. **Configure DNS** for peer/orderer endpoints
3. **Set up monitoring** (Prometheus + Grafana)
4. **Enable TLS** everywhere
5. **Implement backup strategy** for ledger data
6. **Use managed Kubernetes** for better scalability

## Troubleshooting

### Check logs
```bash
docker logs peer0.org1.landregistry.com
docker logs orderer.landregistry.com
```

### Restart network
```bash
docker-compose down
docker-compose up -d
```

### Clean and restart
```bash
docker-compose down --volumes --remove-orphans
rm -rf channel-artifacts/*
rm -rf crypto-config
# Then start from Step 2
```

## Security Notes

1. **Never expose private keys** in frontend code
2. **Use Fabric SDK** in production for secure connections
3. **Implement proper MSP** identity management
4. **Rotate certificates** regularly
5. **Monitor chaincode** for vulnerabilities
6. **Use hardware security modules** (HSM) for production CAs

## Support

For issues:
- Hyperledger Fabric Discord: https://discord.gg/hyperledger
- Documentation: https://hyperledger-fabric.readthedocs.io/
