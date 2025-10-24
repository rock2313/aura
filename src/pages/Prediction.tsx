import { useState } from 'react';
import { TrendingUp, MapPin, Home, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import transactionData from '@/data/tirupatidataset_with_location.json';

interface PredictionResult {
  pricePerSqFt: number;
  totalPrice: number;
  priceRange: { min: number; max: number };
  confidence: 'low' | 'medium' | 'high';
  factors: string[];
  marketTrend: string;
  recommendation: string;
}

export const Prediction = () => {
  const [showPrediction, setShowPrediction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    district: 'Tirupati',
    mandal: '',
    village: '',
    type: '',
    area: '',
  });

  // Get unique mandals and villages from the dataset
  const mandals = [...new Set(transactionData.data.map((t: any) => t.MANDAL))].sort();
  const villages = formData.mandal 
    ? [...new Set(transactionData.data
        .filter((t: any) => t.MANDAL === formData.mandal)
        .map((t: any) => t.VILLAGE))].sort()
    : [];

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get historical data for the selected location
      const historicalData = transactionData.data
        .filter((t: any) => 
          t.MANDAL === formData.mandal && 
          t.VILLAGE === formData.village
        )
        .sort((a: any, b: any) => 
          new Date(b.EFFECTIVE_DATE).getTime() - new Date(a.EFFECTIVE_DATE).getTime()
        );

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-price`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            location: {
              district: formData.district,
              mandal: formData.mandal,
              village: formData.village,
            },
            area: parseInt(formData.area),
            propertyType: formData.type,
            historicalData: historicalData.slice(0, 50),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setShowPrediction(true);
      
      toast({
        title: '✨ Prediction Generated',
        description: 'AI-powered price analysis complete',
      });
    } catch (error) {
      console.error('Prediction error:', error);
      toast({
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'Please try again',
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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  AI Price Prediction
                </h1>
                <p className="text-sm text-muted-foreground">Powered by Lovable AI</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-2">
              <Sparkles className="h-3 w-3" />
              Test Network
            </Badge>
          </div>
          <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Test Environment:</strong> This is a demonstration system using real Tirupati land registry data.
              AI predictions are for testing purposes and based on historical transaction patterns.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mandal">Mandal *</Label>
                  <Select
                    value={formData.mandal}
                    onValueChange={(value) => setFormData({ ...formData, mandal: value, village: '' })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mandal" />
                    </SelectTrigger>
                    <SelectContent>
                      {mandals.map((mandal) => (
                        <SelectItem key={mandal} value={mandal}>
                          {mandal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Select
                    value={formData.village}
                    onValueChange={(value) => setFormData({ ...formData, village: value })}
                    disabled={!formData.mandal}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map((village) => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Property Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq ft) *</Label>
                  <Input
                    id="area"
                    type="number"
                    placeholder="e.g., 2500"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                    min="1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⚡</span>
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Prediction
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {showPrediction && prediction && (
            <Card className="border-2 border-primary/30 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    AI Prediction Result
                  </span>
                  <Badge className={getConfidenceColor(prediction.confidence)}>
                    {prediction.confidence} confidence
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-lg">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {formatCurrency(prediction.totalPrice)}
                  </div>
                  <p className="text-sm text-muted-foreground">Estimated Market Value</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(prediction.pricePerSqFt)}/sq ft
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-sm font-medium">Lower Range</span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {formatCurrency(prediction.priceRange.min)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium">Upper Range</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      {formatCurrency(prediction.priceRange.max)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Market Trend
                    </h4>
                    <p className="text-sm text-muted-foreground">{prediction.marketTrend}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Key Factors
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {prediction.factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      Recommendation
                    </h4>
                    <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
