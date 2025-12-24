'use client';

import { useEffect, useState } from 'react';
import { NutritionAnalysis } from '@/types/types';
import { supabasePublic } from '@/lib/supabase/public-client';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import { RekapMenu } from '@/app/menu-rekap/components/rekapmenu';

/**
 * 🔒 Type KHUSUS landing page (public, read-only)
 */
type PublicNutritionScan = {
  id: string;
  image_url: string;
  scan_date: string;
  nutrition_facts: NutritionAnalysis;
  school_category?: string | null;
};

export default function MenuRekapPage() {
  const [scans, setScans] = useState<PublicNutritionScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicScans = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabasePublic
          .from('nutrition_scans')
          .select('id, image_url, scan_date, nutrition_facts, school_category')
          .order('scan_date', { ascending: false })
          .limit(50);

        if (error) throw error;

        const parsed: PublicNutritionScan[] = (data || []).map((item) => {
          const emptySummary = {
            calories_kcal: 0,
            protein_g: 0,
            fat_g: 0,
            carbs_g: 0,
            sodium_mg: 0,
            fiber_g: 0,
          };

          let facts: NutritionAnalysis = {
            items: [],
            nutrition_summary: emptySummary,
          };

          if (typeof item.nutrition_facts === 'string') {
            try {
              facts = JSON.parse(item.nutrition_facts);
            } catch {
              facts = {
                items: [],
                nutrition_summary: emptySummary,
              };
            }
          } else if (item.nutrition_facts) {
            facts = item.nutrition_facts;
          }

          return {
            id: item.id,
            image_url: item.image_url,
            scan_date: item.scan_date,
            school_category: item.school_category ?? null,
            nutrition_facts: facts,
          };
        });

        setScans(parsed);
      } catch (err) {
        console.error('Gagal memuat data menu rekap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicScans();
  }, []);

  return (
    <div id="Menu-Rekap" className="min-h-screen mt-24 w-full">
      <Header />
      <div className="py-8">
        <RekapMenu scans={scans} loading={loading} />
      </div>
      <Footer />
    </div>
  );
}
