'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { NutritionAnalysis } from '@/types/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContentLoader } from '../../../components/common/content-loader';
import { CustomBadge } from '../../../components/custom/badge';
import { CustomSubtitle } from '../../../components/custom/subtitle';
import { CustomTitle } from '../../../components/custom/title';
import { MenuDetailModal } from './modal';

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

type DailyMenuMap = Map<string, PublicNutritionScan>;

type CalendarDay = {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Monday, 6=Sunday
  menuItem: PublicNutritionScan | null;
  isCurrentMonth: boolean;
};

type CalendarWeek = CalendarDay[];

interface RekapMenuProps {
  scans: PublicNutritionScan[];
  loading: boolean;
}

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Transform flat daily scans into date-keyed map
 * O(n) complexity, runs once per data change
 */
function buildDailyMenuMap(scans: PublicNutritionScan[]): DailyMenuMap {
  const map = new Map<string, PublicNutritionScan>();
  for (const scan of scans) {
    const dateKey = scan.scan_date.split('T')[0]; // YYYY-MM-DD
    if (!map.has(dateKey)) {
      map.set(dateKey, scan);
    }
  }
  return map;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateMonthCalendar(
  year: number,
  month: number,
  menuMap: DailyMenuMap,
): CalendarWeek[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const weeks: CalendarWeek[] = [];

  let currentWeek: CalendarDay[] = [];

  // Pad week start (Monday = 0)
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startPadding; i++) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(prevDate.getDate() - (startPadding - i));
    currentWeek.push({
      date: formatDate(prevDate),
      dayOfWeek: i,
      menuItem: menuMap.get(formatDate(prevDate)) || null,
      isCurrentMonth: false,
    });
  }

  // Days in current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = formatDate(date);

    currentWeek.push({
      date: dateStr,
      dayOfWeek: currentWeek.length % 7,
      menuItem: menuMap.get(dateStr) || null,
      isCurrentMonth: true,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad week end
  let dayCounter = 1;
  while (currentWeek.length < 7) {
    const nextDate = new Date(lastDay);
    nextDate.setDate(nextDate.getDate() + dayCounter);
    currentWeek.push({
      date: formatDate(nextDate),
      dayOfWeek: currentWeek.length % 7,
      menuItem: null,
      isCurrentMonth: false,
    });
    dayCounter++;
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return weeks;
}

/**
 * Memoized day cell to prevent unnecessary re-renders
 */
const DayCell = memo(
  ({
    day,
    onMenuClick,
  }: {
    day: CalendarDay;
    onMenuClick: (item: PublicNutritionScan) => void;
  }) => {
    const dayNum = parseInt(day.date.split('-')[2], 10);

    return (
      <div
        onClick={() => day.menuItem && onMenuClick(day.menuItem)}
        className={`aspect-square border rounded-lg p-2 flex flex-col gap-1 transition-colors cursor-pointer ${
          day.isCurrentMonth
            ? 'bg-white  hover:bg-slate-50 dark:bg-black/10 dark:hover:bg-neutral-800/20'
            : 'bg-muted/30 opacity-50'
        } ${day.menuItem && day.isCurrentMonth ? 'hover:shadow-md hover:border-primary' : ''}`}
      >
        {/* Day number */}
        <div className="text-xs font-semibold text-foreground">
          {day.isCurrentMonth ? dayNum : ''}
        </div>

        {/* Menu thumbnail */}
        {day.menuItem ? (
          <div className="flex-1 relative rounded overflow-hidden bg-slate-100 dark:bg-neutral-700">
            <img
              src={day.menuItem.image_url}
              alt="Menu"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex-1 rounded bg-slate-100 dark:bg-neutral-900 flex items-center justify-center">
            <span className="text-xs text-muted-foreground">....</span>
          </div>
        )}

        {/* Menu name */}
        {day.menuItem && (
          <div className="text-xs line-clamp-2 text-foreground font-medium leading-tight">
            {day.menuItem.nutrition_facts.items
              .map((i) => i.name)
              .slice(0, 2)
              .join(', ') || 'Menu'}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    // Only re-render if date or menuItem changes
    return (
      prev.day.date === next.day.date &&
      prev.day.menuItem?.id === next.day.menuItem?.id &&
      prev.onMenuClick === next.onMenuClick
    );
  },
);

DayCell.displayName = 'DayCell';

export function RekapMenu({ scans, loading }: RekapMenuProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedMenu, setSelectedMenu] = useState<PublicNutritionScan | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize menu map (recalc only on scans change)
  const menuMap = useMemo(() => buildDailyMenuMap(scans), [scans]);

  // Memoize calendar weeks (recalc only on year/month/menuMap change)
  const calendarWeeks = useMemo(
    () => generateMonthCalendar(year, month, menuMap),
    [year, month, menuMap],
  );

  // Memoize month change handler
  const handleMonthChange = useCallback((newMonth: string) => {
    setMonth(parseInt(newMonth, 10));
  }, []);

  const handleYearChange = useCallback((newYear: string) => {
    setYear(parseInt(newYear, 10));
  }, []);

  // Handle menu click to open modal
  const handleMenuClick = useCallback((menuItem: PublicNutritionScan) => {
    setSelectedMenu(menuItem);
    setIsModalOpen(true);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  }, []);

  return (
    <section id="rekap-menu" className="py-2 mb-7 relative px-6">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-5"
        >
          <CustomBadge>Rekap Bulanan</CustomBadge>

          <CustomTitle>
            Menu Kita
            <span className="text-primary"> Sebulan </span>
            Ini
          </CustomTitle>

          <CustomSubtitle>
            Lihat seluruh menu dalam satu bulan secara lengkap
          </CustomSubtitle>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {loading ? (
          <div className="text-center text-sm text-muted-foreground">
            <ContentLoader />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month/Year Selector */}
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              {/* Month Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Bulan
                </label>
                <Select value={String(month)} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((monthName, idx) => (
                      <SelectItem key={monthName} value={String(idx + 1)}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-foreground">
                  Tahun
                </label>
                <Select value={String(year)} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 5 },
                      (_, i) => now.getFullYear() - 2 + i,
                    ).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-2">
                  {week.map((day) => (
                    <DayCell
                      key={day.date}
                      day={day}
                      onMenuClick={handleMenuClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Menu Detail Modal */}
      <MenuDetailModal
        menuItem={selectedMenu}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}
