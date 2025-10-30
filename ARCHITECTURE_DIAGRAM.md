# LandChain Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LANDCHAIN REGISTRY SYSTEM                            │
│                  Blockchain-Based Land Registry (Tirupati)                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Full System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                                │
└───────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
    │   Buyer     │       │   Seller    │       │   Admin     │
    │   (Priya)   │       │  (Ramesh)   │       │  Officer    │
    └──────┬──────┘       └──────┬──────┘       └──────┬──────┘
           │                     │                     │
           └─────────────────────┴─────────────────────┘
                                 │
                        HTTP/HTTPS (REST API)
                                 │
                                 ▼

┌───────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION LAYER                                     │
│                                                                                │
│    ┌──────────────────────────────────────────────────────────┐              │
│    │              React Frontend (Vite)                        │              │
│    │              Port: 5173                                   │              │
│    │                                                            │              │
│    │  • Login/Register        • Dashboard                      │              │
│    │  • Add Property          • Browse Properties              │              │
│    │  • Make Offers           • Accept/Reject Offers           │              │
│    │  • View Transactions     • Admin Verification Panel       │              │
│    └────────────────────────────┬───────────────────────────────┘             │
│                                 │ HTTP/JSON                                   │
│                                 ▼                                              │
│    ┌──────────────────────────────────────────────────────────┐              │
│    │         Node.js Backend Server (Express)                  │              │
│    │         Port: 3001                                        │              │
│    │                                                            │              │
│    │  • REST API Endpoints                                     │              │
│    │  • User Authentication                                    │              │
│    │  • Request Validation                                     │              │
│    │  • Response Formatting                                    │              │
│    └────────────────────────────┬───────────────────────────────┘             │
│                                 │                                              │
│                                 │ Fabric SDK                                   │
│                                 │ (fabric-network)                             │
│                                 ▼                                              │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                          BLOCKCHAIN LAYER                                      │
│                     HYPERLEDGER FABRIC NETWORK                                 │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    Fabric Gateway & Connection                           │ │
│  │                                                                           │ │
│  │  • Connection Profile (connection-profile.json)                          │ │
│  │  • Admin Wallet (PKI Certificates)                                       │ │
│  │  • Channel: landregistry                                                 │ │
│  └───────────────────────────────┬───────────────────────────────────────────┘ │
│                                  │                                            │
│         ┌────────────────────────┼────────────────────────┐                  │
│         │                        │                        │                  │
│         ▼                        ▼                        ▼                  │
│  ┌─────────────┐         ┌──────────────┐        ┌─────────────┐            │
│  │  Orderer    │◄────────┤   Peer0      │────────►│ Certificate │            │
│  │   Node      │         │  landregistry│        │  Authority  │            │
│  │             │         │   .gov.in    │        │    (CA)     │            │
│  │  • Orders   │         │              │        │             │            │
│  │    Txns     │         │ • Endorses   │        │ • Issues    │            │
│  │  • Creates  │         │   Txns       │        │   Certs     │            │
│  │    Blocks   │         │ • Validates  │        │ • Manages   │            │
│  │  • Solo/    │         │   Blocks     │        │   Identities│            │
│  │    Raft     │         │ • Maintains  │        │ • PKI Root  │            │
│  │             │         │   Ledger     │        │             │            │
│  └─────────────┘         └──────┬───────┘        └─────────────┘            │
│                                 │                                             │
│                                 │                                             │
│                          ┌──────┴────────┐                                   │
│                          │  State DB     │                                   │
│                          │  (CouchDB)    │                                   │
│                          │               │                                   │
│                          │ • Key-Value   │                                   │
│                          │   Store       │                                   │
│                          │ • JSON Docs   │                                   │
│                          │ • Rich Query  │                                   │
│                          └───────────────┘                                   │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       BLOCKCHAIN LEDGER                                  │ │
│  │                                                                           │ │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐          │ │
│  │  │  Block 0 │───►│  Block 1 │───►│  Block 2 │───►│  Block N │───►      │ │
│  │  │ (Genesis)│    │          │    │          │    │          │          │ │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────┘          │ │
│  │                                                                           │ │
│  │  Each Block Contains:                                                    │ │
│  │  • Block Header (Hash, Previous Hash, Block Number)                     │ │
│  │  • Transaction Data (User registrations, Property registrations, etc.)  │ │
│  │  • Metadata (Timestamp, Signatures)                                     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       SMART CONTRACTS (Chaincode)                        │ │
│  │                                                                           │ │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌─────────────────┐   │ │
│  │  │ property-contract  │  │  offer-contract    │  │  user-contract  │   │ │
│  │  │     (Go)           │  │      (Go)          │  │     (Go)        │   │ │
│  │  ├────────────────────┤  ├────────────────────┤  ├─────────────────┤   │ │
│  │  │• RegisterProperty  │  │• CreateOffer       │  │• RegisterUser   │   │ │
│  │  │• VerifyProperty    │  │• AcceptOffer       │  │• VerifyUser     │   │ │
│  │  │• TransferProperty  │  │• RejectOffer       │  │• UpdateUser     │   │ │
│  │  │• GetProperty       │  │• AdminVerifyOffer  │  │• GetUser        │   │ │
│  │  │• GetAllProperties  │  │• GetOffer          │  │• GetAllUsers    │   │ │
│  │  │• UpdateProperty    │  │• GetAllOffers      │  │                 │   │ │
│  │  └────────────────────┘  └────────────────────┘  └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│                        SECONDARY BLOCKCHAIN LAYER                              │
│                        (For Payment Settlement)                                │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     ETHEREUM SEPOLIA TESTNET                             │ │
│  │                                                                           │ │
│  │  • Public blockchain for payment verification                            │ │
│  │  • Smart contract for escrow                                             │ │
│  │  • Publicly verifiable transactions                                      │ │
│  │  • Sepolia Etherscan for transparency                                    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Transaction Flow

