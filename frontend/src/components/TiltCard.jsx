import React, { useRef, useState } from 'react';

// Premium 3D Card Tilt Component with Razor-Sharp Text Rendering
export default function TiltCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ease-out h-full ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div style={{ transform: 'translateZ(10px)', backfaceVisibility: 'hidden' }} className="h-full">
        {children}
      </div>
    </div>
  );
}
