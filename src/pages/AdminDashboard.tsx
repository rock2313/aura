import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { offerChaincode, propertyChaincode, sepoliaService } from '@/services/fabricClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Offer {
  offerId: string;
  propertyId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  offerAmount: number;
  status: string;
  message: string;
  adminVerified: boolean;
  sepoliaTxHash: string;
}

export const AdminDashboard = () => {
  const [pendingOffers, setPendingOffers] = useState<Offer[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingOffers();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const address = await sepoliaService.connectWallet();
    setWalletConnected(!!address);
  };

  const loadPendingOffers = async () => {
    try {
      const result = await offerChaincode.getPendingAdminVerifications();
      if (result.status === 'SUCCESS') {
        setPendingOffers(result.payload.data || []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
    }
  };

  const handleVerifyOffer = async (offer: Offer) => {
    if (!walletConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to verify transactions',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(offer.offerId);
    try {
      // Switch to Sepolia network
      const switched = await sepoliaService.switchToSepoliaTestnet();
      if (!switched) {
        throw new Error('Failed to switch to Sepolia network');
      }

      // Record transaction on Sepolia
      toast({
        title: 'Recording Transaction',
        description: 'Please confirm the transaction in MetaMask',
      });

      const txHash = await sepoliaService.recordTransaction(
        offer.offerId,
        offer.buyerId,
        offer.sellerId,
        (offer.offerAmount / 1e18).toString() // Convert from Wei
      );

      if (!txHash) {
        throw new Error('Transaction failed');
      }

      // Update offer status on Hyperledger Fabric
      const adminId = 'ADMIN_001'; // In production, get from logged-in user
      await offerChaincode.adminVerifyOffer(offer.offerId, adminId, txHash);

      // Transfer property ownership
      await propertyChaincode.transferProperty(
        offer.propertyId,
        offer.buyerId,
        offer.buyerName,
        `TXN_${Date.now()}`
      );

      // Complete the offer
      await offerChaincode.completeOffer(offer.offerId);

      toast({
        title: 'Transaction Verified',
        description: `Transaction recorded on Sepolia: ${txHash.substring(0, 10)}...`,
      });

      // Refresh the list
      loadPendingOffers();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify transaction',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setProcessing(offerId);
    try {
      await offerChaincode.cancelOffer(offerId);
      toast({
        title: 'Offer Rejected',
        description: 'The offer has been rejected',
      });
      loadPendingOffers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject offer',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Verify and manage land transactions
                </p>
              </div>
            </div>
            <Badge variant={walletConnected ? 'default' : 'destructive'}>
              {walletConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOffers.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting admin approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Transactions verified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Transactions rejected
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Transaction Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOffers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending transactions to verify</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer ID</TableHead>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOffers.map((offer) => (
                    <TableRow key={offer.offerId}>
                      <TableCell className="font-mono text-xs">
                        {offer.offerId.substring(0, 12)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {offer.propertyId.substring(0, 12)}...
                      </TableCell>
                      <TableCell>{offer.buyerName}</TableCell>
                      <TableCell>{offer.sellerName}</TableCell>
                      <TableCell>₹{offer.offerAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{offer.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyOffer(offer)}
                            disabled={processing === offer.offerId}
                          >
                            {processing === offer.offerId ? (
                              'Processing...'
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectOffer(offer.offerId)}
                            disabled={processing === offer.offerId}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
