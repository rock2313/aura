import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { propertyChaincode } from '@/services/fabricClient';

export const AddProperty = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    area: '',
    price: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!currentUser.userId) {
        toast({
          title: 'Error',
          description: 'Please login first',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Generate property ID
      const propertyId = `PROP_${Date.now()}`;

      // Register property on blockchain
      await propertyChaincode.registerProperty({
        propertyId,
        owner: currentUser.userId,
        ownerName: currentUser.name,
        location: formData.location,
        area: parseFloat(formData.area),
        price: parseFloat(formData.price),
        propertyType: formData.type,
        description: formData.description,
        latitude: 0, // You can add map integration later
        longitude: 0,
      });

      console.log('✅ Property registered successfully:', propertyId);

      toast({
        title: 'Property Registered! 🎉',
        description: 'Your property has been registered on the blockchain. Transaction created.',
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: '',
        type: '',
        location: '',
        area: '',
        price: '',
        description: '',
      });
    } catch (error: any) {
      console.error('❌ Property registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to register property',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Property</h1>
          <p className="text-muted-foreground">
            Register a new property in the blockchain land registry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Luxury Villa"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="City, Area"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area *</Label>
              <Input
                id="area"
                placeholder="e.g., 2500 sq ft"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              placeholder="e.g., ₹1.2 Cr"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Property Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the property features, amenities, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="min-h-32"
            />
          </div>

          <div className="space-y-2">
            <Label>Property Documents *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
              <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload property documents</p>
              <p className="text-xs text-muted-foreground">
                Title deed, survey documents, etc. (PDF, JPG or PNG)
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(221,83%,53%)] hover:opacity-90"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Registering on Blockchain...' : 'Register Property on Blockchain'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
