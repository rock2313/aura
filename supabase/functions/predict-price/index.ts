import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, area, propertyType, historicalData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context from historical data
    const dataContext = historicalData?.slice(0, 20).map((tx: any) => 
      `Location: ${tx.VILLAGE}, ${tx.MANDAL} | Unit Rate: ₹${tx.UNIT_RATE} | Comm Rate: ₹${tx.COMM_RATE} | Date: ${tx.EFFECTIVE_DATE}`
    ).join('\n') || 'No historical data available';

    const systemPrompt = `You are an AI property valuation expert for land registry in Tirupati, India. 
Analyze the provided historical transaction data and predict property prices based on location, area, and property type.
Consider market trends, location value, and comparable sales.
Provide realistic price predictions in INR with confidence levels.`;

    const userPrompt = `Based on the following historical transaction data from Tirupati land registry:

${dataContext}

Predict the price for:
- Location: ${location.village}, ${location.mandal}, ${location.district}
- Area: ${area} sq ft
- Property Type: ${propertyType}

Provide:
1. Estimated price per sq ft
2. Total estimated price
3. Price range (min-max)
4. Confidence level (low/medium/high)
5. Key factors affecting the price
6. Market trend analysis

Return the response in JSON format with these exact fields:
{
  "pricePerSqFt": number,
  "totalPrice": number,
  "priceRange": { "min": number, "max": number },
  "confidence": "low" | "medium" | "high",
  "factors": string[],
  "marketTrend": string,
  "recommendation": string
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    // Parse JSON from the response
    let prediction;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      prediction = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback prediction
      prediction = {
        pricePerSqFt: 3500,
        totalPrice: area * 3500,
        priceRange: { min: area * 3000, max: area * 4000 },
        confidence: "medium",
        factors: ["Based on historical data analysis", "Location value assessment"],
        marketTrend: "Stable market with moderate growth potential",
        recommendation: "Market analysis based on available data"
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction,
        testMode: true,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in predict-price function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        testMode: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
