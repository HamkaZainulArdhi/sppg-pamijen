'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NutritionAnalysis } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PublicNutritionScan = {
  id: string;
  image_url: string;
  scan_date: string;
  nutrition_facts: NutritionAnalysis;
  school_category?: string | null;
};

interface MenuDetailModalProps {
  menuItem: PublicNutritionScan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuDetailModal({
  menuItem,
  isOpen,
  onClose,
}: MenuDetailModalProps) {
  if (!isOpen || !menuItem) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        <Card className="relative w-full border shadow-lg overflow-hidden">
          {/* Close Button */}
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Image */}
          <img
            src={menuItem.image_url}
            alt="Menu makanan"
            className="w-full h-[180px] object-cover"
          />

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Menu Name */}
            <h3 className="font-semibold text-base text-foreground line-clamp-2">
              {menuItem.nutrition_facts.items.map((i) => i.name).join(', ') ||
                'Menu Tidak Terdeteksi'}
            </h3>

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              <strong>Tanggal:</strong>{' '}
              {new Date(menuItem.scan_date).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>

            {/* Nutrition Summary */}
            <div>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                Ringkasan Gizi
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(menuItem.nutrition_facts.nutrition_summary).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-muted/10 rounded-md px-2 py-1.5 border border-border/50"
                    >
                      <div className="text-[10px] font-medium text-muted-foreground uppercase">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {value}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
