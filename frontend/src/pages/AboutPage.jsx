import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { landingTranslations } from '../utils/landingTranslations';

export default function AboutPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  return (
    <div className="min-h-screen text-start font-sans bg-background text-foreground flex flex-col justify-between">

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start text-start">

          {/* Left Description Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary"></span>
              <span className="text-xs font-medium text-muted-foreground">{tLocal.about.subtitle}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground leading-tight">
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
                className="rounded-xl border bg-card text-card-foreground p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
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
      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
