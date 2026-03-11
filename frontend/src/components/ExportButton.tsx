'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function ExportButton({ type, fleetId }: { type: string; fleetId?: number }) {
  const [open, setOpen] = useState(false);

  const handleExport = async (format: 'xlsx' | 'csv') => {
    try {
      const params = new URLSearchParams({ format });
      if (fleetId) params.set('fleet_id', fleetId.toString());
      const res = await api.get(`/export/${type}?${params}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors"
      >
        Döküm
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-20 py-1">
            <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
              Excel (.xlsx)
            </button>
            <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
              CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
