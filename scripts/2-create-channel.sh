#!/bin/bash
# Create and join channel
# This script creates the landregistry channel and joins peers

set -e

echo "=== Creating and Joining Channel ==="

export CHANNEL_NAME=landregistry
export FABRIC_CFG_PATH=$PWD/config

# Create channel
echo "Step 1: Creating channel..."
docker exec cli peer channel create \
  -o orderer.landregistry.com:7050 \
  -c $CHANNEL_NAME \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/${CHANNEL_NAME}.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

sleep 5

# Join Org1 peer to channel
echo "Step 2: Joining Org1 peer to channel..."
docker exec cli peer channel join -b ${CHANNEL_NAME}.block

# Join Org2 peer to channel
echo "Step 3: Joining Org2 peer to channel..."
docker exec \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/users/Admin@org2.landregistry.com/msp \
  -e CORE_PEER_ADDRESS=peer0.org2.landregistry.com:9051 \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt \
  cli peer channel join -b ${CHANNEL_NAME}.block

# Update anchor peers for Org1
echo "Step 4: Updating anchor peers for Org1..."
docker exec cli peer channel update \
  -o orderer.landregistry.com:7050 \
  -c $CHANNEL_NAME \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/Org1MSPanchors.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

# Update anchor peers for Org2
echo "Step 5: Updating anchor peers for Org2..."
docker exec \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/users/Admin@org2.landregistry.com/msp \
  -e CORE_PEER_ADDRESS=peer0.org2.landregistry.com:9051 \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  -e CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt \
  cli peer channel update \
  -o orderer.landregistry.com:7050 \
  -c $CHANNEL_NAME \
  -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/Org2MSPanchors.tx \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem

echo "=== Channel created and peers joined ==="
echo "Run './scripts/3-deploy-property-chaincode.sh' to continue"
