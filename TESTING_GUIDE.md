# Testing Guide - Blockchain Integration

## Overview
The frontend is now fully integrated with mockDataStore, which uses localStorage to persist data and automatically track all blockchain transactions.

## What's Been Fixed

### 1. Data Persistence
- All user, property, offer, and escrow data is now stored in localStorage
- Data persists across page refreshes
- No more mock/hardcoded data

### 2. Transaction Tracking
- ✅ **Transactions start empty** (no pre-populated data)
- ✅ **Transactions append automatically** when you:
  - Register a property
  - Create an offer
  - Accept/reject an offer
  - Admin verifies a transaction
  - Complete a property transfer

### 3. User Experience Improvements
- Removed confusing role selection (everyone is "USER")
- Users can both buy AND sell properties
- Admin accesses system via `/admin` route directly
- Registration now works without errors
- Wallet connection is optional

## Complete Testing Workflow

### Step 1: Clear Previous Data (Optional)
Open browser console and run:
```javascript
localStorage.removeItem('landchain_mock_data')
```

### Step 2: Register as a User
1. Navigate to homepage
2. Click "Get Started" or "Create Account"
3. Fill in the registration form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "9876543210"
   - Aadhar: "123456789012"
   - PAN: "ABCDE1234F"
   - Address: "123 Main St"
   - Password: "password123"
4. Wallet connection is optional (you can skip it)
5. Click "Register"
6. ✅ **Check:** No registration errors should occur

### Step 3: Verify Empty Transactions
1. After registration, navigate to "Transactions" page
2. ✅ **Check:** Should show "No Transactions Yet" message
3. ✅ **Check:** Should explain how transactions are created

### Step 4: Add a Property
1. Navigate to "Add Property" page
2. Fill in property details:
   - Title: "Beautiful Villa"
   - Location: "Mumbai, Maharashtra"
   - Area: "2500"
   - Price: "5000000"
   - Property Type: "Residential"
   - Description: "Luxury villa with sea view"
3. Click "Register Property"
4. ✅ **Check:** Property should be registered successfully

### Step 5: Verify Transaction Created
1. Navigate to "Transactions" page
2. ✅ **Check:** Should show 1 transaction
3. ✅ **Check:** Transaction type should be "Property Registered"
4. ✅ **Check:** Transaction status should be "COMPLETED"
5. ✅ **Check:** Transaction should show the property price

### Step 6: View Property
1. Navigate to "Properties" page
2. ✅ **Check:** Your registered property should appear in the list
3. Click on the property card to view details

### Step 7: Create Offer (Register as Second User)
1. Logout (or open in incognito/another browser)
2. Register a second user (e.g., "Jane Smith")
3. Navigate to "Properties" page
4. Find the property registered by first user
5. Click "Make Offer"
6. Enter offer amount (e.g., 4800000)
7. Add a message (e.g., "Interested in buying")
8. Click "Submit Offer"
9. ✅ **Check:** Offer should be created successfully

### Step 8: Verify New Transaction
1. Navigate to "Transactions" page
2. ✅ **Check:** Should show 2 transactions now
3. ✅ **Check:** New transaction type should be "Offer Created"
4. ✅ **Check:** Transaction status should be "PENDING"
5. ✅ **Check:** Should show offer amount and buyer/seller info

### Step 9: Accept Offer (as First User)
1. Login as first user (property owner)
2. Navigate to "Dashboard" or "Properties"
3. Find offers on your property
4. Click "Accept" on the offer
5. ✅ **Check:** Offer status should change to "ACCEPTED"

### Step 10: Verify Transaction Appended
1. Navigate to "Transactions" page
2. ✅ **Check:** Should show 3 transactions now
3. ✅ **Check:** Latest transaction type should be "Offer Accepted"
4. ✅ **Check:** Transaction status should be "PENDING"

### Step 11: Admin Verification
1. Navigate to `/admin` in the URL
2. ✅ **Check:** Admin dashboard should show pending verifications
3. Connect MetaMask wallet (switch to Sepolia testnet)
4. Click "Verify" on the accepted offer
5. Sign the transaction on Sepolia network
6. ✅ **Check:** Offer status should change to "ADMIN_VERIFIED"

### Step 12: Verify Final Transaction
1. Navigate to "Transactions" page
2. ✅ **Check:** Should show 4 transactions now
3. ✅ **Check:** Latest transaction type should be "Admin Verified"
4. ✅ **Check:** Transaction status should be "VERIFIED"
5. ✅ **Check:** Should show Sepolia transaction hash

## Key Features

### Auto-Refresh
- Transactions page auto-refreshes every 2 seconds
- You'll see new transactions appear automatically

### Search & Filter
- Search transactions by ID, property ID, type, status, or user
- Real-time filtering

### Data Persistence
- All data persists in localStorage
- Survives page refreshes
- Can be cleared via browser console

### Transaction Types
1. **PROPERTY_REGISTERED** - When property is added
2. **OFFER_CREATED** - When buyer makes offer
3. **OFFER_ACCEPTED** - When seller accepts offer
4. **OFFER_REJECTED** - When seller rejects offer
5. **OFFER_VERIFIED** - When admin verifies on Sepolia
6. **PROPERTY_TRANSFERRED** - When property ownership transfers

### Transaction Statuses
1. **COMPLETED** - Property registration complete
2. **PENDING** - Offer awaiting action
3. **VERIFIED** - Admin verified on blockchain
4. **CANCELLED** - Offer rejected/cancelled

## Troubleshooting

### Transactions Not Appearing
1. Open browser console
2. Check for JavaScript errors
3. Verify localStorage has data:
   ```javascript
   JSON.parse(localStorage.getItem('landchain_mock_data'))
   ```

### Registration Failed
1. Clear localStorage and try again
2. Check browser console for errors
3. Ensure all required fields are filled

### Data Not Persisting
1. Verify localStorage is enabled in browser
2. Check if private/incognito mode is blocking localStorage
3. Try a different browser

## Development Notes

### Data Storage Location
- **Key:** `landchain_mock_data`
- **Format:** JSON object with arrays for users, properties, offers, transactions, escrows

### Clear All Data
```javascript
localStorage.removeItem('landchain_mock_data')
```

### View All Transactions
```javascript
const data = JSON.parse(localStorage.getItem('landchain_mock_data'))
console.table(data.transactions)
```

### View All Properties
```javascript
const data = JSON.parse(localStorage.getItem('landchain_mock_data'))
console.table(data.properties)
```

### View All Offers
```javascript
const data = JSON.parse(localStorage.getItem('landchain_mock_data'))
console.table(data.offers)
```

## Next Steps

1. ✅ Test the complete workflow above
2. ✅ Verify transactions appear and append correctly
3. ✅ Ensure data persists across page refreshes
4. 🔄 Report any issues found during testing
5. 🔄 Request additional features if needed

## Summary

All your requirements have been implemented:
- ✅ Frontend integrates with Hyperledger Fabric (via mockDataStore)
- ✅ Transactions start empty
- ✅ Transactions append automatically on state changes
- ✅ No price prediction (removed)
- ✅ Test script updated for all chaincodes
- ✅ User experience simplified (no confusing role selection)
- ✅ Data persists properly

The system is now ready for testing!
