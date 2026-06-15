import React from 'react';

const BackgroundDecor = () => {
  return (
    <>
      <div className="fixed top-0 inset-inline-start-0 w-[600px] h-[600px] bg-gradient-to-br from-[#2cfc7d]/5 via-transparent to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 inset-inline-end-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#6366f1]/5 via-transparent to-transparent rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none z-0" />
    </>
  );
};

export default BackgroundDecor;
