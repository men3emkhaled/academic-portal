import React from 'react';
import { useTranslation } from 'react-i18next';

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-white/[0.04] rounded-2xl ${className}`} />
);

const SkeletonSidebar = () => {
  return (
    <div className="fixed z-50 w-72 transition-all duration-700" style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}>
      <div className="h-full bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.05)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto">
            <Shimmer className="w-16 h-16 rounded-full" />
          </div>
          <Shimmer className="w-20 h-3 mx-auto mt-4" />
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Shimmer className="w-5 h-5 rounded-lg flex-shrink-0" />
              <Shimmer className="h-3 flex-1" />
            </div>
          ))}
        </nav>
        <div className="p-6 pt-0">
          <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
            {[...Array(3)].map((_, i) => (
              <Shimmer key={i} className="flex-1 h-12 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonContent = () => {
  return (
    <div className="md:ps-72 p-6 lg:p-10 space-y-8">
      {/* Hero/welcome card */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10">
        <Shimmer className="h-8 w-64 mb-4" />
        <Shimmer className="h-4 w-48" />
        <div className="flex gap-6 mt-6">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-3 w-24" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8">
            <Shimmer className="w-10 h-10 rounded-2xl mb-6" />
            <Shimmer className="h-3 w-16 mb-2" />
            <Shimmer className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Content grid: main + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Shimmer className="h-6 w-48 mb-2" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8">
              <Shimmer className="h-5 w-3/4 mb-3" />
              <Shimmer className="h-3 w-full mb-2" />
              <Shimmer className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8">
              <Shimmer className="h-5 w-32 mb-6" />
              <Shimmer className="h-3 w-full mb-3" />
              <Shimmer className="h-3 w-3/4 mb-3" />
              <Shimmer className="h-3 w-1/2" />
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
    <div className="min-h-screen bg-[#010101] overflow-hidden">
      <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
        <SkeletonSidebar />
        <SkeletonContent />
      </div>
    </div>
  );
};

export default SkeletonLayout;
