import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frameDataUrl, timestamp, targetEmotion } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing frame at ${timestamp}s for emotion: ${targetEmotion}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert emotion detection AI. Analyze video frames to detect human emotions. 
            
Your task is to identify the dominant emotion visible in the image and provide a confidence score.

The emotions you can detect are:
- joy: happiness, smiling, laughter
- sadness: frowning, tears, downcast expression
- anger: furrowed brows, tense expression, aggressive posture
- fear: wide eyes, tense body, cowering
- surprise: raised eyebrows, open mouth, wide eyes
- disgust: nose wrinkle, lip curl, aversion expression
- neutral: calm, relaxed, no strong emotion

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{"emotion": "emotion_name", "confidence": 0.85, "detected": true}

If no clear human face or emotion is visible, respond with:
{"emotion": "neutral", "confidence": 0.5, "detected": false}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this video frame and detect the dominant emotion. I'm specifically looking for "${targetEmotion}" emotion, but report the actual emotion you detect.`
              },
              {
                type: "image_url",
                image_url: {
                  url: frameDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    // Parse the JSON response
    let result;
    try {
      // Clean the response (remove any markdown formatting if present)
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      result = { emotion: "neutral", confidence: 0.5, detected: false };
    }

    return new Response(JSON.stringify({
      timestamp,
      emotion: result.emotion,
      confidence: result.confidence,
      detected: result.detected,
      matchesTarget: result.emotion === targetEmotion && result.detected
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in detect-emotions function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
