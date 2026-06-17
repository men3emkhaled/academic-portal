import React from 'react';

// Plain card wrapper (3D mouse-tilt effect removed for the Linear-like design).
export default function TiltCard({ children, className = '', ...rest }) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
