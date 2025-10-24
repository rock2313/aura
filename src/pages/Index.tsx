import { Building2, FileCheck, TrendingUp, Shield, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileCheck,
      title: "Digital Registration",
      description: "Register your property securely on blockchain",
    },
    {
      icon: Shield,
      title: "KYC Verification",
      description: "Complete verification process online",
    },
    {
      icon: Search,
      title: "Property Search",
      description: "Search and verify property details",
    },
    {
      icon: TrendingUp,
      title: "Price Prediction",
      description: "AI-powered property valuation",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Government Emblem Style */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold">LandChain Registry</h1>
                <p className="text-sm opacity-90">Blockchain-Based Land Management System</p>
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Login / Register
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent to-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Secure Land Registry System
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience transparent, secure, and efficient land registration powered by blockchain technology
            </p>
            
            {/* Quick Search */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Property Records
                </CardTitle>
                <CardDescription>
                  Enter property ID, owner name, or location to search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter search criteria..."
                    className="flex-1"
                  />
                  <Button onClick={() => navigate("/properties")}>
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Our Services</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/")}>
                <CardHeader>
                  <CardTitle>New Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Register a new property
                  </p>
                  <Button className="w-full">Start KYC</Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/transactions")}>
                <CardHeader>
                  <CardTitle>View Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Check transaction history
                  </p>
                  <Button variant="outline" className="w-full">View Records</Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/prediction")}>
                <CardHeader>
                  <CardTitle>Price Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get AI-powered valuation
                  </p>
                  <Button variant="outline" className="w-full">Predict Price</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p className="text-sm opacity-90">
              © 2025 LandChain Registry. All rights reserved.
            </p>
            <p className="text-xs opacity-75">
              Powered by Blockchain Technology for Secure Land Management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
