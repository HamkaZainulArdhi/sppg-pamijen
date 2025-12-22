import { NextResponse, type NextRequest } from 'next/server';
import type { NutritionScan } from '@/types/types';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scanData: NutritionScan & { user_id: string } = await request.json();

    // Validasi school_category harus ada
    if (!scanData.school_category) {
      return NextResponse.json(
        { error: 'School category is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('nutrition_scans')
      .insert({
        user_id: user.id,
        image_url: scanData.image_url,
        menu_items: scanData.menu_items,
        nutrition_facts: scanData.nutrition_facts,
        scan_date: scanData.scan_date,
        school_category: scanData.school_category,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save scan' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Save scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
