"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import styles from './Dashboard.module.css'; // Import CSS Module
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'; // Sesuaikan path

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ 
    cvCount: 0, 
    analysisCount: 0, 
    applications: {
      applied: 0,
      interview: 0,
      offered: 0,
      rejected: 0
    } 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);

      // Fetch CV and Analysis Counts
      const { count: cvCount } = await supabase.from('user_cvs').select('*', { count: 'exact', head: true });
      const { count: analysisCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true });

      // Fetch Job Application Counts
      const { count: applied } = await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Applied');
      const { count: interview } = await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Interview');
      const { count: offered } = await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Offered');
      const { count: rejected } = await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Rejected');

      setStats({
        cvCount: cvCount || 0,
        analysisCount: analysisCount || 0,
        applications: {
          applied: applied || 0,
          interview: interview || 0,
          offered: offered || 0,
          rejected: rejected || 0
        }
      });
      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <Layout> {/* Penting: Bungkus loading state dengan Layout juga */}
             <LoadingSpinner message="Memuat Dashboard Anda..." /> {/* Atau pesan spesifik lainnya */}
      </Layout>
    );
  }

  // Calculate success rate (excluding applied from calculation)
  // Ubah 'applied' menjadi total lamaran yang melalui proses (interview, offered, rejected) untuk basis perhitungan
  const totalProcessed = stats.applications.interview + stats.applications.offered + stats.applications.rejected;
  const successRate = totalProcessed > 0 
    ? Math.round((stats.applications.offered / totalProcessed) * 100) 
    : 0;

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Selamat Datang, {user?.user_metadata.full_name || user?.email}!</h1>
          <p className={styles.headerSubtitle}>Ini adalah pusat kendali karier Anda.</p>
        </div>

        <div className={styles.statsGrid}>
          {/* CV Dibuat Card */}
          <Link href="/my-cvs" className={styles.cardLink}>
            <div className={styles.statCard}>
              <h3 className={styles.statLabel}>CV Dibuat</h3>
              <p className={styles.statValueBlue}>{stats.cvCount}</p>
              <p className={styles.statHint}>Lihat semua CV</p>
            </div>
          </Link>

          {/* Analisis Dilakukan Card */}
          <Link href="/history" className={styles.cardLink}>
            <div className={styles.statCard}>
              <h3 className={styles.statLabel}>Analisis Dilakukan</h3>
              <p className={styles.statValueGreen}>{stats.analysisCount}</p>
              <p className={styles.statHint}>Lihat riwayat</p>
            </div>
          </Link>

          {/* New CV Analysis Action Card */}
          <div className={styles.statActionCard}>
            <h3 className={styles.statLabel}>Mau Bikin atau Cek Ulang CV-mu?</h3>
            <button onClick={() => router.push('/cv-analyze')} className={styles.actionButton}>
              Analisis CV
            </button>
             <button onClick={() => router.push('/cv-analyze')} className={styles.actionButton}>
             Susun CV Baru
            </button>
            <p className={styles.statHint}></p>
          </div>

          {/* Application Summary Card */}
          <Link href="/job-tracker" className={styles.cardLink}>
            <div className={styles.applicationCard}>
              <h3 className={styles.statLabel}>Statistik Lamaran</h3>
              <div className={styles.applicationProgress}>
                <div className={styles.progressBar}>
                  {/* Perhitungan width untuk progress bar harus lebih akurat dan berdasarkan proporsi total aplikasi */}
                  <div 
                    className={styles.progressApplied} 
                    style={{ width: `${(stats.applications.applied / (stats.applications.applied + stats.applications.interview + stats.applications.offered + stats.applications.rejected || 1)) * 100}%` }}
                  ></div>
                  <div 
                    className={styles.progressInterview} 
                    style={{ width: `${(stats.applications.interview / (stats.applications.applied + stats.applications.interview + stats.applications.offered + stats.applications.rejected || 1)) * 100}%` }}
                  ></div>
                  <div 
                    className={styles.progressOffered} 
                    style={{ width: `${(stats.applications.offered / (stats.applications.applied + stats.applications.interview + stats.applications.offered + stats.applications.rejected || 1)) * 100}%` }}
                  ></div>
                   <div 
                    className={styles.progressRejected} 
                    style={{ width: `${(stats.applications.rejected / (stats.applications.applied + stats.applications.interview + stats.applications.offered + stats.applications.rejected || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className={styles.progressLabels}>
                  <span>Dikirim</span>
                  <span>Interview</span>
                  <span>Diterima</span>
                  <span>Ditolak</span>
                </div>
              </div>
              <div className={styles.applicationStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.applications.applied}</span>
                  <span className={styles.statText}>Total</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.applications.interview}</span>
                  <span className={styles.statText}>Interview</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{stats.applications.offered}</span>
                  <span className={styles.statText}>Diterima</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{successRate}%</span>
                  <span className={styles.statText}>Sukses</span>
                </div>
              </div>
              <p className={styles.viewDetails}>Kelola lamaran &rarr;</p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 