'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Badge from '@/components/Badge';

export default function DeviceGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', separate_report: true, separate_invoice: true });

  useEffect(() => {
    api.get('/devices/groups').then(r => setGroups(r.data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/devices/groups', form);
      const r = await api.get('/devices/groups');
      setGroups(r.data);
      setShowForm(false);
      setForm({ name: '', separate_report: true, separate_invoice: true });
    } catch {}
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Cihaz Grupları</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700">
          Yeni Cihaz Grubu Ekle
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Grup adı" className="px-3 py-2 border rounded-lg text-sm w-full" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.separate_report} onChange={e => setForm({...form, separate_report: e.target.checked})} />
              Ayrı Döküm
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.separate_invoice} onChange={e => setForm({...form, separate_invoice: e.target.checked})} />
              Ayrı Fatura
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Kaydet</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">İptal</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">İsim</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Filo</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Cihaz Sayısı</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ayrı Döküm</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ayrı Fatura</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g: any) => (
              <tr key={g.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2.5 font-medium text-cyan-600">{g.name}</td>
                <td className="px-4 py-2.5">{g.fleet_name}</td>
                <td className="px-4 py-2.5 text-right">{g.device_count}</td>
                <td className="px-4 py-2.5"><Badge value={g.separate_report ? 'Evet' : 'Hayır'} /></td>
                <td className="px-4 py-2.5"><Badge value={g.separate_invoice ? 'Evet' : 'Hayır'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
