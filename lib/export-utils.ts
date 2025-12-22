import domtoimage from 'dom-to-image';
import type { NutritionScan } from '../types/types';
import { createShareCardElement } from './carddesign-utils';

export async function exportHistoryToExcel(scans: NutritionScan[]) {
  if (scans.length === 0) return;

  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Nutrition History');

  // Define columns explicitly
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 18 },
    { header: 'Food Items', key: 'foodItems', width: 25 },
    { header: 'Calories', key: 'calories', width: 12 },
    { header: 'Protein', key: 'protein', width: 12 },
    { header: 'Fat', key: 'fat', width: 12 },
    { header: 'Carbs', key: 'carbs', width: 12 },
    { header: 'Sodium', key: 'sodium', width: 12 },
    { header: 'Fiber', key: 'fiber', width: 12 },
    { header: 'Kategori Sekolah', key: 'category', width: 18 },
    { header: 'Status Nutrisi', key: 'notes', width: 30 },
  ];

  // Style header
  worksheet.getRow(1).font = { bold: true };

  // Add data rows
  scans.forEach((scan) => {
    worksheet.addRow({
      date: new Date(scan.scan_date).toLocaleString(),
      foodItems: scan.menu_items.map((item) => item.nama_menu).join(', '),
      calories: scan.nutrition_facts.nutrition_summary.calories_kcal,
      protein: scan.nutrition_facts.nutrition_summary.protein_g,
      fat: scan.nutrition_facts.nutrition_summary.fat_g,
      carbs: scan.nutrition_facts.nutrition_summary.carbs_g,
      sodium: scan.nutrition_facts.nutrition_summary.sodium_mg,
      fiber: scan.nutrition_facts.nutrition_summary.fiber_g,
      category: scan.school_category,
      notes: scan.nutrition_facts.summary_evaluation
        ? `${scan.nutrition_facts.summary_evaluation.status} - ${scan.nutrition_facts.summary_evaluation.reason}`
        : 'No evaluation found',
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `nutrition-history-${
    new Date().toISOString().split('T')[0]
  }.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function generateShareCard(scan: NutritionScan): Promise<string> {
  try {
    await document.fonts.ready;

    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '-9999',
    });

    const card = createShareCardElement(scan);
    wrapper.appendChild(card);
    document.body.appendChild(wrapper);

    const dataUrl = await domtoimage.toPng(card, {
      width: 1080,
      height: 1540,
      style: { transform: 'scale(1)', transformOrigin: 'top left' },
    });

    document.body.removeChild(wrapper);
    return dataUrl;
  } catch (error) {
    console.error('Share card generation failed:', error);
    throw new Error('Failed to generate share card');
  }
}

// Share via Web Share API or fallback
// export async function shareNutritionScan(scan: NutritionScan) {
//   const shareData = {
//     title: 'My Nutrition Analysis',
//     text: `I analyzed my meal and found ${scan.nutrition_facts.nutrition_summary.calories_kcal} calories! Check out the detailed breakdown.`,
//     url: window.location.href,
//   };

//   if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
//     try {
//       await navigator.share(shareData);
//       return true;
//     } catch (error) {
//       if ((error as Error).name !== 'AbortError') {
//         console.error('Share failed:', error);
//       }
//       return false;
//     }
//   } else {
//     // Fallback: copy to clipboard
//     try {
//       const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
//       await navigator.clipboard.writeText(shareText);
//       return 'clipboard';
//     } catch (error) {
//       console.error('Clipboard copy failed:', error);
//       return false;
//     }
//   }
// }
