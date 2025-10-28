#!/bin/bash

set -e

echo "=========================================="
echo "Deploying Offer Chaincode"
echo "=========================================="

# Set environment variables
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

CHANNEL_NAME="landregistry"
CC_NAME="offer-contract"
CC_VERSION="1.0"
CC_SEQUENCE=1
CC_SRC_PATH="../chaincode/offer-contract"

echo "Step 1: Package chaincode"
peer lifecycle chaincode package ${CC_NAME}.tar.gz \
    --path ${CC_SRC_PATH} \
    --lang golang \
    --label ${CC_NAME}_${CC_VERSION}

echo "Step 2: Install chaincode on peer"
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "Step 3: Query installed chaincode"
peer lifecycle chaincode queryinstalled >&log.txt
PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
echo "Package ID: ${PACKAGE_ID}"

echo "Step 4: Approve chaincode for Org1"
peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile $ORDERER_CA

echo "Step 5: Check commit readiness"
peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile $ORDERER_CA \
    --output json

echo "Step 6: Commit chaincode"
peer lifecycle chaincode commit \
    -o orderer.example.com:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile $ORDERER_CA \
    --peerAddresses peer0.org1.example.com:7051 \
    --tlsRootCertFiles $PEER0_ORG1_CA

echo "Step 7: Query committed chaincode"
peer lifecycle chaincode querycommitted \
    --channelID $CHANNEL_NAME \
    --name $CC_NAME \
    --cafile $ORDERER_CA

echo "=========================================="
echo "Offer Chaincode Deployed Successfully!"
echo "=========================================="
