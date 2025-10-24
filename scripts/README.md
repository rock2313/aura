# Hyperledger Fabric Deployment Scripts

Automated deployment scripts for the Land Registry Hyperledger Fabric network.

## Prerequisites

- Docker and Docker Compose
- Hyperledger Fabric binaries (cryptogen, configtxgen, peer)
- Go 1.19+

Install Fabric binaries:
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s
```

## Quick Start

Deploy everything with one command:
```bash
cd hyperledger-fabric/scripts
chmod +x *.sh
./deploy-all.sh
```

## Step-by-Step Deployment

If you prefer to run each step individually:

### 1. Setup Network
```bash
./1-setup-network.sh
```
- Generates crypto materials
- Creates genesis block and channel configuration
- Starts Docker containers (orderer, peers, CouchDB)

### 2. Create Channel
```bash
./2-create-channel.sh
```
- Creates the `landregistry` channel
- Joins Org1 and Org2 peers to the channel
- Updates anchor peers for both organizations

### 3. Deploy Property Chaincode
```bash
./3-deploy-property-chaincode.sh
```
- Packages the property chaincode
- Installs on all peers
- Approves and commits the chaincode

### 4. Deploy Escrow Chaincode
```bash
./4-deploy-escrow-chaincode.sh
```
- Packages the escrow chaincode
- Installs on all peers
- Approves and commits the chaincode

### 5. Test Chaincodes
```bash
./5-test-chaincodes.sh
```
- Registers a test property
- Creates and funds a test escrow
- Queries blockchain state

## Cleanup

To stop the network and remove all generated files:
```bash
./cleanup.sh
```

## Troubleshooting

### Check container status
```bash
docker ps -a
```

### View logs
```bash
docker-compose logs -f
docker logs <container_name>
```

### Restart network
```bash
./cleanup.sh
./deploy-all.sh
```

## Script Overview

| Script | Purpose |
|--------|---------|
| `deploy-all.sh` | Run all deployment steps in sequence |
| `1-setup-network.sh` | Initialize network and generate crypto |
| `2-create-channel.sh` | Create and join channel |
| `3-deploy-property-chaincode.sh` | Deploy property management chaincode |
| `4-deploy-escrow-chaincode.sh` | Deploy escrow management chaincode |
| `5-test-chaincodes.sh` | Run basic chaincode tests |
| `cleanup.sh` | Stop network and cleanup files |

## Network Details

- **Channel**: landregistry
- **Organizations**: Org1, Org2
- **Peers**: peer0.org1, peer0.org2
- **Orderer**: orderer.landregistry.com
- **Chaincodes**: property-contract, escrow-contract

## Next Steps

After successful deployment:
1. Configure frontend in `src/services/fabricClient.ts`
2. Update network endpoints
3. Test MetaMask integration
4. Start your React application
