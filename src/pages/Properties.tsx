import { useState, useEffect } from 'react';
import { MapPin, DollarSign, Home, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';

interface Property {
  propertyId: string;
  owner: string;
  ownerName: string;
  location: string;
  area: number;
  price: number;
  status: string;
  propertyType: string;
  description: string;
  registeredAt: string;
}

export const Properties = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Load current user
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);

    // Load properties
    loadProperties();

    // Refresh every 3 seconds
    const interval = setInterval(loadProperties, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadProperties = async () => {
    try {
      const result = await apiClient.getAllProperties();
      if (result.success && result.data) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleMakeOffer = (property: Property) => {
    if (!currentUser?.userId) {
      toast({
        title: 'Login Required',
        description: 'Please login to make an offer',
        variant: 'destructive',
      });
      return;
    }

    if (property.owner === currentUser.userId) {
      toast({
        title: 'Cannot Make Offer',
        description: 'You cannot make an offer on your own property',
        variant: 'destructive',
      });
      return;
    }

    setSelectedProperty(property);
    setOfferAmount(property.price.toString());
    setOfferMessage('');
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedProperty || !currentUser) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid offer amount',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const offerId = `OFFER_${Date.now()}`;

      await apiClient.createOffer({
        offerId,
        propertyId: selectedProperty.propertyId,
        buyerId: currentUser.userId,
        buyerName: currentUser.name,
        sellerId: selectedProperty.owner,
        sellerName: selectedProperty.ownerName,
        offerAmount: amount,
        message: offerMessage,
      });

      console.log('✅ Offer created via backend:', offerId);

      toast({
        title: 'Offer Submitted! 🎉',
        description: 'Your offer has been submitted. The seller will review it. Transaction created.',
        duration: 5000,
      });

      setShowOfferModal(false);
      setSelectedProperty(null);
      setOfferAmount('');
      setOfferMessage('');
    } catch (error: any) {
      console.error('❌ Offer submission error:', error);
      toast({
        title: 'Failed to Submit Offer',
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
      case 'VERIFIED':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'TRANSFERRED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Available Properties</h1>
            <p className="text-muted-foreground">
              {properties.length === 0
                ? "No properties listed yet. Be the first to add a property!"
                : `Browse ${properties.length} blockchain-registered propert${properties.length === 1 ? 'y' : 'ies'}`}
            </p>
          </div>
        </div>

        {properties.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="text-center py-12">
              <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Available</h3>
              <p className="text-muted-foreground mb-6">
                Properties will appear here once they are registered on the blockchain.
              </p>
              <Button onClick={() => window.location.href = '/add-property'}>
                Register Your Property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.propertyId} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                    <Badge variant="outline">{property.propertyType}</Badge>
                  </div>
                  <CardTitle className="text-lg">{property.location}</CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {property.propertyId.substring(0, 20)}...
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{property.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>{property.area} sq ft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold">{formatCurrency(property.price)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-2">
                      <p>Owner: {property.ownerName}</p>
                      <p>Registered: {new Date(property.registeredAt).toLocaleDateString()}</p>
                    </div>
                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {property.description}
                      </p>
                    )}
                  </div>

                  {currentUser?.userId && currentUser.userId !== property.owner && (
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-blue-600"
                      onClick={() => handleMakeOffer(property)}
                    >
                      Make an Offer
                    </Button>
                  )}

                  {currentUser?.userId === property.owner && (
                    <div className="text-center text-sm text-muted-foreground py-2 bg-muted rounded">
                      Your Property
                    </div>
                  )}

                  {!currentUser?.userId && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast({
                        title: 'Login Required',
                        description: 'Please login to make an offer',
                      })}
                    >
                      Login to Make Offer
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Make Offer Modal */}
        <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make an Offer</DialogTitle>
              <DialogDescription>
                Submit your offer for this property. The seller will review and respond.
              </DialogDescription>
            </DialogHeader>

            {selectedProperty && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">{selectedProperty.location}</p>
                  <p className="text-xs text-muted-foreground">
                    Listed Price: {formatCurrency(selectedProperty.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owner: {selectedProperty.ownerName}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerAmount">Your Offer Amount (₹)</Label>
                  <Input
                    id="offerAmount"
                    type="number"
                    placeholder="Enter your offer amount"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerMessage">Message (Optional)</Label>
                  <Textarea
                    id="offerMessage"
                    placeholder="Add a message to the seller..."
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOfferModal(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmitOffer} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
