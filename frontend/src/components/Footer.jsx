import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleTabChange = (tabId) => {
    const targetPath = tabId === 'home' ? '/' : `/${tabId}`;
    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070b19] border-t border-white/5 text-slate-300 py-16 px-6 lg:px-12 relative z-10 text-start">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="ZNU Logo" className="h-12 w-auto object-contain" />
            </div>
            <div className="text-start">
              <span className="block font-black text-sm uppercase tracking-wider text-white">
                {t('landing.footer_university_name')}
              </span>
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                {t('landing.footer_tagline')}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            {t('landing.footer_description')}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a 
              href="https://www.facebook.com/ZagazigNationalUniversity/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#2cfc7d]/10 hover:text-[#2cfc7d] flex items-center justify-center transition-all border border-white/10"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6c0-.88.72-1 1-1h1.5V2H12c-2.76 0-3 1.76-3 3v3z" />
              </svg>
            </a>
            <a 
              href="https://www.linkedin.com/in/zagazig-national-university-znu-egypt-7159a4333/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#2cfc7d]/10 hover:text-[#2cfc7d] flex items-center justify-center transition-all border border-white/10"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-white text-xs font-black uppercase tracking-widest border-l-2 border-[#2cfc7d] pl-2.5">
            {t('landing.quick_links')}
          </h4>
          <ul className="space-y-2.5 text-xs font-bold">
            <li>
              <button onClick={() => handleTabChange('home')} className="hover:text-[#2cfc7d] transition-colors flex items-center gap-1">
                ‹ {t('landing.nav_home')}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabChange('programs')} className="hover:text-[#2cfc7d] transition-colors flex items-center gap-1">
                ‹ {t('landing.nav_programs')}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabChange('about')} className="hover:text-[#2cfc7d] transition-colors flex items-center gap-1">
                ‹ {t('landing.nav_about')}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabChange('contact')} className="hover:text-[#2cfc7d] transition-colors flex items-center gap-1">
                ‹ {t('landing.nav_contact')}
              </button>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-white text-xs font-black uppercase tracking-widest border-l-2 border-[#2cfc7d] pl-2.5">
            {t('landing.academic_programs')}
          </h4>
          <ul className="space-y-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
            <li>• {t('landing.program_medicine')}</li>
            <li>• {t('landing.program_dentistry')}</li>
            <li>• {t('landing.program_pharmacy')}</li>
            <li>• {t('landing.program_nursing')}</li>
            <li>• {t('landing.program_ai')}</li>
            <li>• {t('landing.program_med_informatics')}</li>
            <li>• {t('landing.program_aviation')}</li>
            <li>• {t('landing.program_mecatronics')}</li>
            <li>• {t('landing.program_construction')}</li>
            <li>• {t('landing.program_accounting')}</li>
            <li>• {t('landing.program_business')}</li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest border-l-2 border-[#2cfc7d] pl-2.5">
              {t('landing.contact_us')}
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#2cfc7d] mt-0.5 flex-shrink-0" />
                <span className="text-[10px] text-slate-400 leading-normal">{t('landing.contact_address_value')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
                <span className="text-[10px] text-slate-500 font-bold">{t('landing.contact_phone_value')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-[#2cfc7d] flex-shrink-0" />
                <span className="text-[10px] text-slate-400 font-bold">{t('landing.contact_email_value')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-white text-[10px] font-black uppercase tracking-wider">
              {t('landing.subscribe_title')}
            </h5>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder={t('landing.subscribe_placeholder')}
                className="bg-white/5 border border-white/10 text-white text-xs px-3.5 py-2.5 rounded-xl w-full focus:outline-none focus:border-[#2cfc7d]/50 transition-colors"
              />
              <button className="bg-[#eab308] hover:bg-[#ca8a04] text-black font-black text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0">
                {t('landing.subscribe_button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1400px] mx-auto text-[10px] font-bold text-slate-500">
        <p>{t('landing.footer_rights')}</p>
        <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
          <span className="hover:text-[#2cfc7d] cursor-pointer transition-colors">{t('landing.footer_privacy')}</span>
          <span className="hover:text-[#2cfc7d] cursor-pointer transition-colors">{t('landing.footer_terms')}</span>
          <span className="hover:text-[#2cfc7d] cursor-pointer transition-colors">{t('landing.footer_sitemap')}</span>
          <span className="hover:text-[#2cfc7d] cursor-pointer transition-colors">{t('landing.footer_complaints')}</span>
        </div>
        <p className="uppercase tracking-widest">{t('landing.footer_developer')}</p>
      </div>
    </footer>
  );
}
