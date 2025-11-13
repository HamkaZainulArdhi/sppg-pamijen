import domtoimage from 'dom-to-image';
import type { NutritionScan } from '../types/types';
import { createShareCardElement } from './carddesign-utils';

export async function exportHistoryToExcel(scans: NutritionScan[]) {
  if (scans.length === 0) return;

  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Nutrition History');

  worksheet.addRow([
    'Date',
    'Food Items',
    'Calories',
    'Protein',
    'Fat',
    'Carbs',
    'Sodium',
    'Fiber',
  ]);

  scans.forEach((scan) => {
    worksheet.addRow([
      new Date(scan.scan_date).toLocaleString(),
      scan.menu_items.map((item) => item.nama_menu).join(', '),
      scan.nutrition_facts.nutrition_summary.calories_kcal,
      scan.nutrition_facts.nutrition_summary.protein_g,
      scan.nutrition_facts.nutrition_summary.fat_g,
      scan.nutrition_facts.nutrition_summary.carbs_g,
      scan.nutrition_facts.nutrition_summary.sodium_mg,
      scan.nutrition_facts.nutrition_summary.fiber_g,
    ]);
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach((column) => (column.width = 15));

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
