import React, { useState } from 'react';
import { useTAAuth } from '../../context/TAAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Save } from 'lucide-react';

const TASettings = () => {
  const { ta } = useTAAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: ta?.name || '',
    email: ta?.email || '',
    phone: ta?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    toast.success(t('ta.settings.saved_success'));
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.settings.title')}</h1>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{t('ta.settings.subtitle')}</p>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{t('ta.settings.name_label')}</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <User className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{t('ta.settings.email_label')}</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{t('ta.settings.phone_label')}</label>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="bg-transparent flex-1 outline-none text-gray-900 dark:text-white font-medium"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          {saving ? t('ta.settings.saving') : t('ta.settings.save_changes')}
        </button>
      </form>
    </div>
  );
};

export default TASettings;
