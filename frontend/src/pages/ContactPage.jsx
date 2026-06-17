import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { landingTranslations } from '../utils/landingTranslations';
import { PageContainer } from '@/components/common';

export default function ContactPage() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  const cards = [
    {
      icon: MapPin,
      label: isAr ? 'الموقع' : 'Location',
      value: tLocal.contact.address,
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@znu.edu.eg',
      hint: tLocal.contact.email,
    },
    {
      icon: Phone,
      label: 'Hotline',
      value: tLocal.contact.phone,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground text-start font-sans">
      <Header />

      <main className="flex-grow w-full">
        <PageContainer className="py-12 md:py-16">

          <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">{tLocal.nav.contact}</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {tLocal.contact.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              {tLocal.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map(({ icon: Icon, label, value, hint }) => (
              <div
                key={label}
                className="flex min-h-[180px] flex-col justify-between rounded-xl border bg-card p-5 text-start"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="mt-6 space-y-1">
                  <span className="block text-xs text-muted-foreground">{label}</span>
                  <span className="block text-sm font-medium text-foreground">{value}</span>
                  {hint ? (
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
