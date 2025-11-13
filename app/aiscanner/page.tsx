'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan } from 'lucide-react';
import type { NutritionScan } from '@/types/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import { ImageUpload, NutritionResults } from './components';

type ViewState = 'upload' | 'review' | 'results';

export default function AIscanner() {
  const [currentScan, setCurrentScan] = useState<NutritionScan | null>(null);
  const [viewState, setViewState] = useState<ViewState>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadKey, setImageUploadKey] = useState(0);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);

  const handleImageUploaded = async (imageUrl: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menganalisis gambar');
      }

      const scanResult: NutritionScan = data;
      setCurrentScan(scanResult);
      setViewState('results');
      setAnalysisDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menganalisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNewScan = () => {
    setCurrentScan(null);
    setViewState('upload');
    setError(null);
  };

  return (
    <div className="bg-background h-full mt-24 w-full ">
      <Header />
      <main className="container mx-auto h-full">
        {viewState === 'upload' && (
          <div className="max-w-4xl mx-auto px-4  min-h-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Analisis Gizi Menu MBG
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unggah foto menu untuk mendapatkan analisis nutrisi terperinci
                didukung oleh YOLO dan LLM gemini AI model.
              </p>
            </div>

            <div className="flex-1 w-full ">
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                key={imageUploadKey}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {error && (
              <Card className="border-destructive/20 bg-destructive/5 mt-10">
                <CardContent className="p-4">
                  <p className="text-destructive text-center">{error}</p>
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError(null);
                        setImageUploadKey((k) => k + 1);
                      }}
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <AlertDialog
          open={analysisDialogOpen}
          onOpenChange={setAnalysisDialogOpen}
        >
          <AlertDialogContent className="flex flex-col items-center text-center gap-4 max-w-xs  rounded-lg ">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100"
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="rgb(34,197,94)"
                className="w-10 h-10"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.svg>
            </motion.div>

            <AlertDialogHeader className="text-center items-center  justify-center">
              <AlertDialogTitle>Analisis Selesai</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Analisis gambar selesai dan hasil gizi siap ditinjau. Apakah
                ingin melihat hasil sekarang?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="w-full">
              <AlertDialogAction
                onClick={() => {
                  setViewState('results');
                  setAnalysisDialogOpen(false);
                }}
                className="w-full"
              >
                Lihat Hasil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {viewState === 'results' && currentScan && (
          <div className="space-y-6 px-10">
            <div className="flex flex-col gap-4  sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  Hasil Analisis
                </h2>
                <p className="text-muted-foreground mt-1">
                  Berhasil menganalisis gambar menu Anda.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                <Button
                  onClick={startNewScan}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Scan className="mr-2 h-4 w-4" />
                  Analisis Menu Baru
                </Button>
              </div>
            </div>
            <NutritionResults scan={currentScan} />
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}
