import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Building2, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';

interface Property {
  propertyId: string;
  owner: string;
  ownerName: string;
  location: string;
  area: number;
  price: number;
  propertyType: string;
  description: string;
  status: string;
  registeredAt: string;
}

interface Offer {
  offerId: string;
  propertyId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  offerAmount: number;
  message: string;
  status: string;
  createdAt: string;
}

export const AdminDashboard = () => {
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [acceptedOffers, setAcceptedOffers] = useState<Offer[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Property | Offer | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyType, setVerifyType] = useState<'property' | 'offer'>('property');
  const { toast } = useToast();

  useEffect(() => {
    loadData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load all properties
      const propsResult = await apiClient.getAllProperties();
      if (propsResult.success && propsResult.data) {
        setAllProperties(propsResult.data);
        setPendingProperties(propsResult.data.filter((p: Property) => p.status === 'PENDING'));
      }

      // Load all offers
      const offersResult = await apiClient.getAllOffers();
      if (offersResult.success && offersResult.data) {
        setAcceptedOffers(offersResult.data.filter((o: Offer) => o.status === 'ACCEPTED'));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleVerifyProperty = (property: Property) => {
    setSelectedItem(property);
    setVerifyType('property');
    setShowVerifyDialog(true);
  };

  const handleVerifyOffer = (offer: Offer) => {
    setSelectedItem(offer);
    setVerifyType('offer');
    setShowVerifyDialog(true);
  };

  const confirmVerification = async () => {
    if (!selectedItem) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const adminId = currentUser.userId || 'ADMIN_001';

    setProcessing(verifyType === 'property' ? (selectedItem as Property).propertyId : (selectedItem as Offer).offerId);

    try {
      if (verifyType === 'property') {
        const property = selectedItem as Property;
        await apiClient.verifyProperty(property.propertyId, adminId);

        toast({
          title: 'Property Verified! ✓',
          description: `${property.location} has been verified and can now be listed for sale.`,
        });
      } else {
        const offer = selectedItem as Offer;
        await apiClient.verifyOffer(offer.offerId, adminId, 'SEPOLIA_TX_' + Date.now());

        toast({
          title: 'Offer Verified! ✓',
          description: 'Transaction completed successfully. Property ownership will be transferred.',
        });
      }

      setShowVerifyDialog(false);
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const verifiedProperties = allProperties.filter(p => p.status === 'VERIFIED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Verify properties and approve transactions
              </p>
            </div>
          </div>
          <Badge className="bg-blue-600">Administrator</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Properties</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingProperties.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
              <FileCheck className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedOffers.length}</div>
              <p className="text-xs text-muted-foreground">Accepted by sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Properties</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedProperties.length}</div>
              <p className="text-xs text-muted-foreground">Total verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allProperties.length}</div>
              <p className="text-xs text-muted-foreground">In the system</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different verification types */}
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="properties">
              Properties ({pendingProperties.length})
            </TabsTrigger>
            <TabsTrigger value="offers">
              Offers ({acceptedOffers.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Properties Tab */}
          <TabsContent value="properties" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Property Verifications</CardTitle>
                <CardDescription>
                  Review and verify newly registered properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingProperties.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending properties to verify</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingProperties.map((property) => (
                      <Card key={property.propertyId}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-yellow-500">PENDING</Badge>
                                <Badge variant="outline">{property.propertyType}</Badge>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{property.location}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-muted-foreground">Owner</p>
                                  <p className="font-medium">{property.ownerName}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Area</p>
                                  <p className="font-medium">{property.area} sq ft</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Price</p>
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(property.price)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Registered</p>
                                  <p>{new Date(property.registeredAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {property.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {property.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground font-mono">
                                ID: {property.propertyId}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button
                              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                              onClick={() => handleVerifyProperty(property)}
                              disabled={processing === property.propertyId}
                            >
                              {processing === property.propertyId ? (
                                'Verifying...'
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify Property
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accepted Offers Tab */}
          <TabsContent value="offers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Offers (Pending Verification)</CardTitle>
                <CardDescription>
                  Final verification for seller-accepted offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {acceptedOffers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No accepted offers pending verification</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedOffers.map((offer) => {
                      const property = allProperties.find(p => p.propertyId === offer.propertyId);
                      return (
                        <Card key={offer.offerId}>
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-500">ACCEPTED</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Awaiting Admin Verification
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                  {property?.location || 'Property details loading...'}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                                  <div>
                                    <p className="text-muted-foreground">Seller</p>
                                    <p className="font-medium">{offer.sellerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Buyer</p>
                                    <p className="font-medium">{offer.buyerName}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Offer Amount</p>
                                    <p className="font-bold text-green-600">
                                      {formatCurrency(offer.offerAmount)}
                                    </p>
                                  </div>
                                </div>
                                {offer.message && (
                                  <div className="p-3 bg-muted rounded mb-3">
                                    <p className="text-sm text-muted-foreground mb-1">Buyer's Message:</p>
                                    <p className="text-sm">{offer.message}</p>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground font-mono">
                                  Offer ID: {offer.offerId}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleVerifyOffer(offer)}
                                disabled={processing === offer.offerId}
                              >
                                {processing === offer.offerId ? (
                                  'Processing...'
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify & Complete Transaction
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Verification Dialog */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {verifyType === 'property' ? 'Verify Property?' : 'Verify Transaction?'}
              </DialogTitle>
              <DialogDescription>
                {verifyType === 'property'
                  ? 'This will verify the property and allow the owner to list it for sale.'
                  : 'This will complete the transaction and transfer property ownership to the buyer.'}
              </DialogDescription>
            </DialogHeader>

            {selectedItem && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {verifyType === 'property' ? (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Location:</span>{' '}
                      {(selectedItem as Property).location}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Owner:</span>{' '}
                      {(selectedItem as Property).ownerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span>{' '}
                      {formatCurrency((selectedItem as Property).price)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      <span className="font-medium">Seller:</span>{' '}
                      {(selectedItem as Offer).sellerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Buyer:</span>{' '}
                      {(selectedItem as Offer).buyerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Amount:</span>{' '}
                      {formatCurrency((selectedItem as Offer).offerAmount)}
                    </p>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowVerifyDialog(false)}
                disabled={!!processing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmVerification}
                disabled={!!processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : 'Verify'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
