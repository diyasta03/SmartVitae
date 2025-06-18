// pages/admin/dashboard.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import styles from './AdminDashboard.module.css';
import Link from 'next/link';

// Ikon untuk dashboard
import { FiUsers, FiFileText, FiBarChart2, FiBriefcase, FiClock, FiArrowRight } from 'react-icons/fi';

// Chart.js
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboardPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    userCount: 0,
    cvCount: 0,
    analysisCount: 0,
    jobApplicationCount: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCVs, setRecentCVs] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [chartData, setChartData] = useState({
    cvsOverTime: { labels: [], datasets: [] },
    registrationsOverTime: { labels: [], datasets: [] },
    applicationStatus: { labels: [], datasets: [] },
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Pengecekan peran admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        // Ambil data dashboard
        const { data: dashboardData, error: rpcError } = await supabase.rpc('get_admin_dashboard_data');

        if (rpcError) throw rpcError;

        // Set state data
        setStats({
          userCount: dashboardData.userCount || 0,
          cvCount: dashboardData.cvCount || 0,
          analysisCount: dashboardData.analysisCount || 0,
          jobApplicationCount: dashboardData.allApplicationStatuses?.length || 0,
        });

        setRecentUsers(dashboardData.recentUsers || []);
        setRecentCVs(dashboardData.recentCVs || []);
        setRecentAnalyses(dashboardData.recentAnalyses || []);

        // Proses data grafik
        processChartData(
          dashboardData.allCvsCreatedDates,
          dashboardData.allUsersCreatedDates,
          dashboardData.allApplicationStatuses
        );

      } catch (err) {
        setError(err.message || 'Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  // Helper function untuk memproses data grafik
  const processChartData = (allCvs, allUsersCreatedDates, allApplications) => {
    // CVs Created Over Time
    const cvsByMonth = {};
    (allCvs || []).forEach(dateStr => {
      const month = new Date(dateStr).toLocaleString('id-ID', { year: 'numeric', month: 'short' });
      cvsByMonth[month] = (cvsByMonth[month] || 0) + 1;
    });
    
    const sortedCvsMonths = Object.keys(cvsByMonth).sort((a, b) => new Date(a) - new Date(b));
    const cvsChart = {
      labels: sortedCvsMonths,
      datasets: [{
        label: 'CV Dibuat',
        data: sortedCvsMonths.map(month => cvsByMonth[month]),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
        tension: 0.1,
        fill: true
      }]
    };

    // User Registrations Over Time
    const usersByMonth = {};
    (allUsersCreatedDates || []).forEach(dateStr => {
      const month = new Date(dateStr).toLocaleString('id-ID', { year: 'numeric', month: 'short' });
      usersByMonth[month] = (usersByMonth[month] || 0) + 1;
    });
    
    const sortedUsersMonths = Object.keys(usersByMonth).sort((a, b) => new Date(a) - new Date(b));
    const registrationsChart = {
      labels: sortedUsersMonths.length ? sortedUsersMonths : ['Tidak ada data'],
      datasets: [{
        label: 'Pendaftaran',
        data: sortedUsersMonths.length ? sortedUsersMonths.map(month => usersByMonth[month]) : [0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        tension: 0.1,
        fill: true
      }]
    };

    // Application Status Distribution
    const statusCounts = { 'Dikirim': 0, 'Interview': 0, 'Diterima': 0, 'Ditolak': 0, 'Lainnya': 0 };
    (allApplications || []).forEach(status => {
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts['Lainnya']++;
      }
    });

    const applicationStatusChart = {
      labels: Object.keys(statusCounts),
      datasets: [{
        label: 'Status Lamaran',
        data: Object.values(statusCounts),
        backgroundColor: [
          '#4f46e5', // Dikirim
          '#f59e0b', // Interview
          '#10b981', // Diterima
          '#ef4444', // Ditolak
          '#6b7280'  // Lainnya
        ],
        borderWidth: 0
      }]
    };

    setChartData({
      cvsOverTime: cvsChart,
      registrationsOverTime: registrationsChart,
      applicationStatus: applicationStatusChart,
    });
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Memuat Dashboard Admin..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <h3 className={styles.errorTitle}>Terjadi Kesalahan</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Muat Ulang
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        <header className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Dashboard Admin</h1>
          <p className={styles.dashboardSubtitle}>
            Ringkasan statistik dan aktivitas terbaru sistem
          </p>
        </header>

        {/* Statistik Utama */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Ringkasan Statistik</h2>
          <div className={styles.statsGrid}>
            <StatCard 
              icon={<FiUsers size={24} />}
              title="Total Pengguna"
              value={stats.userCount}
              link="/admin/users"
            />
            <StatCard 
              icon={<FiFileText size={24} />}
              title="Total CV Dibuat"
              value={stats.cvCount}
              link="/admin/cvs"
            />
            <StatCard 
              icon={<FiBarChart2 size={24} />}
              title="Total Analisis"
              value={stats.analysisCount}
              link="/admin/analyses"
            />
            <StatCard 
              icon={<FiBriefcase size={24} />}
              title="Total Lamaran"
              value={stats.jobApplicationCount}
              link="/admin/applications"
            />
          </div>
        </section>

        {/* Grafik Data */}
        <section className={styles.chartsSection}>
          <h2 className={styles.sectionTitle}>Visualisasi Data</h2>
          <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <FiFileText className={styles.chartIcon} />
                CV Dibuat per Bulan
              </h3>
              <div className={styles.chartWrapper}>
                <Line 
                  data={chartData.cvsOverTime} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    }
                  }} 
                />
              </div>
            </div>
            
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <FiUsers className={styles.chartIcon} />
                Pendaftaran Pengguna per Bulan
              </h3>
              <div className={styles.chartWrapper}>
                <Line 
                  data={chartData.registrationsOverTime} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    }
                  }} 
                />
              </div>
            </div>
            
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                <FiBriefcase className={styles.chartIcon} />
                Distribusi Status Lamaran
              </h3>
              <div className={styles.chartWrapper}>
                <Pie 
                  data={chartData.applicationStatus} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Aktivitas Terbaru */}
        <section className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Aktivitas Terbaru</h2>
          <div className={styles.recentGrid}>
            <RecentActivityCard 
              title="Pengguna Terbaru"
              icon={<FiUsers />}
              items={recentUsers}
              emptyMessage="Belum ada pengguna baru"
              link="/admin/users"
              itemRenderer={(user) => (
                <>
                  <span>{user.email || 'Pengguna tanpa email'}</span>
                  <span className={styles.dateText}>
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </span>
                </>
              )}
            />
            
            <RecentActivityCard 
              title="CV Terbaru"
              icon={<FiFileText />}
              items={recentCVs}
              emptyMessage="Belum ada CV baru"
              link="/admin/cvs"
              itemRenderer={(cv) => (
                <>
                  <span>{cv.cv_name || 'CV tanpa judul'}</span>
                  <span className={styles.dateText}>
                    {new Date(cv.created_at).toLocaleDateString('id-ID')}
                  </span>
                </>
              )}
            />
            
            <RecentActivityCard 
              title="Analisis Terbaru"
              icon={<FiBarChart2 />}
              items={recentAnalyses}
              emptyMessage="Belum ada analisis baru"
              link="/admin/analyses"
              itemRenderer={(analysis) => (
                <>
                  <span>
                    {analysis.company_name || analysis.job_title || 'Analisis'} 
                    <span className={styles.scoreBadge}>
                      Skor: {analysis.overall_score}
                    </span>
                  </span>
                  <span className={styles.dateText}>
                    {new Date(analysis.created_at).toLocaleDateString('id-ID')}
                  </span>
                </>
              )}
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

// Komponen StatCard yang dapat digunakan kembali
const StatCard = ({ icon, title, value, link }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <h3 className={styles.statTitle}>{title}</h3>
    <p className={styles.statValue}>{value.toLocaleString('id-ID')}</p>
    <Link href={link} className={styles.statLink}>
      Lihat detail <FiArrowRight />
    </Link>
  </div>
);

// Komponen RecentActivityCard yang dapat digunakan kembali
const RecentActivityCard = ({ title, icon, items, emptyMessage, link, itemRenderer }) => (
  <div className={styles.recentCard}>
    <div className={styles.recentHeader}>
      <div className={styles.recentIcon}>{icon}</div>
      <h3 className={styles.recentTitle}>{title}</h3>
    </div>
    
    <div className={styles.recentContent}>
      {items.length === 0 ? (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      ) : (
        <ul className={styles.recentList}>
          {items.map((item, index) => (
            <li key={index} className={styles.recentItem}>
              {itemRenderer(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
    
    {items.length > 0 && (
      <Link href={link} className={styles.recentLink}>
        Lihat semua <FiArrowRight />
      </Link>
    )}
  </div>
);

export default AdminDashboardPage;