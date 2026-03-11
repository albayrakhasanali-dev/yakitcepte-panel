'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/account/signin');
  };

  return (
    <header className="h-14 bg-gradient-to-r from-cyan-600 to-cyan-700 flex items-center justify-between px-6 text-white shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Yakıt Cepte Panel</h2>
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-cyan-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="w-7 h-7 bg-cyan-800 rounded-full flex items-center justify-center text-sm font-medium">
            {user?.full_name?.[0] || user?.username?.[0] || '?'}
          </span>
          <span className="text-sm">{user?.full_name || user?.username}</span>
          <span className="text-xs">▼</span>
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
              <div className="px-4 py-2 text-sm text-gray-500 border-b">
                {user?.role === 'admin' ? 'Yönetici' : 'Müşteri'}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Çıkış Yap
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
