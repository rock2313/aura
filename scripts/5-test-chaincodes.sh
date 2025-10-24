#!/bin/bash
# Test Chaincodes
# This script runs basic tests on the deployed chaincodes

set -e

echo "=== Testing Chaincodes ==="

export CHANNEL_NAME=landregistry

# Test Property Chaincode
echo "Testing Property Chaincode..."

# First, check what chaincodes are installed
echo "Checking installed chaincodes..."
docker exec cli peer lifecycle chaincode querycommitted -C $CHANNEL_NAME

# Register a property
echo ""
echo "1. Registering a property..."
docker exec cli peer chaincode invoke \
  -o orderer.landregistry.com:7050 \
  -C $CHANNEL_NAME \
  -n property-contract \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem \
  --peerAddresses peer0.org1.landregistry.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt \
  --peerAddresses peer0.org2.landregistry.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt \
  -c '{"function":"RegisterProperty","Args":["PROP002","Alice","123 Main St","1500.5","250000"]}'

echo "Waiting for transaction to be committed..."
sleep 5

# Query all properties first
echo ""
echo "2. Querying all properties..."
docker exec cli peer chaincode query \
  -C $CHANNEL_NAME \
  -n property-contract \
  -c '{"function":"GetAllProperties","Args":[]}'

# Query the specific property
echo ""
echo "3. Querying specific property..."
docker exec cli peer chaincode query \
  -C $CHANNEL_NAME \
  -n property-contract \
  -c '{"function":"GetProperty","Args":["PROP002"]}'

# Test Escrow Chaincode
echo ""
echo "Testing Escrow Chaincode..."

# Create escrow
echo "1. Creating escrow..."
docker exec cli peer chaincode invoke \
  -o orderer.landregistry.com:7050 \
  -C $CHANNEL_NAME \
  -n escrow-contract \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem \
  --peerAddresses peer0.org1.landregistry.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt \
  --peerAddresses peer0.org2.landregistry.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt \
  -c '{"function":"CreateEscrow","Args":["ESC002","PROP002","Bob","Alice","250000"]}'

echo "Waiting for transaction to be committed..."
sleep 5

# Query escrow status
echo ""
echo "2. Querying escrow status..."
docker exec cli peer chaincode query \
  -C $CHANNEL_NAME \
  -n escrow-contract \
  -c '{"function":"GetEscrow","Args":["ESC002"]}'

# Fund escrow (simulate)
echo ""
echo "3. Funding escrow..."
docker exec cli peer chaincode invoke \
  -o orderer.landregistry.com:7050 \
  -C $CHANNEL_NAME \
  -n escrow-contract \
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/landregistry.com/orderers/orderer.landregistry.com/msp/tlscacerts/tlsca.landregistry.com-cert.pem \
  --peerAddresses peer0.org1.landregistry.com:7051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.landregistry.com/peers/peer0.org1.landregistry.com/tls/ca.crt \
  --peerAddresses peer0.org2.landregistry.com:9051 \
  --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.landregistry.com/peers/peer0.org2.landregistry.com/tls/ca.crt \
  -c '{"function":"FundEscrow","Args":["ESC002","0x1234567890abcdef"]}'

echo "Waiting for transaction to be committed..."
sleep 5

# Query updated escrow status
echo ""
echo "4. Querying updated escrow status..."
docker exec cli peer chaincode query \
  -C $CHANNEL_NAME \
  -n escrow-contract \
  -c '{"function":"GetEscrow","Args":["ESC002"]}'

echo ""
echo "=== All tests completed successfully ==="