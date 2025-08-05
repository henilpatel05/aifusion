import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiTextResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

interface ApiResponse {
  [key: string]: unknown;
}

// Rate limiting - simple in-memory store (consider Redis for production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // Higher limit for suggestions as they're cheaper

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const clientData = requestCounts.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  clientData.count++;
  return false;
}

async function fetchWithExponentialBackoff(url: string, payload: object, maxRetries: number = 5): Promise<ApiResponse> {
  let attempt = 0;
  let delay = 1000;
  
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 429 || response.status >= 500) {
        console.warn(`API call failed with status ${response.status}. Retrying in ${delay / 1000}s...`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (attempt >= maxRetries - 1) throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    delay *= 2;
    attempt++;
  }
  
  throw new Error('API request failed after multiple retries.');
}

export async function POST(request: NextRequest) {
  try {
    // Check API key configuration
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Call Gemini API for suggestions
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = "Generate two creative and contrasting items that could be fused together. Provide the response as a JSON object with keys 'item1' and 'item2'.";
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "item1": { "type": "STRING" },
            "item2": { "type": "STRING" }
          },
          required: ["item1", "item2"]
        }
      }
    };

    const result = await fetchWithExponentialBackoff(apiUrl, payload) as GeminiTextResponse;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      const suggestion = JSON.parse(text);
      
      // Validate the response structure
      if (suggestion.item1 && suggestion.item2) {
        return NextResponse.json({
          success: true,
          item1: suggestion.item1,
          item2: suggestion.item2
        });
      } else {
        throw new Error("Invalid suggestion format received");
      }
    } else {
      throw new Error("Could not parse suggestion from API response.");
    }

  } catch (error: unknown) {
    console.error('Suggestion generation error:', error instanceof Error ? error.message : error);
    
    return NextResponse.json(
      { error: 'Failed to generate suggestions. Please try again.' },
      { status: 500 }
    );
  }
}