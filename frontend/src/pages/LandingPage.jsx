import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, MapPin, Mail, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Shared Components & Utils
import Header from '../components/Header';
import Footer from '../components/Footer';
import TiltCard from '../components/TiltCard';
import { programsData } from '../utils/programsData';
import { landingTranslations } from '../utils/landingTranslations';
import { Button } from '@/components/ui/button';

// Academic crest for Zagazig National University
const AcademicCrest = () => {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto select-none z-10 flex justify-center items-center">
      <img
        src="/logo.png"
        alt="Zagazig National University Logo"
        className="w-full h-auto object-contain max-h-[350px]"
      />
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  const filteredPrograms = activeCategory === 'all'
    ? programsData
    : programsData.filter(p => p.category === activeCategory);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen text-start font-sans bg-background text-foreground overflow-x-hidden flex flex-col justify-between">

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area (displays everything sequentially on the Home route) */}
      <main className="flex-grow">

        {/* Hero & Stats Section */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Hero Information */}
            <div className="lg:col-span-7 space-y-6 text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {tLocal.hero.tagline}
                </span>
              </div>

              <h1 className={`text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-foreground ${isAr ? 'font-arabic' : ''}`}>
                {tLocal.hero.title}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
                {tLocal.hero.desc}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => {
                    navigate('/programs');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group"
                >
                  <span>{tLocal.hero.explorePrograms}</span>
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    navigate('/about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {tLocal.hero.aboutUniversity}
                </Button>
              </div>
            </div>

            {/* Academic Crest Asset */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <AcademicCrest />
            </div>

          </div>

          {/* Stats Shelf */}
          <div className="mt-16 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-start space-y-1">
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">4,600+</p>
              <p className="text-xs text-muted-foreground">{tLocal.stats.students}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">7</p>
              <p className="text-xs text-muted-foreground">{tLocal.stats.faculties}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">11</p>
              <p className="text-xs text-muted-foreground">{tLocal.stats.programs}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">100%</p>
              <p className="text-xs text-muted-foreground">{tLocal.stats.training}</p>
            </div>
          </div>
        </section>

        {/* Programs Showcase Section */}
        <section className="border-t border-border bg-muted/30 py-16 md:py-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-2 max-w-2xl text-start">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{tLocal.nav.programs}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                  {tLocal.programs.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tLocal.programs.subtitle}
                </p>
              </div>

              {/* Filters Switcher */}
              <div className="flex flex-wrap gap-1 bg-muted border border-border p-1 rounded-lg">
                {Object.keys(tLocal.filters).map((categoryKey) => {
                  const isActive = activeCategory === categoryKey;
                  return (
                    <button
                      key={categoryKey}
                      onClick={() => setActiveCategory(categoryKey)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-background text-foreground border border-border'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tLocal.filters[categoryKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.slice(0, 6).map((prog) => (
                <TiltCard key={prog.id} className="h-full">
                  <div
                    onClick={() => {
                      navigate(`/programs/${prog.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cursor-pointer group h-full bg-card text-card-foreground border border-border rounded-xl p-5 transition-colors hover:border-primary/40 flex flex-col justify-between min-h-[340px]"
                  >

                    <div className="space-y-4 text-start">
                      <div className="flex justify-between items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-medium text-muted-foreground">
                          {isAr ? prog.facultyAr : prog.facultyEn}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold tracking-tight leading-snug line-clamp-2 text-foreground">
                        {isAr ? prog.titleAr : prog.titleEn}
                      </h3>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {isAr ? prog.descAr : prog.descEn}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-border space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="block text-xs text-muted-foreground">{tLocal.programs.duration}</span>
                          <span className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                            <Clock className="size-4 text-primary shrink-0" />
                            {isAr ? prog.durationAr : prog.durationEn}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs text-muted-foreground">{tLocal.programs.fees}</span>
                          <span className="text-sm font-medium text-primary">
                            {prog.fees} {tLocal.programs.egp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          {tLocal.programs.learnMore}
                        </span>
                        <ChevronRight className={`size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 ${isAr ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                      </div>
                    </div>

                  </div>
                </TiltCard>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                onClick={() => {
                  navigate('/programs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group"
              >
                <span>{isAr ? "مشاهدة جميع البرامج" : "View All Programs"}</span>
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Button>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-20 border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-start">

              {/* Left Description Column */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-muted-foreground">{tLocal.about.subtitle}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground leading-tight">
                  {tLocal.about.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tLocal.about.text1}
                </p>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tLocal.about.text2}
                </p>
              </div>

              {/* Right Highlights Column */}
              <div className="lg:col-span-6 space-y-4">
                {tLocal.about.features.map((feat, idx) => (
                  <div
                    key={feat?.id || idx}
                    className="bg-card text-card-foreground border border-border p-5 rounded-xl transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                        0{idx + 1}
                      </div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        {feat.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-20 border-t border-border bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="space-y-2 text-center max-w-2xl mx-auto mb-10">
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">{tLocal.nav.contact}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                {tLocal.contact.title}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {tLocal.contact.subtitle}
              </p>
            </div>

            {/* Clean Cards Layout for contacts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-card text-card-foreground border border-border p-5 rounded-xl text-start flex flex-col justify-between min-h-[180px] transition-colors hover:border-primary/40">
                <div className="size-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <MapPin className="size-5" />
                </div>
                <div className="space-y-0.5 mt-6">
                  <span className="block text-xs text-muted-foreground">{isAr ? "الموقع" : "Location"}</span>
                  <span className="text-sm font-medium leading-relaxed text-foreground">{tLocal.contact.address}</span>
                </div>
              </div>

              <div className="bg-card text-card-foreground border border-border p-5 rounded-xl text-start flex flex-col justify-between min-h-[180px] transition-colors hover:border-primary/40">
                <div className="size-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <Mail className="size-5" />
                </div>
                <div className="space-y-0.5 mt-6">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="text-sm font-medium text-foreground">info@znu.edu.eg</span>
                  <span className="block text-xs text-muted-foreground mt-1">{tLocal.contact.email}</span>
                </div>
              </div>

              <div className="bg-card text-card-foreground border border-border p-5 rounded-xl text-start flex flex-col justify-between min-h-[180px] transition-colors hover:border-primary/40">
                <div className="size-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                  <Phone className="size-5" />
                </div>
                <div className="space-y-0.5 mt-6">
                  <span className="block text-xs text-muted-foreground">Hotline</span>
                  <span className="text-sm font-medium text-foreground">{tLocal.contact.phone}</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