### Property Registration Flow

```
┌────────┐                ┌──────────┐              ┌──────────┐
│ Seller │                │ Backend  │              │  Fabric  │
│ (UI)   │                │  Server  │              │ Network  │
└───┬────┘                └─────┬────┘              └─────┬────┘
    │                           │                         │
    │ 1. Register Property      │                         │
    │ POST /api/properties      │                         │
    │ ─────────────────────────►│                         │
    │                           │                         │
    │                           │ 2. Invoke Chaincode     │
    │                           │ RegisterProperty()      │
    │                           │ ────────────────────────►│
    │                           │                         │
    │                           │                         │ 3. Validate
    │                           │                         │    Transaction
    │                           │                         │
    │                           │                         │ 4. Execute Smart
    │                           │                         │    Contract
    │                           │                         │
    │                           │                         │ 5. Update Ledger
    │                           │                         │    PutState()
    │                           │                         │
    │                           │ 6. Return TX ID         │
    │                           │ ◄────────────────────────│
    │                           │    {txId: "6a3f2c..."}  │
    │                           │                         │
    │ 7. Property Created       │                         │
    │ {status: PENDING}         │                         │
    │ ◄─────────────────────────│                         │
    │                           │                         │

                        STATUS: PENDING
                        (Awaiting Admin Verification)
```

### Admin Verification Flow

```
┌────────┐                ┌──────────┐              ┌──────────┐
│ Admin  │                │ Backend  │              │  Fabric  │
│ (UI)   │                │  Server  │              │ Network  │
└───┬────┘                └─────┬────┘              └─────┬────┘
    │                           │                         │
    │ 1. Verify Property        │                         │
    │ PUT /api/properties/:id   │                         │
    │ /verify                   │                         │
    │ ─────────────────────────►│                         │
    │                           │                         │
    │                           │ 2. Invoke Chaincode     │
    │                           │ VerifyProperty()        │
    │                           │ ────────────────────────►│
    │                           │                         │
    │                           │                         │ 3. Update Status
    │                           │                         │    to VERIFIED
    │                           │                         │
    │                           │                         │ 4. Create Block
    │                           │                         │    with Txn
    │                           │                         │
    │                           │ 5. Return TX ID         │
    │                           │ ◄────────────────────────│
    │                           │                         │
    │ 6. Property Verified!     │                         │
    │ {status: VERIFIED}        │                         │
    │ ◄─────────────────────────│                         │
    │                           │                         │

                        STATUS: VERIFIED
                        (Can now be listed for sale)
```

