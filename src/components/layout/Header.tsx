'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onOpenMobileMenu, title = 'Dashboard Overview', subtitle }: HeaderProps) {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [admin, setAdmin] = useState<{ name: string; email: string }>({
    name: 'Administrator',
    email: 'admin@sofisam.com',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadAdminProfile() {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          if (data.admin && isMounted) {
            setAdmin({
              name: data.admin.name || 'Administrator',
              email: data.admin.email || 'admin@sofisam.com',
            });
          }
        }
      } catch {
        // Fallback to default state
      }
    }
    loadAdminProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Continue client side logout redirect
    }
    router.push('/login');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#DED7CA] bg-white px-4 md:px-8 shadow-[0_1px_3px_rgba(40,30,15,0.03)]">
      {/* Left side: Hamburger button + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#66625B] hover:bg-[#F6F2EA] hover:text-[#171717] transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-[#171717]">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-[#66625B] mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Global Search, Notification bell, Admin profile */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Search */}
        <div className="hidden md:flex relative items-center">
          <Search className="w-4 h-4 text-[#66625B] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search enquiries, emails..."
            className="w-56 lg:w-72 rounded-lg border border-[#DED7CA] bg-[#FBF9F5] py-1.5 pl-9 pr-3 text-xs text-[#171717] placeholder-[#66625B] transition-all focus:w-72 lg:focus:w-80 focus:bg-white focus:border-[#C7A46A] focus:outline-none focus:ring-1 focus:ring-[#C7A46A]"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2 rounded-lg text-[#66625B] hover:bg-[#F6F2EA] hover:text-[#171717] transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C7A46A] ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl border border-[#DED7CA] animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DED7CA]">
                <span className="text-xs font-semibold text-[#171717]">Recent Activity</span>
                <span className="text-[10px] text-[#7A5D33] hover:text-[#C7A46A] font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-[#FBF9F5] border border-[#DED7CA]">
                  <div className="font-medium text-[#171717] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C7A46A]" />
                    New Private Enquiry
                  </div>
                  <p className="text-[11px] text-[#66625B] mt-0.5">Alexander Sterling (Meridian Capital Partners)</p>
                  <span className="text-[10px] text-[#98948D] mt-1 block">15 minutes ago</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-[#F6F2EA] transition-colors">
                  <div className="font-medium text-[#171717] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#2B6B48]" />
                    Newsletter Subscription
                  </div>
                  <p className="text-[11px] text-[#66625B] mt-0.5">wealth.insights@rothschild-group.ch</p>
                  <span className="text-[10px] text-[#98948D] mt-1 block">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#DED7CA]" />

        {/* Administrator Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F6F2EA] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B0B0D] text-[#C7A46A] flex items-center justify-center font-semibold text-xs border border-[#C7A46A]/30">
              {getInitials(admin.name)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#171717] leading-none">{admin.name}</div>
              <div className="text-[10px] text-[#66625B] mt-0.5 leading-none">{admin.email}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#66625B]" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white py-1.5 shadow-xl border border-[#DED7CA] animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#DED7CA]">
                <p className="text-xs font-semibold text-[#171717]">{admin.name}</p>
                <p className="text-[11px] text-[#66625B] truncate">{admin.email}</p>
                <div className="flex items-center gap-1 text-[10px] text-[#2B6B48] font-medium mt-1">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated Session
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => router.push('/settings')}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-[#171717] hover:bg-[#F6F2EA] transition-colors"
                >
                  <User className="w-4 h-4 text-[#66625B]" />
                  Security Settings
                </button>
              </div>

              <div className="border-t border-[#DED7CA] pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs text-[#9A3F2C] hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4 text-[#9A3F2C]" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
