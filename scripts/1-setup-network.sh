#!/bin/bash
# Setup Hyperledger Fabric Network
# This script generates crypto materials and starts the network

set -e

echo "=== Setting up Hyperledger Fabric Network ==="

# Check if fabric binaries are installed
if ! command -v cryptogen &> /dev/null; then
    echo "Error: Hyperledger Fabric binaries not found!"
    echo "Please run: curl -sSL https://bit.ly/2ysbOFE | bash -s"
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if required config files exist
if [ ! -f "crypto-config.yaml" ]; then
    echo "Error: crypto-config.yaml not found!"
    exit 1
fi

if [ ! -f "configtx.yaml" ]; then
    echo "Error: configtx.yaml not found!"
    echo "This file is required for generating genesis block and channel configurations."
    exit 1
fi

# Generate crypto materials
echo "Step 1: Generating crypto materials..."
cryptogen generate --config=./crypto-config.yaml --output="crypto-config"

# Set FABRIC_CFG_PATH to current directory so configtxgen can find configtx.yaml
export FABRIC_CFG_PATH=$PWD

# Generate genesis block
echo "Step 2: Generating genesis block..."
mkdir -p config
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./config/genesis.block

# Generate channel configuration
echo "Step 3: Generating channel configuration..."
export CHANNEL_NAME=landregistry
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./config/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME

# Generate anchor peer updates
echo "Step 4: Generating anchor peer updates..."
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./config/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP

# Start the network
echo "Step 5: Starting the network..."
docker-compose up -d

# Wait for containers to start
echo "Waiting for network to start..."
sleep 10

echo "=== Network setup complete ==="
echo "Run './scripts/2-create-channel.sh' to continue"