### Offer and Transfer Flow

```
┌────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
│ Buyer  │  │ Seller │  │  Admin  │  │ Backend  │  │  Fabric  │
└───┬────┘  └───┬────┘  └────┬────┘  └─────┬────┘  └─────┬────┘
    │           │            │             │             │
    │ 1. Create Offer        │             │             │
    │ ───────────────────────┼─────────────►             │
    │           │            │             │             │
    │           │            │             │ 2. CreateOffer()
    │           │            │             │ ────────────►│
    │           │            │             │             │
    │           │            │             │ 3. Offer Created
    │           │            │             │ ◄────────────│
    │           │            │             │ (PENDING)    │
    │           │            │             │             │
    │           │ 4. Seller sees offer     │             │
    │           │ ◄────────────────────────┤             │
    │           │            │             │             │
    │           │ 5. Accept Offer          │             │
    │           │ ─────────────────────────►             │
    │           │            │             │             │
    │           │            │             │ 6. AcceptOffer()
    │           │            │             │ ────────────►│
    │           │            │             │             │
    │           │            │             │ 7. Status = ACCEPTED
    │           │            │             │ ◄────────────│
    │           │            │             │             │
    │           │            │ 8. Admin sees accepted offer
    │           │            │ ◄───────────┤             │
    │           │            │             │             │
    │           │            │ 9. Verify Offer           │
    │           │            │ ─────────────►            │
    │           │            │             │             │
    │           │            │             │ 10. AdminVerifyOffer()
    │           │            │             │  + TransferOwnership()
    │           │            │             │ ────────────►│
    │           │            │             │             │
    │           │            │             │ 11. Property
    │           │            │             │     Transferred
    │           │            │             │     Status = TRANSFERRED
    │           │            │             │ ◄────────────│
    │           │            │             │             │
    │ 12. Now property owner │             │             │
    │ ◄──────────────────────┴─────────────┤             │
    │           │            │             │             │
```

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          DATA PERSISTENCE                                 │
└──────────────────────────────────────────────────────────────────────────┘

    User Registration / Property Registration / Offer Creation
                              │
                              ▼
    ┌─────────────────────────────────────────────────────┐
    │         Backend validates request                    │
    │         (Schema, permissions, business rules)        │
    └────────────────────┬────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │    Fabric SDK: contract.submitTransaction()         │
    │    (fabric-network library)                         │
    └────────────────────┬────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │    Endorsing Peer: Execute Chaincode                │
    │    (Smart contract written in Go)                   │
    │    • Validate inputs                                │
    │    • Check permissions                              │
    │    • Execute business logic                         │
    │    • Generate read-write set                        │
    └────────────────────┬────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │    Orderer: Order transactions into blocks          │
    │    • Collect transactions                           │
    │    • Create block (when batch size/timeout reached) │
    │    • Assign block number                            │
    │    • Broadcast to peers                             │
    └────────────────────┬────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │    Committing Peer: Validate and Commit Block       │
    │    • Validate transaction signatures                │
    │    • Check read-write set conflicts                 │
    │    • Apply state changes to ledger                  │
    │    • Update CouchDB state database                  │
    └────────────────────┬────────────────────────────────┘
                         │
                         ▼
    ┌─────────────────────────────────────────────────────┐
    │    Distributed Ledger (Blockchain)                  │
    │                                                      │
    │    Block Chain:  [Block 0]→[Block 1]→[Block 2]→...  │
    │                                                      │
    │    State DB:  CouchDB with current world state      │
    │                                                      │
    │    IMMUTABLE ✓   AUDITABLE ✓   DISTRIBUTED ✓        │
    └──────────────────────────────────────────────────────┘
