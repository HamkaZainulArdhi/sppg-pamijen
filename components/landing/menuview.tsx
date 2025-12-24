'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NutritionAnalysis } from '@/types/types';
import { supabasePublic } from '@/lib/supabase/public-client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ContentLoader } from '../common/content-loader';
import { CustomBadge } from '../custom/badge';
import { CustomSubtitle } from '../custom/subtitle';
import { CustomTitle } from '../custom/title';

/**
 * 🔒 Type KHUSUS landing page (public, read-only)
 * Jangan pakai type dashboard / user
 */
type PublicNutritionScan = {
  id: string;
  image_url: string;
  scan_date: string;
  nutrition_facts: NutritionAnalysis;
  school_category?: string | null;
};

type CategoryItem = {
  key: string;
  label: string;
};

export function MenuView() {
  const [scans, setScans] = useState<PublicNutritionScan[]>([]);
  const [loading, setLoading] = useState(true);
  const ease = [0.16, 1, 0.3, 1] as const;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const filtered = (scans || []).filter((item) => {
    const itemDate = new Date(item.scan_date).toISOString().split('T')[0];
    return itemDate === todayStr;
  });

  // Define school categories
  const categories: CategoryItem[] = [
    { key: 'TK', label: 'TK/PAUD' },
    { key: 'SD_1_3', label: 'SD kelas 1-3' },
    { key: 'SD_4_5', label: 'SD kelas 4-5' },
    { key: 'SMP', label: 'SMP/MTS' },
    { key: 'SMA', label: 'SMA/SMK/MA' },
  ];

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
        console.error('Gagal memuat data menu publik:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicScans();
  }, []);

  // Efficiently pick latest scans per category (today's data only)
  const latestByCategory = (() => {
    const map = new Map<string, PublicNutritionScan>();
    // Use 'filtered' (today's data only) to get latest per category from today
    for (const scan of filtered) {
      const cat = scan.school_category ?? '';
      if (!cat || map.has(cat)) continue;
      if (categories.some((c) => c.key === cat)) {
        map.set(cat, scan);
      }
      if (map.size === categories.length) break;
    }
    return categories.map((c) => ({
      ...c,
      item: map.get(c.key) || null,
    }));
  })();

  const pop = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease },
    },
  };

  const getTodayLabel = () => {
    const now = new Date();

    return now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section id="menu" className="py-2 mb-7 relative">
      {/* Decorative */}
      <motion.div
        variants={pop}
        className="absolute bottom-0 left-0 -z-1 top-2"
      >
        <Image
          src="/media/benner/beside.png"
          alt=""
          width={426}
          height={851}
          className="h-auto w-24 md:w-36 lg:w-48 [transform:scaleY(-1)]"
        />
      </motion.div>

      <motion.div
        variants={pop}
        className="absolute bottom-0 right-0 -z-1 top-2"
      >
        <Image
          src="/media/benner/beside.png"
          alt=""
          width={426}
          height={851}
          className="h-auto w-24 md:w-36 lg:w-48 [transform:scale(-1,-1)]"
        />
      </motion.div>

      {/* Header */}
      <div className="text-center mb-4 mt-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-5 mb-5"
        >
          {/* <CustomBadge>Menu Kita</CustomBadge> */}

          <CustomTitle>
            Cek
            <span className="text-primary"> Menu Kita </span>
            Hari ini
          </CustomTitle>

          <CustomBadge className="font-semibold text-yellow-600 bg-amber-100">
            {getTodayLabel()}
          </CustomBadge>

          <CustomSubtitle>
            Orang tua dapat melihat menu dan informasi gizi secara transparan di
            SPPG Pamijen Kec. Sokaraja Kab. Banyumas .
          </CustomSubtitle>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="px-6"
      >
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">
            <ContentLoader />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top row - 3 cards */}
            <div className="flex flex-wrap justify-center gap-4">
              {latestByCategory.slice(0, 3).map((cat) => (
                <Card
                  key={cat.key}
                  className="border h-full max-w-[313px] w-full sm:w-[calc(33.333%-11px)]"
                >
                  <CardHeader className="text-center">
                    <Badge className="mx-auto w-fit">{cat.label}</Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {!cat.item ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Data menu belum tersedia.
                      </p>
                    ) : (
                      <Card className="w-full">
                        <img
                          src={cat.item.image_url}
                          alt="Menu makanan"
                          className="w-full h-[150px] object-cover rounded-t-xl"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                            {cat.item.nutrition_facts.items
                              .map((i) => i.name)
                              .join(', ') || 'Menu Tidak Terdeteksi'}
                          </h3>

                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Dibuat pada: </strong>
                            {new Date(cat.item.scan_date).toLocaleString(
                              'id-ID',
                              { dateStyle: 'medium', timeStyle: 'short' },
                            )}
                          </p>

                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(
                              cat.item.nutrition_facts.nutrition_summary,
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="bg-muted/5 rounded px-2 py-1"
                              >
                                <div className="text-xs font-medium text-foreground">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bottom row - 2 cards centered */}
            <div className="flex flex-wrap justify-center gap-4">
              {latestByCategory.slice(3).map((cat) => (
                <Card
                  key={cat.key}
                  className="border h-full max-w-[313px] w-full sm:w-[calc(50%-8px)]"
                >
                  <CardHeader className="text-center">
                    <Badge className="mx-auto w-fit">{cat.label}</Badge>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {!cat.item ? (
                      <p className="text-sm text-muted-foreground text-center">
                        Data menu belum tersedia.
                      </p>
                    ) : (
                      <Card className="w-full">
                        <img
                          src={cat.item.image_url}
                          alt="Menu makanan"
                          className="w-full h-[150px] object-cover rounded-t-xl"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                            {cat.item.nutrition_facts.items
                              .map((i) => i.name)
                              .join(', ') || 'Menu Tidak Terdeteksi'}
                          </h3>

                          <p className="text-xs text-muted-foreground mb-2">
                            <strong>Dibuat pada: </strong>
                            {new Date(cat.item.scan_date).toLocaleString(
                              'id-ID',
                              { dateStyle: 'medium', timeStyle: 'short' },
                            )}
                          </p>

                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(
                              cat.item.nutrition_facts.nutrition_summary,
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="bg-muted/5 rounded px-2 py-1"
                              >
                                <div className="text-xs font-medium text-foreground">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
