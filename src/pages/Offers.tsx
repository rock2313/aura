import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';

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
  updatedAt: string;
}

interface Property {
  propertyId: string;
  location: string;
  price: number;
  area: number;
  propertyType: string;
}

export const Offers = () => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [properties, setProperties] = useState<{ [key: string]: Property }>({});
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    if (user.userId) {
      loadOffers();
      loadProperties();

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        loadOffers();
        loadProperties();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const loadOffers = async () => {
    try {
      const result = await apiClient.getAllOffers();
      if (result.success && result.data) {
        setOffers(result.data);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  const loadProperties = async () => {
    try {
      const result = await apiClient.getAllProperties();
      if (result.success && result.data) {
        const propMap: { [key: string]: Property } = {};
        result.data.forEach((prop: Property) => {
          propMap[prop.propertyId] = prop;
        });
        setProperties(propMap);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleAction = (offer: Offer, action: 'accept' | 'reject') => {
    setSelectedOffer(offer);
    setActionType(action);
    setShowActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedOffer) return;

    setLoading(true);
    try {
      if (actionType === 'accept') {
        await apiClient.acceptOffer(selectedOffer.offerId);
        toast({
          title: 'Offer Accepted! 🎉',
          description: 'The buyer will be notified. Admin verification is pending.',
        });
      } else {
        await apiClient.rejectOffer(selectedOffer.offerId);
        toast({
          title: 'Offer Rejected',
          description: 'The buyer will be notified.',
        });
      }

      setShowActionDialog(false);
      setSelectedOffer(null);
      loadOffers();
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'ACCEPTED':
        return 'bg-green-500';
      case 'REJECTED':
        return 'bg-red-500';
      case 'ADMIN_VERIFIED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Filter offers based on user role
  const getFilteredOffers = () => {
    if (!currentUser?.userId) return [];

    if (currentUser.role === 'ADMIN') {
      // Admin sees all accepted offers (pending verification)
      return offers.filter(o => o.status === 'ACCEPTED');
    } else {
      // Regular users see offers where they are seller or buyer
      return offers.filter(
        o => o.sellerId === currentUser.userId || o.buyerId === currentUser.userId
      );
    }
  };

  const filteredOffers = getFilteredOffers();

  // Separate offers by type
  const receivedOffers = filteredOffers.filter(o => o.sellerId === currentUser?.userId);
  const sentOffers = filteredOffers.filter(o => o.buyerId === currentUser?.userId);

  if (!currentUser?.userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Please login to view offers</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Property Offers</h1>
          <p className="text-muted-foreground">
            Manage offers on your properties
          </p>
        </div>

        {/* Admin View */}
        {currentUser.role === 'ADMIN' && (
          <Card>
            <CardHeader>
              <CardTitle>Accepted Offers (Pending Verification)</CardTitle>
              <CardDescription>
                These offers have been accepted by sellers and need admin verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOffers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No accepted offers pending verification
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOffers.map((offer) => (
                    <Card key={offer.offerId}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getStatusColor(offer.status)}>
                                {offer.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {offer.offerId.substring(0, 20)}...
                              </span>
                            </div>
                            <p className="font-semibold text-lg mb-2">
                              {properties[offer.propertyId]?.location || 'Property details loading...'}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
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
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p>{new Date(offer.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {offer.message && (
                              <div className="mt-3 p-3 bg-muted rounded">
                                <p className="text-sm text-muted-foreground">Message:</p>
                                <p className="text-sm">{offer.message}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Regular User View */}
        {currentUser.role !== 'ADMIN' && (
          <>
            {/* Received Offers (as Seller) */}
            <Card>
              <CardHeader>
                <CardTitle>Received Offers ({receivedOffers.length})</CardTitle>
                <CardDescription>
                  Offers from buyers on your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receivedOffers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No offers received yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedOffers.map((offer) => (
                      <Card key={offer.offerId}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getStatusColor(offer.status)}>
                                  {offer.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {offer.offerId.substring(0, 20)}...
                                </span>
                              </div>
                              <p className="font-semibold text-lg mb-2">
                                <MapPin className="h-4 w-4 inline mr-1" />
                                {properties[offer.propertyId]?.location || 'Loading...'}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <p className="text-muted-foreground">Buyer</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {offer.buyerName}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Offer Amount</p>
                                  <p className="font-bold text-green-600 flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    {formatCurrency(offer.offerAmount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Listed Price</p>
                                  <p>{formatCurrency(properties[offer.propertyId]?.price || 0)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Offer Date</p>
                                  <p>{new Date(offer.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              {offer.message && (
                                <div className="p-3 bg-muted rounded">
                                  <p className="text-sm text-muted-foreground mb-1">Message from buyer:</p>
                                  <p className="text-sm">{offer.message}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {offer.status === 'PENDING' && (
                            <div className="flex gap-2 mt-4">
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={() => handleAction(offer, 'accept')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Offer
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => handleAction(offer, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {offer.status === 'ACCEPTED' && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                Accepted - Awaiting admin verification
                              </span>
                            </div>
                          )}

                          {offer.status === 'ADMIN_VERIFIED' && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-700">
                                Admin Verified - Transaction complete!
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sent Offers (as Buyer) */}
            <Card>
              <CardHeader>
                <CardTitle>Sent Offers ({sentOffers.length})</CardTitle>
                <CardDescription>
                  Offers you've made on properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentOffers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You haven't made any offers yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sentOffers.map((offer) => (
                      <Card key={offer.offerId}>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(offer.status)}>
                              {offer.status}
                            </Badge>
                          </div>
                          <p className="font-semibold text-lg mb-2">
                            {properties[offer.propertyId]?.location || 'Loading...'}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Seller</p>
                              <p className="font-medium">{offer.sellerName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Your Offer</p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(offer.offerAmount)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Confirmation Dialog */}
        <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'accept' ? 'Accept Offer?' : 'Reject Offer?'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'accept'
                  ? 'This will accept the offer. Admin verification will be required to complete the transaction.'
                  : 'This will reject the offer and notify the buyer.'}
              </DialogDescription>
            </DialogHeader>

            {selectedOffer && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Property:</span>{' '}
                  {properties[selectedOffer.propertyId]?.location}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Buyer:</span> {selectedOffer.buyerName}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Offer Amount:</span>{' '}
                  {formatCurrency(selectedOffer.offerAmount)}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={confirmAction}
                disabled={loading}
                className={actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {loading ? 'Processing...' : actionType === 'accept' ? 'Accept Offer' : 'Reject Offer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