```

---

## Comparison: Regular Website vs LandChain

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         REGULAR WEBSITE                                    │
└───────────────────────────────────────────────────────────────────────────┘

    Browser ──HTTP──► Backend ──SQL──► MySQL Database
                       (Node.js)         (Centralized)

    Data Flow:
    INSERT INTO properties (id, owner, price) VALUES (1, 'John', 1000000);
    UPDATE properties SET owner='Jane' WHERE id=1;  ← Previous owner LOST!
    DELETE FROM properties WHERE id=1;               ← History DELETED!

    Problems:
    ❌ Centralized (single point of failure)
    ❌ Mutable (data can be changed/deleted)
    ❌ No audit trail
    ❌ Trust the server operator
    ❌ No cryptographic verification


┌───────────────────────────────────────────────────────────────────────────┐
│                      LANDCHAIN (BLOCKCHAIN)                                │
└───────────────────────────────────────────────────────────────────────────┘

    Browser ──HTTP──► Backend ──Fabric SDK──► Blockchain Network
                       (Node.js)               (Distributed)
                                                   │
                                                   ├── Peer 0 (Ledger)
                                                   ├── Orderer (Consensus)
                                                   └── CA (Identity)

    Data Flow:
    Transaction 1: RegisterProperty(id=1, owner='John', price=1000000)
                   → Block 5, TxID: 6a3f2c8d..., Timestamp: 2025-10-30 10:00

    Transaction 2: TransferProperty(id=1, owner='Jane')
                   → Block 8, TxID: 8e4d9f1a..., Timestamp: 2025-10-30 11:00

    History Preserved:
    GetPropertyHistory(id=1):
    ├─ Block 5: owner='John', price=1000000  (PERMANENT RECORD)
    └─ Block 8: owner='Jane', price=1000000  (NEW RECORD)

    Benefits:
    ✅ Decentralized (distributed across peers)
    ✅ Immutable (cannot change past blocks)
    ✅ Complete audit trail
    ✅ Cryptographically verified
    ✅ Transparent and trustless
```

---

## Network Topology

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   HYPERLEDGER FABRIC NETWORK                              │
│                   "landregistry" Network                                  │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────┐
                    │   landregistry.gov.in   │
                    │     (Organization)      │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │   Orderer    │ │    Peer0     │ │      CA      │
         │              │ │              │ │              │
         │ Port: 7050   │ │ Port: 7051   │ │ Port: 7054   │
         │              │ │              │ │              │
         │ • Consensus  │ │ • Chaincode  │ │ • Identity   │
         │ • Block      │ │ • Ledger     │ │ • Certs      │
         │   Creation   │ │ • Endorse    │ │ • MSP        │
         └──────────────┘ └──────┬───────┘ └──────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │   CouchDB    │
                         │ Port: 5984   │
                         │ • State DB   │
                         │ • World State│
                         └──────────────┘

Channel: landregistry
├── property-contract (deployed)
├── offer-contract (deployed)
└── user-contract (deployed)
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      SECURITY & IDENTITY                                  │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │     Certificate Authority (CA)                       │
    │     landregistry.gov.in                              │
    └────────────────────┬────────────────────────────────┘
                         │ Issues X.509 Certificates
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
    ┌───────────┐  ┌──────────┐  ┌──────────┐
    │   Admin   │  │   User   │  │   Peer   │
    │   Cert    │  │   Cert   │  │   Cert   │
    └───────────┘  └──────────┘  └──────────┘

    MSP (Membership Service Provider):
    ├── Root CA Certificate
    ├── Admin Certificates
    ├── User Certificates
    ├── TLS Certificates
    └── Private Keys

    Every transaction is:
    ✓ Signed with private key
    ✓ Verified with public key
    ✓ Authenticated by MSP
    ✓ Authorized by policies
```

---

## Key Takeaways

1. **Smart Contracts**: Business logic executed on blockchain (Go chaincodes)
2. **Distributed Ledger**: Data replicated across multiple peers
3. **Immutability**: All historical states preserved forever
4. **Consensus**: Transactions validated by network
5. **Cryptographic Security**: PKI-based identity and verification
6. **Audit Trail**: Complete history of all changes
7. **Enterprise Grade**: Hyperledger Fabric (IBM, Walmart, Maersk)

---

**This is NOT a regular website. This is genuine blockchain technology.**
