'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Inbox,
  MailCheck,
  Mail,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SOFISAM_WHITE_LOGO_BASE64 } from '@/lib/branding';

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
    name: 'Email Delivery',
    href: '/emails',
    icon: Mail,
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
    <div className="flex h-full flex-col justify-between bg-[#0B0B0D] text-[#F2EEE6] select-none border-r border-[#222120]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222120]">
          <Link href="/dashboard" className="flex flex-col group">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-white.png?v=2"
                alt="SOFISAM"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== SOFISAM_WHITE_LOGO_BASE64) {
                    target.src = SOFISAM_WHITE_LOGO_BASE64;
                  }
                }}
                className="h-7 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="text-[10px] uppercase font-semibold tracking-widest text-[#C7A46A] bg-[#C7A46A]/15 px-1.5 py-0.5 rounded border border-[#C7A46A]/25">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-[#847E75] font-medium tracking-wide mt-1.5 pl-0.5">
              Enterprise Management
            </p>
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#847E75] hover:text-[#F2EEE6] hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="px-4 py-6">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider uppercase text-[#847E75]">
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
                      ? 'bg-[#191920] text-[#C7A46A] shadow-xs'
                      : 'text-[#B8B2A7] hover:bg-white/5 hover:text-[#F2EEE6]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4.5 h-4.5 transition-colors',
                        isActive ? 'text-[#C7A46A]' : 'text-[#847E75] group-hover:text-[#DED8CC]'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-5 rounded-full bg-[#C7A46A] absolute left-0 top-1/2 -translate-y-1/2" />
                  )}
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide rounded bg-[#C7A46A]/20 text-[#C7A46A] border border-[#C7A46A]/30">
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
      <div className="p-4 border-t border-[#222120] space-y-3">
        {/* Quick link to live public site */}
        <a
          href="https://sofisam-seven.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#131316] hover:bg-[#191920] text-xs text-[#DED8CC] transition-colors group border border-[#222120]"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#C7A46A]" />
            <span className="font-medium">Public Portal</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#847E75] group-hover:translate-x-0.5 transition-transform" />
        </a>

        {/* Security indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-[#847E75]">
          <Shield className="w-3.5 h-3.5 text-[#2B6B48]" />
          <span>Single-Admin Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col shadow-xl">
        {navContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#050505]/75 backdrop-blur-xs transition-opacity"
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
