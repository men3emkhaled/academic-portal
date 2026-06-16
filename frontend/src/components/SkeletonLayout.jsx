import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonSidebar = () => {
  return (
    <div
      className="fixed z-50 w-64"
      style={{ insetInlineStart: '1rem', top: '1rem', bottom: '1rem' }}
    >
      <div className="h-full bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
          <Skeleton className="size-8 rounded-md shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="size-5 rounded-md shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </nav>

        {/* Tray */}
        <div className="border-t border-border flex items-center gap-1 px-2 py-2">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <div className="flex-1" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    </div>
  );
};

const SkeletonContent = () => {
  return (
    <div className="md:ps-72 p-6 lg:p-10 space-y-6">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="mt-2 h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Content grid: main + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-5 w-48" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkeletonLayout = () => {
  const { i18n } = useTranslation();
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <SkeletonSidebar />
        <SkeletonContent />
      </div>
    </div>
  );
};

export default SkeletonLayout;
