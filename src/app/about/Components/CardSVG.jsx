import React from 'react';

const CardBackDesign = () => {
  return (
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
        <defs>
          {/* Gradient untuk background */}
          <linearGradient id="backGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e69ec" />
            <stop offset="100%" stopColor="#2e69ec" />
          </linearGradient>
          
          {/* Pattern dekoratif */}
          <pattern id="cardPattern" patternUnits="userSpaceOnUse" width="60" height="60">
            <path d="M30 0L60 30L30 60L0 30Z" fill="rgba(0,0,0,0.1)" />
            <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          </pattern>
          
          {/* Filter untuk efek emboss */}
          <filter id="emboss" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting surfaceScale="5" specularConstant="0.5" specularExponent="10" 
                               lightingColor="white" in="blur" result="spec">
              <fePointLight x="-50" y="-50" z="50" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="in" result="comp" />
            <feComposite in="SourceGraphic" in2="comp" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>
        
        {/* Base card */}
        <rect width="300" height="420" rx="15" ry="15" fill="url(#backGradient)" 
              stroke="#990000" strokeWidth="2" />
        
        {/* Border dalam */}
        <rect x="15" y="15" width="270" height="390" rx="10" ry="10" 
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        
        {/* Pola tengah */}
        <rect x="30" y="30" width="240" height="360" rx="5" ry="5" 
              fill="url(#cardPattern)" opacity="0.7" />
        
        {/* Logo utama (bisa diganti dengan logo Anda) */}
       {/* Logo utama */}
<g transform="translate(150,210)" filter="url(#emboss)">
  <rect x="-80" y="-80" width="160" height="160" rx="80" ry="80" 
        fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="8" />
    <image
      href="icon2.svg"
      x="-100"
      y="-100" 
      width="200"
      height="200"
      preserveAspectRatio="xMidYMid meet"
    />
  </g>

        {/* Efek corner */}
        <path d="M20 20Q20 40,40 40L40 20Q20 20,20 40Z" fill="rgba(255,255,255,0.2)" />
        <path d="M280 20Q260 20,260 40L280 40Q280 20,260 20Z" fill="rgba(255,255,255,0.2)" />
        <path d="M20 400Q20 380,40 380L40 400Q20 400,20 380Z" fill="rgba(255,255,255,0.2)" transform="rotate(180,20,400)" />
        <path d="M280 400Q260 400,260 380L280 380Q280 400,260 400Z" fill="rgba(255,255,255,0.2)" transform="rotate(180,280,400)" />
        
        {/* Efek tekstur */}
        <rect x="30" y="30" width="240" height="360" rx="5" ry="5" 
              fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="10" strokeDasharray="15,10" />
      </svg>
    </div>
  );
};

export default CardBackDesign;