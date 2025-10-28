import { useState } from 'react';
import { User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { userChaincode, sepoliaService } from '@/services/fabricClient';

interface KYCProps {
  onComplete: (userId: string, userName: string, userRole: string) => void;
}

export const KYC = ({ onComplete }: KYCProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    aadhar: '',
    pan: '',
    password: '',
    address: '',
    role: '',
    walletAddress: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnectWallet = async () => {
    const address = await sepoliaService.connectWallet();
    if (address) {
      setFormData({ ...formData, walletAddress: address });
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${address.substring(0, 6)}...${address.substring(38)}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.walletAddress) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Generate user ID
      const userId = `USER_${Date.now()}`;

      // Hash password (in production, use proper hashing like bcrypt)
      const passwordHash = btoa(formData.password);

      // Register user on Hyperledger Fabric
      await userChaincode.registerUser({
        userId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        aadhar: formData.aadhar,
        pan: formData.pan,
        address: formData.address,
        role: formData.role,
        walletAddress: formData.walletAddress,
        passwordHash,
      });

      toast({
        title: 'Registration Successful',
        description: 'Your credentials have been stored on the blockchain',
      });

      onComplete(userId, formData.fullName, formData.role);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'Failed to register user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your verification to access the Land Registry System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Number *</Label>
              <Input
                id="aadhar"
                placeholder="XXXX XXXX XXXX"
                value={formData.aadhar}
                onChange={(e) => setFormData({ ...formData, aadhar: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number *</Label>
              <Input
                id="pan"
                placeholder="XXXXX0000X"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-input text-primary-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Select Your Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
              required
            >
              <SelectTrigger className="bg-input text-primary-foreground">
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">Buyer - I want to purchase land</SelectItem>
                <SelectItem value="SELLER">Seller - I want to sell my land</SelectItem>
                <SelectItem value="ADMIN">Admin - I verify transactions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter your complete address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="bg-input text-primary-foreground min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>Connect Wallet (Sepolia Network) *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50">
              {formData.walletAddress ? (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">Wallet Connected</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formData.walletAddress.substring(0, 10)}...{formData.walletAddress.substring(38)}
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    variant="outline"
                    className="mb-2"
                  >
                    Connect MetaMask Wallet
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Required for blockchain transactions
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Upload Documents</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/50">
              <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload Aadhar and PAN documents</p>
              <p className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 5MB) - Stored on blockchain</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, agreedToTerms: checked as boolean })
              }
            />
            <Label htmlFor="terms" className="text-sm cursor-pointer">
              I agree to the Terms and Conditions and Privacy Policy
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-[hsl(221,83%,53%)] hover:opacity-90"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Registering on Blockchain...' : 'Complete Verification'}
          </Button>
        </form>
      </div>
    </div>
  );
};
