'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  MailCheck,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'All Enquiries',
    href: '/enquiries',
    icon: Inbox,
    badge: 'New',
  },
  {
    name: 'Newsletter Subscribers',
    href: '/newsletter',
    icon: MailCheck,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-[#14243A] text-slate-100 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[#B99A62] flex items-center justify-center text-[#14243A] font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif tracking-wider font-bold text-base text-white">
                  SOFISAM
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-[#B99A62] bg-[#B99A62]/15 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Management</p>
            </div>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="px-4 py-6">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Operations
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'group relative flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#1D324E] text-[#B99A62] shadow-xs'
                      : 'text-slate-300 hover:bg-[#1A2E47] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4.5 h-4.5 transition-colors',
                        isActive ? 'text-[#B99A62]' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-5 rounded-full bg-[#B99A62] absolute left-0 top-1/2 -translate-y-1/2" />
                  )}
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / System Info */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        {/* Quick link to live public site */}
        <a
          href="https://sofisam-seven.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0F1B2C] hover:bg-[#16273E] text-xs text-slate-300 transition-colors group border border-slate-700/40"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#B99A62]" />
            <span className="font-medium">Public Portal</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Security indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Single-Admin Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col shadow-lg">
        {navContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl transition-transform">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
