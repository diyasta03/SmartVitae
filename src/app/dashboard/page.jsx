"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import JobTracker from '../components/JobTracker';
import styles from './Dashboard.module.css'; // Import CSS Module
import Navbar from '../components/Navbar/Navbar';  // Corrected the import path
import Link from 'next/link'; // Jangan lupa import Link

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ cvCount: 0, analysisCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      const { count: cvCount } = await supabase.from('user_cvs').select('*', { count: 'exact', head: true });
      const { count: analysisCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true });

      setStats({ cvCount: cvCount || 0, analysisCount: analysisCount || 0 });
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="text-center p-10">Loading Dashboard...</div>;
  }

  return (
    <div>
                      <Navbar />

    <div className={styles.pageContainer}>
        
    <div className={styles.header}>
        <h1 className={styles.headerTitle}>Selamat Datang, {user?.user_metadata.full_name || user?.email}!</h1>
        <p className={styles.headerSubtitle}>Ini adalah pusat kendali karier Anda.</p>
      </div>

      {/* --- PERUBAHAN DI SINI --- */}
      <div className={styles.statsGrid}>
        
        {/* Kartu CV Dibuat */}
        <Link href="/my-cvs" className={styles.cardLink}>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>CV Dibuat</h3>
            <p className={styles.statValueBlue}>{stats.cvCount}</p>
          </div>
        </Link>
        
        {/* Kartu Analisis Dilakukan */}
        <Link href="/history" className={styles.cardLink}>
          <div className={styles.statCard}>
            <h3 className={styles.statLabel}>Analisis Dilakukan</h3>
            <p className={styles.statValueGreen}>{stats.analysisCount}</p>
          </div>
        </Link>
        
        {/* Kartu Aksi (tidak perlu link) */}
        <div className={styles.statActionCard}>
            <h3 className={styles.statLabel}>Butuh Analisis Baru?</h3>
            <button onClick={() => router.push('/cv-analyze')} className={styles.actionButton}>
                Analisis CV Sekarang
            </button>
        </div>
      </div>
      {/* --- AKHIR PERUBAHAN --- */}


      <div className={styles.trackerContainer}>
        <h2 className={styles.trackerTitle}>Job Application Tracker</h2>
        <JobTracker />
      </div>
    </div>
    </div>
  );
};

export default DashboardPage;