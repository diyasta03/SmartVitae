import React from 'react'

const Tech = () => {
  return (
    <div style = {{transform: 'rotateY(-180deg)'}} className="strategy-card">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420" width="300" height="420">
        <rect width="300" height="420" fill="white"/>
        
        {/* Title */}
        <text x="20" y="35" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold">TECH</text>
        
        {/* List items with dotted lines */}
        {['WebGL Development', 'Web Development', 'Unity/Unreal', 'Interactive Installations', 'VR/AR'].map((item, index) => (
          <React.Fragment key={index}>
            <text x="20" y={80 + index * 40} fontFamily="Helvetica, sans-serif" fontSize="16">{item}</text>
            {index < 4 && (
              <line x1="20" y1={90 + index * 40} x2="280" y2={90 + index * 40} stroke="black" strokeWidth="1" strokeDasharray="2,2" />
            )}
          </React.Fragment>
        ))}
        
        {/* Bottom text (rotated) */}
        <text x="280" y="405" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" transform="rotate(180 140 202.5)">TECH</text>
        
        {/* Pixelated "S" symbols */}
        {[{ x: 260, y: 20 }, { x: 20, y: 380 }].map((pos, index) => (
          <g key={index} transform={`translate(${pos.x},${pos.y}) scale(0.8)`}>
            {[
              [0,0], [5,0], [10,0], [5,5], [5,10], [5,15], [5,20]
            ].map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="5" height="5" fill="black" />
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default Tech