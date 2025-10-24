import { useState } from 'react';
import { MapPin, DollarSign, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyDetailsModal } from '@/components/PropertyDetailsModal';
import { useToast } from '@/hooks/use-toast';

const mockProperties = [
  {
    id: 'PR1001',
    title: 'Luxury Villa',
    location: 'Whitefield, Bangalore',
    area: '2500 sq ft',
    areaValue: '5 acres',
    price: '₹1.2 Cr',
    status: 'Verified',
    type: 'Residential',
    state: 'Karnataka',
    mandal: 'Bangalore East',
    village: 'Whitefield',
    surveyNo: 'SV-2024-001',
    lastSale: 'Jan 15, 2024',
    propertyIds: [
      'PROP-KA-BLR-2024-001-A',
      'PROP-KA-BLR-2024-001-B',
      'PROP-KA-BLR-2024-001-C',
      'PROP-KA-BLR-2024-001-D',
    ],
    currentBid: '₹1.25 Cr',
    transactions: [
      { from: 'Rajesh Kumar', to: 'Priya Sharma', amount: '₹95 Lakhs' },
      { from: 'Amit Patel', to: 'Rajesh Kumar', amount: '₹80 Lakhs' },
    ],
  },
  {
    id: 'PR1002',
    title: 'Commercial Space',
    location: 'MG Road, Bangalore',
    area: '1800 sq ft',
    areaValue: '3 acres',
    price: '₹80 Lakhs',
    status: 'Pending',
    type: 'Commercial',
    state: 'Karnataka',
    mandal: 'Bangalore Central',
    village: 'MG Road',
    surveyNo: 'SV-2024-002',
    lastSale: 'Dec 20, 2023',
    propertyIds: [
      'PROP-KA-BLR-2024-002-A',
      'PROP-KA-BLR-2024-002-B',
    ],
    currentBid: '₹85 Lakhs',
    transactions: [
      { from: 'Tech Solutions Ltd', to: 'Global Corp', amount: '₹70 Lakhs' },
    ],
  },
  {
    id: 'PR1003',
    title: 'Farm Land',
    location: 'Devanahalli, Bangalore',
    area: '5 Acres',
    areaValue: '5 acres',
    price: '₹50 Lakhs',
    status: 'Verified',
    type: 'Agricultural',
    state: 'Karnataka',
    mandal: 'Devanahalli',
    village: 'Sadahalli',
    surveyNo: 'SV-2024-003',
    lastSale: 'Nov 5, 2023',
    propertyIds: [
      'PROP-KA-DVH-2024-003-A',
      'PROP-KA-DVH-2024-003-B',
      'PROP-KA-DVH-2024-003-C',
    ],
    currentBid: '₹52 Lakhs',
    transactions: [
      { from: 'Farmer Cooperative', to: 'Suresh Reddy', amount: '₹45 Lakhs' },
      { from: 'State Land Board', to: 'Farmer Cooperative', amount: '₹40 Lakhs' },
    ],
  },
];

export const Properties = () => {
  const [selectedProperty, setSelectedProperty] = useState<typeof mockProperties[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (property: typeof mockProperties[0]) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleBid = () => {
    toast({
      title: 'Bid Placed Successfully',
      description: 'Your bid has been submitted for review.',
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Properties</h1>
          <p className="text-muted-foreground">Manage and view all your registered properties</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProperties.map((property) => (
            <Card
              key={property.id}
              className="border-2 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{property.title}</CardTitle>
                  <Badge
                    variant={property.status === 'Verified' ? 'default' : 'secondary'}
                    className={
                      property.status === 'Verified'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    }
                  >
                    {property.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">ID: {property.id}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>{property.area}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  <span>{property.price}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline">{property.type}</Badge>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleViewDetails(property)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onBid={handleBid}
        />
      </div>
    </div>
  );
};
