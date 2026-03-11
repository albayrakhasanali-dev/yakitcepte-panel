'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import Badge from './Badge';

interface FleetInfo {
  balance: number;
  defined_limit: number;
  remaining_limit: number;
  fuel_status: string;
}

const customerMenu = [
  { label: 'Gösterge Paneli', href: '/dashboard', icon: '📊' },
  { label: 'Özet', href: '/fleets/show', icon: '📋' },
  {
    label: 'Cihaz Yönetimi', icon: '🔧',
    children: [
      { label: 'Cihazlar', href: '/devices' },
      { label: 'Cihaz İstekleri', href: '/devicerequests' },
      { label: 'Cihaz Grupları', href: '/devicegroups' },
      { label: 'Bakiye Yükleme Geçmişi', href: '/devices/prepaidlogs' },
    ],
  },
  { label: 'Ödemeler', href: '/payments', icon: '💳' },
  { label: 'Alışlar', href: '/purchases', icon: '⛽' },
  {
    label: 'Muhasebe', icon: '📄',
    children: [
      { label: 'Faturalar', href: '/invoices' },
      { label: 'Fiyat Farkları', href: '/contractinvoices' },
    ],
  },
];

const adminMenu = [
  { label: 'Admin Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Firma Yönetimi', href: '/admin/fleets', icon: '🏢' },
  { label: 'Kullanıcı Yönetimi', href: '/admin/users', icon: '👤' },
  { type: 'divider' as const },
  ...customerMenu,
];

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [fleetInfo, setFleetInfo] = useState<FleetInfo | null>(null);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.fleet_id) {
      api.get(`/fleets/${user.fleet_id}`).then(r => setFleetInfo(r.data)).catch(() => {});
    }
  }, [user?.fleet_id]);

  const menu = user?.role === 'admin' ? adminMenu : customerMenu;

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-cyan-700">Yakıt Cepte</h1>
        <p className="text-xs text-gray-500">Filo Yönetim Paneli</p>
      </div>

      {/* Fleet Status */}
      {fleetInfo && (
        <div className="p-4 border-b border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Bakiye:</span>
            <span className="font-semibold">{formatCurrency(fleetInfo.balance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tanımlı Limit:</span>
            <span className="font-semibold">{formatCurrency(fleetInfo.defined_limit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Kalan Limit:</span>
            <span className="font-semibold">{formatCurrency(fleetInfo.remaining_limit)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Yakıt Alımı:</span>
            <Badge value={fleetInfo.fuel_status} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {menu.map((item, idx) => {
          if ('type' in item && item.type === 'divider') {
            return <hr key={idx} className="my-2 border-gray-200" />;
          }
          const menuItem = item as { label: string; href?: string; icon?: string; children?: { label: string; href: string }[] };

          if (menuItem.children) {
            const isOpen = openMenus[menuItem.label] || menuItem.children.some(c => pathname === c.href);
            return (
              <div key={menuItem.label}>
                <button
                  onClick={() => toggleMenu(menuItem.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <span>{menuItem.icon} {menuItem.label}</span>
                  <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
                </button>
                {isOpen && (
                  <div className="ml-6 space-y-0.5">
                    {menuItem.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 text-sm rounded-lg ${pathname === child.href ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={menuItem.href}
              href={menuItem.href!}
              className={`flex items-center px-3 py-2 text-sm rounded-lg mb-0.5 ${pathname === menuItem.href ? 'bg-cyan-50 text-cyan-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {menuItem.icon} <span className="ml-1">{menuItem.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-400">
        <div>Tel: 0850 123 45 67</div>
        <div>info@yakitcepte.com</div>
      </div>
    </aside>
  );
}
