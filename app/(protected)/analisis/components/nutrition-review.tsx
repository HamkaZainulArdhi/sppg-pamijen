'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, Edit3, Save, Scale, X } from 'lucide-react';
import type { NutritionScan } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

interface NutritionReviewProps {
  scan: NutritionScan;
  onSave: (editedScan: NutritionScan) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function NutritionReview({
  scan,
  onSave,
  onCancel,
  isSaving = false,
}: NutritionReviewProps) {
  const [editedScan, setEditedScan] = useState<NutritionScan>(scan);
  const { image_url, menu_items, nutrition_facts, scan_date } = editedScan;
  const { nutrition_summary, items } = nutrition_facts;

  const dailyValues = {
    calories: Math.round((nutrition_summary.calories_kcal / 2000) * 100),
    protein: Math.round((nutrition_summary.protein_g / 50) * 100),
    fat: Math.round((nutrition_summary.fat_g / 65) * 100),
    carbs: Math.round((nutrition_summary.carbs_g / 300) * 100),
    sodium: Math.round((nutrition_summary.sodium_mg / 2300) * 100),
    fiber: Math.round((nutrition_summary.fiber_g / 25) * 100),
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SCHOOL_CATEGORIES = [
    { label: 'TK/PAUD', value: 'TK' },
    { label: 'SD Kelas 1–3', value: 'SD_1_3' },
    { label: 'SD Kelas 4–5', value: 'SD_4_5' },
    { label: 'SMP/MTS', value: 'SMP' },
    { label: 'SMA/SMK/MA', value: 'SMA' },
  ];

  const updateMenuItem = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updatedMenuItems = [...editedScan.menu_items];
    updatedMenuItems[index] = {
      ...updatedMenuItems[index],
      [field]: value,
    };

    setEditedScan({
      ...editedScan,
      menu_items: updatedMenuItems,
    });
  };

  const updateNutritionItem = (index: number, field: string, value: number) => {
    const updatedItems = [...editedScan.nutrition_facts.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    const newSummary = updatedItems.reduce(
      (acc, item) => ({
        calories_kcal: acc.calories_kcal + item.calories_kcal,
        protein_g: acc.protein_g + item.protein_g,
        fat_g: acc.fat_g + item.fat_g,
        carbs_g: acc.carbs_g + item.carbs_g,
        sodium_mg: acc.sodium_mg + item.sodium_mg,
        fiber_g: acc.fiber_g + item.fiber_g,
      }),
      {
        calories_kcal: 0,
        protein_g: 0,
        fat_g: 0,
        carbs_g: 0,
        sodium_mg: 0,
        fiber_g: 0,
      },
    );

    setEditedScan({
      ...editedScan,
      nutrition_facts: {
        ...editedScan.nutrition_facts,
        items: updatedItems,
        nutrition_summary: newSummary,
      },
    });
  };

  const handleSave = () => {
    if (!editedScan.school_category) {
      alert('Pilih kategori sekolah dulu!');
      return;
    }
    onSave(editedScan);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Judul dan deskripsi */}
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-foreground">
            Review & Edit Analysis
          </h2>
          <p className="text-muted-foreground">
            Tinjau analisis AI dan lakukan koreksi yang diperlukan sebelum
            menyimpan.
          </p>
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save to History
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mx-4">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          {/* Image Card */}
          <Card>
            <CardContent className="p-4">
              <img
                src={image_url || '/placeholder.svg'}
                alt="Analyzed food"
                className="w-full h-auto object-cover rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Info Card - STICKY */}
          <div className="lg:h-fit lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Informasi Analisis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tanggal Scan</p>
                  <p className="font-medium">{formatDate(scan_date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Makanan Terdeteksi
                  </p>
                  <p className="font-medium">{menu_items.length} food items</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pilih Kategori Sekolah
                  </p>

                  <div className="flex flex-col gap-2">
                    {SCHOOL_CATEGORIES.map((item) => (
                      <label
                        key={item.value}
                        className="flex items-center  gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="school_category"
                          value={item.value}
                          checked={editedScan.school_category === item.value}
                          onChange={(e) =>
                            setEditedScan({
                              ...editedScan,
                              school_category: e.target.value,
                            })
                          }
                          className="accent-primary"
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Klik data di kanan untuk mengedit hasil analisis
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN - SCROLLABLE */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nutrisi Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nutrisi yang dihasilkan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Calories */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.calories_kcal)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Calories
                  </div>
                  <Progress
                    value={Math.min(dailyValues.calories, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.calories}% Nilai Harian
                  </div>
                </div>

                {/* Protein */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.protein_g)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Protein
                  </div>
                  <Progress
                    value={Math.min(dailyValues.protein, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.protein}% Nilai Harian
                  </div>
                </div>

                {/* Fat */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.fat_g)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Fat</div>
                  <Progress
                    value={Math.min(dailyValues.fat, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.fat}% Nilai Harian
                  </div>
                </div>

                {/* Carbs */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.carbs_g)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Carbs
                  </div>
                  <Progress
                    value={Math.min(dailyValues.carbs, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.carbs}% Nilai Harian
                  </div>
                </div>

                {/* Sodium */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.sodium_mg)}mg
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Sodium
                  </div>
                  <Progress
                    value={Math.min(dailyValues.sodium, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.sodium}% Nilai Harian
                  </div>
                </div>

                {/* Fiber */}
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-primary">
                    {Math.round(nutrition_summary.fiber_g)}g
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Fiber
                  </div>
                  <Progress
                    value={Math.min(dailyValues.fiber, 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {dailyValues.fiber}% Nilai Harian
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Card */}
          {nutrition_facts.summary_evaluation && (
            <Card
              className={
                nutrition_facts.summary_evaluation.status === 'Layak'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                  : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
              }
            >
              <CardHeader>
                <CardTitle
                  className={
                    nutrition_facts.summary_evaluation.status === 'Layak'
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }
                >
                  {nutrition_facts.summary_evaluation.status === 'Layak'
                    ? '✓ Makanan Layak Dikonsumsi'
                    : '⚠ Makanan Tidak Seimbang'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">Analisis:</p>
                  <p className="text-sm text-foreground">
                    {nutrition_facts.summary_evaluation.reason}
                  </p>
                </div>
                {nutrition_facts.summary_evaluation.recommendation && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Rekomendasi:</p>
                    <p className="text-sm text-foreground">
                      {nutrition_facts.summary_evaluation.recommendation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Makanan Terdeteksi Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Makanan Terdeteksi
                <Badge variant="primary" className="ml-2">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Bisa Diedit
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {menu_items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor={`name-${index}`}
                            className="text-sm font-medium"
                          >
                            Nama Makanan
                          </Label>
                          <Input
                            id={`name-${index}`}
                            value={item.nama_menu}
                            onChange={(e) =>
                              updateMenuItem(index, 'nama_menu', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`weight-${index}`}
                            className="text-sm font-medium"
                          >
                            Estimasi Berat (grams)
                          </Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            value={item.estimasi_gram}
                            onChange={(e) =>
                              updateMenuItem(
                                index,
                                'estimasi_gram',
                                Number.parseInt(e.target.value) || 0,
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor={`description-${index}`}
                          className="text-sm font-medium"
                        >
                          Deskripsi
                        </Label>
                        <Textarea
                          id={`description-${index}`}
                          value={item.deskripsi}
                          onChange={(e) =>
                            updateMenuItem(index, 'deskripsi', e.target.value)
                          }
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`preparation-${index}`}
                          className="text-sm font-medium"
                        >
                          Proses Pengolahan
                        </Label>
                        <Input
                          id={`preparation-${index}`}
                          value={item.proses_pengolahan}
                          onChange={(e) =>
                            updateMenuItem(
                              index,
                              'proses_pengolahan',
                              e.target.value,
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detail Nutrisi Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Detail Nutrisi Yang Terdeteksi
                <Badge variant="primary" className="ml-2">
                  <Edit3 className="w-3 h-3 mr-1" />
                  Bisa Diedit
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge variant="outline">{item.grams}g</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Calories
                        </Label>
                        <Input
                          type="number"
                          value={item.calories_kcal}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'calories_kcal',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Protein (g)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.protein_g}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'protein_g',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Fat (g)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.fat_g}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'fat_g',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Carbs (g)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.carbs_g}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'carbs_g',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Sodium (mg)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.sodium_mg}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'sodium_mg',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Fiber (g)
                        </Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={item.fiber_g}
                          onChange={(e) =>
                            updateNutritionItem(
                              index,
                              'fiber_g',
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="mt-1 h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
