'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Eye, ImageIcon, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { NutritionScan } from '@/types/types';
import { useHistoryScans } from '@/hooks/use-history-scan';
import { useProfile } from '@/providers/profile-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ContentLoader } from '@/components/common/content-loader';
import { NutritionResults } from '../../analisis/components/nutrition-results';
import Nodata from './no-data';
import Stats from './stats';

interface HistoryTableProps {
  user: SupabaseUser;
}

// Constants

export function HistoryTable({ user }: HistoryTableProps) {
  const {
    scans,
    filteredScans,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    fetchScans,
    deleteScan,
    exportHistoryToExcel,
  } = useHistoryScans(user);

  const [selectedScan] = useState<NutritionScan | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const router = useRouter();
  const { profile } = useProfile();

  // Apply additional filters
  const additionalFiltered = filteredScans.filter((scan) => {
    // Status filter
    if (statusFilter) {
      const scanStatus = scan.nutrition_facts.summary_evaluation?.status || '';
      if (scanStatus !== statusFilter) return false;
    }

    // Category filter
    if (categoryFilter && scan.school_category !== categoryFilter) return false;

    // Month filter
    if (monthFilter) {
      const scanMonth = new Date(scan.scan_date).toISOString().slice(0, 7);
      if (scanMonth !== monthFilter) return false;
    }

    return true;
  });

  // Apply pagination to filtered data (6 items per page)
  const paginatedFilteredScans = additionalFiltered.slice(
    (page - 1) * 6,
    page * 6,
  );

  // Utils
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      TK: 'TK/PAUD',
      SD_1_3: 'SD Kelas 1–3',
      SD_4_5: 'SD Kelas 4–5',
      SMP: 'SMP/MTS',
      SMA: 'SMA/SMK/MA',
    };
    return categoryMap[category] || category;
  };

  const getScanSummary = (scan: NutritionScan) => ({
    itemCount: scan.menu_items.length,
    evaluationStatus:
      scan.nutrition_facts.summary_evaluation?.status || 'Unknown',
    allItems: scan.menu_items.map((i) => i.nama_menu).join(', '),
  });

  // Actions
  const handleShareCard = async (scan: NutritionScan) => {
    if (!profile) {
      toast.error('Profil belum dimuat, coba lagi nanti');
      return;
    }

    try {
      const { generateShareCard } = await import('@/lib/export-utils');
      const scanWithUserName = {
        ...scan,
        profile: profile
          ? {
              ...profile,
              sppg: profile.sppg === null ? undefined : profile.sppg,
            }
          : undefined,
      };
      const cardUrl = await generateShareCard(scanWithUserName);
      const link = document.createElement('a');
      link.href = cardUrl;
      link.download = `nutrition-card-${new Date(scan.scan_date).toISOString().split('T')[0]}.png`;
      link.click();
      URL.revokeObjectURL(cardUrl);
      toast.success('Gambar kartu diunduh!');
    } catch {
      toast.error('Gagal mengunduh gambar kartu');
    }
  };

  const handleExportAll = async () => {
    if (!filteredScans.length) return;
    setIsExporting(true);
    try {
      await exportHistoryToExcel();
      toast.success('File Excel berhasil diunduh!');
    } catch {
      toast.error('Gagal mengekspor data ke Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Components
  const ActionButtons = ({ scan }: { scan: NutritionScan }) => (
    <div className="flex items-center justify-end space-x-1 lg:space-x-2">
      <Button
        variant="foreground"
        size="sm"
        onClick={() => router.push(`/history/${scan.id}`)}
      >
        <Eye className="w-4 h-4 text-amber-600 hover:opacity-60" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleShareCard(scan)}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Design
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => deleteScan(scan.id)}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const ScanImage = ({ src }: { src?: string }) => (
    <img
      src={src || '/placeholder.svg'}
      alt="Food scan"
      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
    />
  );

  // Main render
  if (selectedScan) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <NutritionResults scan={selectedScan} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background grid grid-cols-1 lg:grid-cols-3 gap-y-5 lg:gap-7.5">
      <main className="container mx-auto px-4 col-span-2 lg:col-span-3">
        <div className="max-w-7xl mx-auto">
          <Stats scans={scans} />
          <Separator className="mb-8" />
          {isLoading && <ContentLoader />}
          {error && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={fetchScans}>
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          )}
          {!isLoading && !error && scans.length === 0 && <Nodata />}
          {/* Main Content */}
          {!isLoading && !error && scans.length > 0 && (
            <Card>
              <CardHeader>
                <div className="w-full flex flex-col gap-4 py-5">
                  <CardTitle>Riwayat Scan Menu</CardTitle>
                  {/* Filter Controls */}

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-end ">
                    <div className="relative w-full sm:max-w-sm sm:mr-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Cari menu ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-9 w-full sm:w-71 h-8"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-between sm:justify-end">
                      {/* Status Filter */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-8 px-3 border border-input rounded-md text-sm bg-background"
                      >
                        <option value="">Semua Status</option>
                        <option value="Layak">✓ Layak</option>
                        <option value="Tidak Layak">❖ Standar</option>
                      </select>

                      {/* Category Filter */}
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="h-8 px-3 border border-input rounded-md text-sm bg-background"
                      >
                        <option value="">Semua Kategori</option>
                        <option value="TK">TK/PAUD</option>
                        <option value="SD_1_3">SD Kelas 1–3</option>
                        <option value="SD_4_5">SD Kelas 4–5</option>
                        <option value="SMP">SMP/MTS</option>
                        <option value="SMA">SMA/SMK/MA</option>
                      </select>

                      {/* Month Filter */}
                      <input
                        type="month"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="h-8 px-3 border border-input rounded-md text-sm bg-background"
                      />
                    </div>
                    <Badge
                      onClick={handleExportAll}
                      disabled={isExporting || !filteredScans.length}
                      variant="success"
                      appearance="outline"
                      className="cursor-pointer hover:opacity-80 transition flex-1 sm:flex-none h-8"
                    >
                      <img
                        src="/media/file-types/excel.svg"
                        alt="Excel"
                        className="w-4 h-6"
                      />
                      <span className="hidden sm:inline">
                        {isExporting ? 'Exporting...' : 'Export ke Excel'}
                      </span>
                      <span className="sm:hidden">Export</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Desktop Table */}
                <div className="hidden lg:block rounded-md border overflow-x-auto">
                  {additionalFiltered.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Foto</TableHead>
                          <TableHead>Tanggal Scan</TableHead>
                          <TableHead>Menu</TableHead>
                          <TableHead>Status Nutrisi</TableHead>
                          <TableHead>Kategori Sekolah</TableHead>
                          <TableHead>item Menu</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedFilteredScans.map((scan) => {
                          const { itemCount, evaluationStatus, allItems } =
                            getScanSummary(scan);
                          return (
                            <TableRow key={scan.id}>
                              <TableCell>
                                <ScanImage src={scan.image_url} />
                              </TableCell>
                              <TableCell>
                                {formatDate(scan.scan_date)}
                              </TableCell>
                              <TableCell>
                                <div className="max-w-sm whitespace-pre-line break-words font-medium">
                                  {allItems}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    evaluationStatus === 'Layak'
                                      ? 'success'
                                      : 'warning'
                                  }
                                  appearance="outline"
                                  size="md"
                                  className="inline-flex items-center gap-1"
                                >
                                  {evaluationStatus === 'Layak' ? (
                                    <>
                                      <span>✓</span>
                                      <span>Layak</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>❖</span>
                                      <span>Standar</span>
                                    </>
                                  )}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge variant="outline" size="md">
                                  {getCategoryLabel(scan.school_category)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{itemCount}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <ActionButtons scan={scan} />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6">
                      <Nodata
                        type="no-filter-match"
                        onResetFilter={() => {
                          setStatusFilter('');
                          setCategoryFilter('');
                          setMonthFilter('');
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginatedFilteredScans.length > 0 ? (
                    paginatedFilteredScans.map((scan) => {
                      const { evaluationStatus, allItems } =
                        getScanSummary(scan);
                      return (
                        <Card key={scan.id}>
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <ScanImage src={scan.image_url} />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(scan.scan_date)}
                                  </span>
                                  <ActionButtons scan={scan} />
                                </div>
                                <p className="font-medium text-sm mb-3 line-clamp-2">
                                  {allItems}
                                </p>
                                <div className="flex gap-2">
                                  <Badge
                                    variant={
                                      evaluationStatus === 'Layak'
                                        ? 'success'
                                        : 'warning'
                                    }
                                    appearance="outline"
                                    size="lg"
                                  >
                                    {evaluationStatus === 'Layak'
                                      ? '✓ Layak'
                                      : '❖ Standar'}
                                  </Badge>
                                  <Badge variant="outline" size="md">
                                    {getCategoryLabel(scan.school_category)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Nodata
                      type="no-filter-match"
                      onResetFilter={() => {
                        setStatusFilter('');
                        setCategoryFilter('');
                        setMonthFilter('');
                      }}
                    />
                  )}
                </div>

                {filteredScans.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Tidak ada hasil pencarian untuk "{searchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setSearchQuery('')}
                    >
                      Reset Pencarian
                    </Button>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                  <span className="text-sm text-muted-foreground">
                    Halaman {page} dari{' '}
                    {Math.ceil(additionalFiltered.length / 6)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page * 6 >= additionalFiltered.length}
                      onClick={() => setPage(page + 1)}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
