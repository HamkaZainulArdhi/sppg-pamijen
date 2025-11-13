import type { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MenuItemDetection, NutritionAnalysis } from '@/types/types';

const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!googleApiKey) {
  throw new Error('Google API key is not defined in environment variables');
}
const genAI = new GoogleGenerativeAI(googleApiKey);
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
// list model yg work
// 1. gemini-2.5-flash-preview-05-20 // ini kadang ra bisa
// 2. gemini-2.0-flash-001
// 3. gemini-2.5-flash-preview-09-2025
//4. gemini-2.5-flash-lite // sering halu
const texterror =
  'Analisis nutrisi gagal dilakukan. unggah foto lain dan pastikan semua makanan dengan terlihat jelas dan batasan deteksi 50X request perhari.';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Step 1: Food Detection using Gemini Vision
    console.log('[v0] Starting food detection with Gemini Vision');
    const menuItems = await detectFoodItems(imageUrl);
    console.log('[v0] Detected menu items:', menuItems);

    // Step 2: Nutrition Analysis using Gemini Text
    console.log('[v0] Starting nutrition analysis');
    const nutritionFacts = await analyzeNutrition(menuItems);
    console.log('[v0] Nutrition analysis complete:', nutritionFacts);

    // Step 3: Save to Supabase
    // console.log('[v0] Saving to database');
    // const supabase = await createClient();
    // const { data, error } = await supabase
    //   .from('nutrition_scans')
    //   .insert({
    //     image_url: imageUrl,
    //     menu_items: menuItems,
    //     nutrition_facts: nutritionFacts,
    //   })
    //   .select()
    //   .single();

    // if (error) {
    //   console.error('[v0] Database error:', error);
    //   throw new Error(`Database error: ${error.message}`);
    // }

    // console.log('[v0] Successfully saved scan result');

    const scanResult = {
      image_url: imageUrl,
      scan_date: new Date().toISOString(),
      menu_items: menuItems,
      nutrition_facts: nutritionFacts,
    };

    return Response.json(scanResult);
  } catch (error) {
    console.error('[v0] API error:', error);
    let message = 'Analysis failed';
    if (error instanceof Error) {
      message = error.message;

      // Tangkap error Gemini overload (503)
      if (message.includes('429')) {
        message =
          'Layanan sedang sibuk karena terlalu banyak request. Mohon tunggu beberapa saat dan pastikan yang diupload adalah foto menu makanan.';
      }
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

async function detectFoodItems(imageUrl: string): Promise<MenuItemDetection[]> {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL, // model: gemini-2.5-flash-preview-05-20,
  });

  const prompt = `You are a food detection expert. Analyze this meal photo and identify visible food items with estimated portion sizes.

Task: Identify all visible food items and estimate their weight in grams.

Output format: Return ONLY a valid JSON array with this exact structure:
[
  {
    "nama_menu": "Food name in Indonesian",
    "estimasi_gram": number,
    "deskripsi": "description of the food item, make it as detailed as possible with a maximum of 100 words",
    "proses_pengolahan": "description of how the food appears to be prepared, make it as detailed as possible with a maximum of 100 words"
  }
]

Important:
- Be accurate with portion size estimates
- Use Indonesian names for food items
- Include all visible food items
- Return only the JSON array, no other text
- all of output content must be in bahasa Indonesia dont use english`;

  try {
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in vision response');
    }

    const menuItems = JSON.parse(jsonMatch[0]);
    return menuItems;
  } catch (error) {
    console.error('[v0] Food detection error:', error);
    throw new Error(texterror);
  }
}

async function analyzeNutrition(
  menuItems: MenuItemDetection[],
): Promise<NutritionAnalysis> {
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL, // model: gemini-2.5-flash-preview-05-20,
  });

  const prompt = `You are a nutrition analysis assistant. Calculate detailed nutritional information for the following food items.

Input: ${JSON.stringify(menuItems)}

Task: Calculate calories, protein, fat, carbs, sodium, and fiber for each item and provide a total summary.

Output format: Return ONLY a valid JSON object with this exact structure:
{
  "nutrition_summary": {
    "calories_kcal": number,
    "protein_g": number,
    "fat_g": number,
    "carbs_g": number,
    "sodium_mg": number,
    "fiber_g": number
  },
  "items": [
    {
      "name": "Food name in Indonesian Language",
      "grams": number,
      "calories_kcal": number,
      "protein_g": number,
      "fat_g": number,
      "carbs_g": number,
      "sodium_mg": number,
      "fiber_g": number
    }
  ]
}

Important:
- Use accurate nutritional data based on standard food databases
- Convert Indonesian food names to English for the items array
- Ensure all numbers are realistic and properly calculated
- The summary should be the sum of all individual items
- Return only the JSON object like this, no other text
- All output must be a JSON object where all keys are strictly in English like my JSON above  (no Bahasa Indonesia allowed in keys), 
and all values must be written only in Bahasa Indonesia (no English allowed in values)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in nutrition response');
    }

    const nutritionAnalysis = JSON.parse(jsonMatch[0]);
    return nutritionAnalysis;
  } catch (error) {
    console.error('[v0] Nutrition analysis error:', error);
    console.error(
      `response text: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    throw new Error(texterror);
  }
}
