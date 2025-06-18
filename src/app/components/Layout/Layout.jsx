"use client";
import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Fungsi untuk memeriksa ukuran layar
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      setIsMobile(true);
      setSidebarOpen(false); // Otomatis tutup sidebar saat masuk mode mobile
    } else {
      setIsMobile(false);
      setSidebarOpen(true); // Buka sidebar di mode desktop
    }
  };

  // Tambahkan event listener saat komponen dimuat
  useEffect(() => {
    // Jalankan saat pertama kali render
    handleResize(); 
    
    window.addEventListener('resize', handleResize);
    
    // Hapus event listener saat komponen dilepas
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      {isMobile && sidebarOpen && (
        <div 
          className={`${styles.backdrop} ${styles.show}`} 
          onClick={toggleSidebar}
        ></div>
      )}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
      />
      {/* Untuk desktop, class 'sidebarClosed' akan ditambahkan saat sidebar ditutup.
        Di mobile, class ini tidak berpengaruh karena margin-left selalu 0.
      */}
      <main className={`${styles.main} ${!sidebarOpen && !isMobile ? styles.sidebarClosed : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;