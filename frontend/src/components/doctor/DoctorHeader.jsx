import React from 'react';
import { Search, Plus, Bell, HelpCircle, User } from 'lucide-react';

const DoctorHeader = ({ doctor, onSearch, onCreateQuiz }) => {
  return (
    <header className="h-24 bg-doctor-bg/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-10 z-40">
      {/* Search Bar */}
      <div className="relative w-96 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search students, courses..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-14 pr-6 text-white placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 focus:ring-4 focus:ring-doctor-primary/10 transition-all font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button 
          onClick={onCreateQuiz}
          className="bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20 hover:bg-doctor-primary/20 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </button>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white hover:bg-white/10 transition-all relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-doctor-bg"></div>
          </button>
          <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white hover:bg-white/10 transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-white/5 mx-2"></div>

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white tracking-tight leading-none mb-1 group-hover:text-doctor-primary transition-colors">Dr. {doctor?.name}</p>
            <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Active Now</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[2px] group-hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-[14px] bg-doctor-sidebar flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff`} 
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
