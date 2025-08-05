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

interface GenerateDescriptionRequest {
  input1: string;
  input2: string;
}

// Rate limiting - simple in-memory store (consider Redis for production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15;

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

    // Parse and validate request body
    const body = await request.json() as GenerateDescriptionRequest;
    
    if (!body.input1 || !body.input2) {
      return NextResponse.json(
        { error: 'Both input1 and input2 are required' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (body.input1.length > 100 || body.input2.length > 100) {
      return NextResponse.json(
        { error: 'Input items must be less than 100 characters each' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedInput1 = body.input1.trim().replace(/[<>]/g, '');
    const sanitizedInput2 = body.input2.trim().replace(/[<>]/g, '');

    // Call Gemini API for description
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Write a short, creative, and engaging description for a fantastical object that is a fusion of a "${sanitizedInput1}" and a "${sanitizedInput2}".`;
    
    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    const result = await fetchWithExponentialBackoff(apiUrl, payload) as GeminiTextResponse;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      return NextResponse.json({
        success: true,
        description: text.trim()
      });
    } else {
      throw new Error("Could not generate a description.");
    }

  } catch (error: unknown) {
    console.error('Description generation error:', error instanceof Error ? error.message : error);
    
    return NextResponse.json(
      { error: 'Failed to generate description. Please try again.' },
      { status: 500 }
    );
  }
}