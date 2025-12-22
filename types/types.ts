import { Profile, Sppg } from './profil.type';

export interface MenuItemDetection {
  nama_menu: string;
  estimasi_gram: number;
  deskripsi: string;
  proses_pengolahan: string;
}

export interface NutritionItem {
  name: string;
  grams: number;
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  sodium_mg: number;
  fiber_g: number;
}

export interface NutritionSummary {
  calories_kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  sodium_mg: number;
  fiber_g: number;
}

export interface SummaryEvaluation {
  status: 'Layak' | 'Tidak Layak';
  reason: string;
  recommendation: string | null;
}

export interface NutritionAnalysis {
  nutrition_summary: NutritionSummary;
  items: NutritionItem[];
  summary_evaluation?: SummaryEvaluation;
}

export interface NutritionScan {
  id: string;
  image_url: string;
  scan_date: string;
  menu_items: MenuItemDetection[];
  nutrition_facts: NutritionAnalysis;
  school_category: string;
  created_at: string;
  user_name?: string;
  profile?: Profile & { sppg?: Sppg };
}
