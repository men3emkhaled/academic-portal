import React from 'react';

const LoadingScreen = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07070d] gap-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-[#2cfc7d] to-[#10b981] animate-pulse shadow-2xl shadow-[#2cfc7d]/20 flex items-center justify-center">
          <span className="text-4xl font-black text-white">Z</span>
        </div>
        <div className="absolute -top-2 -end-2 w-8 h-8 rounded-xl bg-white/10 border border-white/5 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-[#2cfc7d] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2cfc7d] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2cfc7d] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2cfc7d] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
