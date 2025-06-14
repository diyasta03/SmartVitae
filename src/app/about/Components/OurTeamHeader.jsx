'use client';

import React, { useEffect, useState } from 'react';

const OurTeamHeader = ({ triggerScroll, topOffset = 120 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos >= triggerScroll) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [triggerScroll]);

  return (
    <div
      className={`
        fixed left-0 w-full bg-white z-[1001]
        flex justify-center items-center py-4 shadow-md
        ${isVisible ? 'opacity-100 transition-opacity duration-500' : 'opacity-0 pointer-events-none'}
      `}
      style={{ top: `${topOffset}px` }}
    >
      {/* Tambahkan 'w-full' ke h2 agar mengambil lebar penuh dari div flex parent-nya */}
      <h2 className="text-4xl font-bold text-center text-gray-800 w-full">OUR TEAM</h2>
    </div>
  );
};

export default OurTeamHeader;
