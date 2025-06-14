'use client';

import { useState, useEffect, useRef } from 'react'; // Impor useRef

import Navbar from '../components/Navbar/Navbar';
import Hero from './Components/Hero';
import Cards from './Components/Cards';
import Footer from '../components/Footer/Footer';
import OurTeamHeader from './Components/OurTeamHeader';
import SplashCursor from './Components/SplashCursor'

import './index.css';
import './Components/styles.css';

function App() {
  const [headerTriggerScrollPoint, setHeaderTriggerScrollPoint] = useState(0);
  const navbarRef = useRef(null); // Membuat ref untuk Navbar
  const [actualNavbarHeight, setActualNavbarHeight] = useState(0); // State untuk menyimpan tinggi Navbar

  useEffect(() => {
    // Fungsi untuk mengukur tinggi Navbar
    const measureNavbarHeight = () => {
      if (navbarRef.current) {
        setActualNavbarHeight(navbarRef.current.offsetHeight);
      }
    };

    // Panggil saat komponen mount dan saat resize untuk memastikan tinggi Navbar akurat
    measureNavbarHeight();
    window.addEventListener('resize', measureNavbarHeight);

    // Hitung titik trigger scroll
    const calculateTriggerPoint = () => {
      const triggerPoint = 450; // Titik scroll di mana header muncul (sesuaikan jika perlu)
      setHeaderTriggerScrollPoint(triggerPoint);

      // Pastikan body memiliki tinggi yang cukup untuk discroll
      const viewportHeight = window.innerHeight;
      const estimatedTotalContentHeight =
        (document.querySelector('.content')?.offsetHeight || viewportHeight) + // Hero
        (viewportHeight + 40) + // Placeholder for Cards (h-screen + mt-10)
        (document.querySelector('div:has(> .backline-content)')?.offsetHeight || 100) + // BackLine
        (document.querySelectorAll('.content.invisible').length * viewportHeight) + // 5 invisible Hero sections
        (document.querySelector('footer')?.offsetHeight || 0); // Footer

      document.body.style.minHeight = `${estimatedTotalContentHeight + viewportHeight * 0.5}px`;
    };

    calculateTriggerPoint();
    window.addEventListener('resize', calculateTriggerPoint);
    window.addEventListener('load', calculateTriggerPoint);

    // Cleanup
    return () => {
      window.removeEventListener('resize', measureNavbarHeight);
      window.removeEventListener('resize', calculateTriggerPoint);
      window.removeEventListener('load', calculateTriggerPoint);
      document.body.style.minHeight = '';
    };
  }, []); // [] agar hanya berjalan sekali saat mount dan tidak re-run berlebihan

  return (
    <>

      {/* OUR TEAM Header: Teruskan tinggi Navbar sebagai topOffset */}
      {/* Pastikan z-index OurTeamHeader lebih rendah dari Navbar jika Navbar juga fixed/sticky */}
      <OurTeamHeader triggerScroll={headerTriggerScrollPoint} topOffset={actualNavbarHeight} />

      {/* Navbar: Beri ref dan pastikan z-index-nya lebih tinggi */}
      <div className="navbar relative z-[1002]" ref={navbarRef}>
        <Navbar />
      </div>

      <div className="content">
        <Hero />
      </div>
    
      {/* Placeholder untuk Cards. */}
      <div style={{ height: 'calc(100vh + 40px)' }}>
        <div className="cards">
          <Cards />
        </div>
      </div>

  
      {/* Spacer scroll area */}
      <div className="space-y-10">
        <div className="content p-30 invisible h-screen">
          <Hero />
        </div>
        <div className="content p-30 invisible h-screen">
          <Hero />
        </div>
        <div className="content p-30 invisible h-screen">
          <Hero />
        </div>
        <div className="content p-30 invisible h-screen">
          <Hero />
        </div>
        <div className="content p-30 invisible h-screen">
          <Hero />
        </div>
      </div>

    </>
  );
}

export default App;
