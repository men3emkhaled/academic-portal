import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, GraduationCap, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { programsData } from '../utils/programsData';
import { landingTranslations } from '../utils/landingTranslations';
import { PageHeader, SegmentedTabs, EmptyState } from '@/components/common';

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  const filteredPrograms = activeCategory === 'all'
    ? programsData
    : programsData.filter(p => p.category === activeCategory);

  const categoryOptions = Object.keys(tLocal.filters).map((categoryKey) => ({
    value: categoryKey,
    label: tLocal.filters[categoryKey],
  }));

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground text-start font-sans">

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">

        {/* Page Title */}
        <PageHeader
          icon={GraduationCap}
          title={tLocal.programs.title}
          description={tLocal.programs.subtitle}
        />

        {/* Category Filters */}
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <SegmentedTabs
            value={activeCategory}
            onChange={setActiveCategory}
            options={categoryOptions}
            className="flex-wrap"
          />
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={tLocal.programs.title}
            description={tLocal.programs.subtitle}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((prog) => (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/programs/${prog.id}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex h-full w-full flex-col justify-between gap-5 rounded-xl border border-border bg-card p-5 text-start outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {isAr ? prog.facultyAr : prog.facultyEn}
                      </span>
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                    </div>

                    <h3 className="text-base font-semibold leading-snug text-foreground line-clamp-2">
                      {isAr ? prog.titleAr : prog.titleEn}
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {isAr ? prog.descAr : prog.descEn}
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="block text-xs text-muted-foreground">{tLocal.programs.duration}</span>
                        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Clock className="size-3.5 text-primary" />
                          {isAr ? prog.durationAr : prog.durationEn}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-xs text-muted-foreground">{tLocal.programs.fees}</span>
                        <span className="text-sm font-semibold text-primary">
                          {prog.fees} {tLocal.programs.egp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        {tLocal.programs.learnMore}
                      </span>
                      <ChevronRight
                        className={`size-4 text-muted-foreground transition-colors group-hover:text-foreground ${isAr ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
