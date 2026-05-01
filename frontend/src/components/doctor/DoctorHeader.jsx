import React from 'react';
import { Search, Plus, Bell, HelpCircle, User } from 'lucide-react';

const DoctorHeader = ({ doctor, onSearch, onCreateQuiz }) => {
  return (
    <header className="h-20 lg:h-24 bg-doctor-bg/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-10 z-40">
      {/* Search Bar */}
      <div className="relative w-full max-w-[180px] sm:max-w-96 group">
        <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-xl lg:rounded-2xl py-2.5 lg:py-3.5 pl-11 lg:pl-14 pr-4 lg:pr-6 text-sm lg:text-base text-white placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 focus:ring-4 focus:ring-doctor-primary/10 transition-all font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button 
          onClick={onCreateQuiz}
          className="hidden lg:flex bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20 hover:bg-doctor-primary/20 font-bold px-6 py-3 rounded-2xl items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </button>

        <div className="flex items-center gap-2 lg:gap-3">
          <button className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white hover:bg-white/10 transition-all relative">
            <Bell className="w-4 lg:w-5 h-4 lg:h-5" />
            <div className="absolute top-2.5 lg:top-3 right-2.5 lg:right-3 w-1.5 lg:w-2 h-1.5 lg:h-2 bg-red-500 rounded-full border-2 border-doctor-bg"></div>
          </button>
          <button className="hidden lg:flex w-12 h-12 rounded-2xl bg-white/5 border border-white/5 items-center justify-center text-doctor-text-muted hover:text-white hover:bg-white/10 transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-white/5 mx-2"></div>

        <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white tracking-tight leading-none mb-1 group-hover:text-doctor-primary transition-colors">Dr. {doctor?.name?.split(' ')[0]}</p>
            <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Active</p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[2px] group-hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-[9px] lg:rounded-[14px] bg-doctor-sidebar flex items-center justify-center overflow-hidden">
                <img 
                  src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff`} 
                  alt={doctor?.name}
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
