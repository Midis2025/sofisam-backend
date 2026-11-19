'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  fullWidth = false,
}: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      {/* Sidebar (Desktop fixed + Mobile drawer) */}
      <Sidebar isMobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Container */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        {/* Page Content */}
        <main
          className={`flex-1 w-full mx-auto transition-all ${
            fullWidth
              ? 'p-4 sm:p-6 lg:p-8 max-w-none'
              : 'p-4 md:p-6 lg:p-8 max-w-7xl'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
