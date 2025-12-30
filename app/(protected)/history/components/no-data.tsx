import React from 'react';
import Link from 'next/link';
import { Calendar, Filter, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NodataProps {
  type?: 'empty' | 'no-filter-match';
  onResetFilter?: () => void;
}

const Nodata = ({ type = 'empty', onResetFilter }: NodataProps) => {
  if (type === 'no-filter-match') {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Tidak ada data yang sesuai dengan filter
        </h3>
        <p className="text-muted-foreground mb-6">
          Coba ubah filter atau reset untuk melihat semua data.
        </p>
        {onResetFilter && (
          <Button onClick={onResetFilter} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Reset Filter
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Tidak ada data</h3>
        <p className="text-muted-foreground mb-6">
          Anda belum melakukan scan makanan apapun.
        </p>
        <Link href="/analisis">
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Mulai Scan Pertama Anda
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default Nodata;
