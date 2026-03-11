'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import Badge from '@/components/Badge';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/payments/${id}`).then(r => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/payments" className="text-cyan-600 hover:underline">&larr; Ödemeler</Link>
          <h1 className="text-2xl font-bold text-gray-800">Ödeme Detay #{data.id}</h1>
        </div>
        <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">Makbuz</button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500">Cari Hesap</p>
            <p className="font-semibold">{data.fleet_code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Filo Adı</p>
            <p className="font-semibold">{data.fleet_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Açıklama</p>
            <p className="font-semibold">{data.description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">İlan Tarihi</p>
            <p className="font-semibold">{formatDateTime(data.announcement_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ödeme Tarihi</p>
            <p className="font-semibold">{formatDateTime(data.payment_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Tutar</p>
            <p className="font-semibold text-lg">{formatCurrency(data.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Notlar</p>
            <p className="font-semibold">{data.notes || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ödeme Tipi</p>
            <Badge value={data.payment_type} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Kayıt Tarihi</p>
            <p className="font-semibold">{formatDateTime(data.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Kaynak</p>
            <Badge value={data.source} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Dış ID</p>
            <p className="font-semibold">{data.external_id || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
