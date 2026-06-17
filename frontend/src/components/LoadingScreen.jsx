import React from 'react';
import { Spinner } from '@/components/common';

const LoadingScreen = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <div className="relative">
        <div className="size-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain p-2" />
        </div>
        <span className="absolute -top-1.5 -end-1.5 flex items-center justify-center size-6 rounded-lg bg-card border border-border">
          <Spinner className="size-3 text-primary" />
        </span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="size-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
