// Hyperledger Fabric Client Interface
// This connects to your deployed Fabric network

interface FabricConfig {
  networkUrl: string;
  channelName: string;
  chaincodeName: string;
  mspId: string;
}

// Mock interface - replace with actual Fabric SDK in production
class FabricClient {
  private config: FabricConfig;
  private isConnected: boolean = false;

  constructor(config: FabricConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // In production: Initialize Fabric SDK gateway connection
    console.log('Connecting to Fabric network:', this.config.networkUrl);
    this.isConnected = true;
  }

  async invokeChaincode(
    functionName: string,
    args: string[]
  ): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    // In production: Submit transaction to chaincode
    console.log(`Invoking chaincode: ${functionName}`, args);
    
    // Mock response - replace with actual transaction
    return {
      txId: `tx_${Date.now()}`,
      status: 'SUCCESS',
      payload: { message: 'Transaction submitted to Fabric network' }
    };
  }

  async queryChaincode(
    functionName: string,
    args: string[]
  ): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Not connected to Fabric network');
    }

    // In production: Query chaincode
    console.log(`Querying chaincode: ${functionName}`, args);
    
    // Mock response
    return {
      status: 'SUCCESS',
      payload: { data: [] }
    };
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Disconnected from Fabric network');
  }
}

// Fabric network configuration
const fabricConfig: FabricConfig = {
  networkUrl: 'http://localhost:7051', // Your peer URL
  channelName: 'landregistry',
  chaincodeName: 'property-contract',
  mspId: 'Org1MSP'
};

export const fabricClient = new FabricClient(fabricConfig);

// Property chaincode functions
export const propertyChaincode = {
  // Register new property on blockchain
  async registerProperty(propertyData: {
    propertyId: string;
    owner: string;
    location: string;
    area: number;
    price: number;
  }) {
    return fabricClient.invokeChaincode('RegisterProperty', [
      propertyData.propertyId,
      propertyData.owner,
      propertyData.location,
      propertyData.area.toString(),
      propertyData.price.toString()
    ]);
  },

  // Transfer property ownership
  async transferProperty(propertyId: string, newOwner: string) {
    return fabricClient.invokeChaincode('TransferProperty', [
      propertyId,
      newOwner
    ]);
  },

  // Get property details
  async getProperty(propertyId: string) {
    return fabricClient.queryChaincode('GetProperty', [propertyId]);
  },

  // Get property history
  async getPropertyHistory(propertyId: string) {
    return fabricClient.queryChaincode('GetPropertyHistory', [propertyId]);
  }
};

// Escrow chaincode functions
export const escrowChaincode = {
  // Create escrow for property transaction
  async createEscrow(escrowData: {
    escrowId: string;
    propertyId: string;
    buyer: string;
    seller: string;
    amount: number;
  }) {
    return fabricClient.invokeChaincode('CreateEscrow', [
      escrowData.escrowId,
      escrowData.propertyId,
      escrowData.buyer,
      escrowData.seller,
      escrowData.amount.toString()
    ]);
  },

  // Release escrow funds
  async releaseEscrow(escrowId: string) {
    return fabricClient.invokeChaincode('ReleaseEscrow', [escrowId]);
  },

  // Cancel escrow and refund
  async cancelEscrow(escrowId: string) {
    return fabricClient.invokeChaincode('CancelEscrow', [escrowId]);
  },

  // Get escrow status
  async getEscrowStatus(escrowId: string) {
    return fabricClient.queryChaincode('GetEscrow', [escrowId]);
  }
};

// MetaMask integration for payments
export const metamaskService = {
  async connectWallet(): Promise<string | null> {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        return accounts[0];
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        return null;
      }
    } else {
      alert('Please install MetaMask!');
      return null;
    }
  },

  async switchToSepoliaTestnet(): Promise<boolean> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia testnet
      });
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      return false;
    }
  },

  async sendPayment(to: string, amount: string): Promise<string | null> {
    try {
      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: window.ethereum.selectedAddress,
          to: to,
          value: (parseFloat(amount) * 1e18).toString(16), // Convert ETH to Wei
        }],
      });
      return transactionHash;
    } catch (error) {
      console.error('Payment failed:', error);
      return null;
    }
  }
};

// TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
