import React from 'react';
import Footer from '../components/Footer';

const Contact = () => {
  // بيانات التواصل (يمكنك تغييرها حسب رغبتك)
  const email = "men3emofficial@gmail.com";
  const whatsappNumber = "+201107753314"; // استخدم رقم حقيقي مع كود الدولة

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">📞 Contact Us</h1>
        <p className="text-gray-300 text-lg">We're here to help and answer any questions you might have.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Email Card */}
        <div className="bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-2xl p-8 text-center hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all duration-300">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-neon mb-3">Email</h2>
          <p className="text-gray-300 mb-4">Send us an email, and we'll get back to you as soon as possible.</p>
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-6 py-2.5 text-white transition-all duration-200"
          >
            {email}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>

        {/* WhatsApp Card */}
        <div className="bg-gradient-to-br from-charcoal to-black/80 border border-neon/30 rounded-2xl p-8 text-center hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all duration-300">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-neon mb-3">WhatsApp</h2>
          <p className="text-gray-300 mb-4">Chat with us directly on WhatsApp for quick support.</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-6 py-2.5 text-white transition-all duration-200"
          >
            Start Chat
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Optional additional info */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p className="mt-2">📍 Faculty of Computers & Information </p>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;