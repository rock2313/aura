import { useState } from 'react';
import { LogIn, UserPlus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { KYC } from './KYC';

interface LoginProps {
  onLoginSuccess: (userId: string, userName: string) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await apiClient.login(loginData.email, loginData.password);

      if (result.success && result.data) {
        // Store user data in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
          userId: result.data.userId,
          name: result.data.name,
          email: result.data.email,
          role: result.data.role
        }));

        toast({
          title: 'Login Successful! 🎉',
          description: `Welcome back, ${result.data.name}!`,
        });

        onLoginSuccess(result.data.userId, result.data.name);
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (userType: 'admin' | 'seller' | 'buyer') => {
    const credentials = {
      admin: { email: 'admin@landregistry.gov', password: 'admin123' },
      seller: { email: 'ramesh@example.com', password: 'seller123' },
      buyer: { email: 'priya@example.com', password: 'buyer123' },
    };
    setLoginData(credentials[userType]);
  };

  if (showRegister) {
    return <KYC onComplete={onLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LandChain Registry
          </h1>
          <p className="text-muted-foreground">
            Blockchain-based Government Property Registry System
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to Your Account</CardTitle>
                <CardDescription>
                  Enter your credentials to access the land registry system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>

                {/* Demo Users Section */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-3 text-center">
                    Quick Login with Demo Users:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('admin')}
                      className="w-full"
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold">Admin Officer</div>
                        <div className="text-xs text-muted-foreground">Verify properties</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('seller')}
                      className="w-full"
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold">Ramesh Kumar</div>
                        <div className="text-xs text-muted-foreground">Property Seller</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials('buyer')}
                      className="w-full"
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold">Priya Sharma</div>
                        <div className="text-xs text-muted-foreground">Property Buyer</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create New Account</CardTitle>
                <CardDescription>
                  Register as a new user to access the property registry system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <UserPlus className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">New User Registration</h3>
                    <p className="text-muted-foreground mb-6">
                      Complete KYC verification to register as a new user
                    </p>
                    <Button onClick={() => setShowRegister(true)} size="lg">
                      Start Registration
                    </Button>
                  </div>

                  <div className="bg-muted p-4 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Required Documents:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Aadhar Card Number</li>
                      <li>PAN Card Number</li>
                      <li>Valid Email Address</li>
                      <li>Phone Number</li>
                      <li>Residential Address</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>Powered by Hyperledger Fabric & Ethereum Sepolia</p>
          <p className="mt-1">Secure • Transparent • Immutable</p>
        </div>
      </div>
    </div>
  );
};
