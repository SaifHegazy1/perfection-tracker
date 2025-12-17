import React from 'react';

const PhysicsBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 physics-grid opacity-30" />
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/40 animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
      
      {/* Orbiting atoms */}
      <div className="absolute top-20 left-10 opacity-20">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-glow" />
          <div className="absolute w-3 h-3 bg-accent rounded-full animate-orbit" style={{ top: '50%', left: '50%', marginTop: '-6px', marginLeft: '-6px' }} />
        </div>
      </div>
      
      <div className="absolute bottom-40 right-20 opacity-20">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-2 border-accent/50 animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute w-4 h-4 bg-primary rounded-full animate-orbit" style={{ top: '50%', left: '50%', marginTop: '-8px', marginLeft: '-8px', animationDuration: '8s' }} />
        </div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
    </div>
  );
};

export default PhysicsBackground;
