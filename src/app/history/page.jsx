"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './History.module.css';
import Layout from '../components/Layout/Layout';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import { FiSearch, FiArrowDown, FiArrowUp, FiCalendar, FiBriefcase, FiAward, FiTrash2, FiEye } from 'react-icons/fi';

const HistoryPage = () => {
  const router = useRouter();
  const [allHistory, setAllHistory] = useState([]);
  const [filteredAndSortedHistory, setFilteredAndSortedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [allHistory, searchTerm, sortColumn, sortDirection]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      setLoading(false);
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setAllHistory(data || []);
    } catch (err) {
      console.error("Error fetching history:", err.message);
      setError(err.message || "Failed to load analysis history.");
    } finally {
      setLoading(false);
    }
  };

   const applyFiltersAndSort = () => {
    let currentData = [...allHistory]; // Buat salinan untuk dimanipulasi

    // 1. Filtering
    if (searchTerm) {
      currentData = currentData.filter(item => 
        item.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.overall_score?.toString().includes(searchTerm) // Opsional: cari berdasarkan skor
      );
    }

    // 2. Sorting
    currentData.sort((a, b) => {
      let valA, valB;

      // Handle null/undefined values by treating them as empty strings or 0
      const getComparableValue = (item, column) => {
        if (column === 'overall_score') {
          return item[column] || 0; // Treat null score as 0 for sorting
        }
        return item[column]?.toLowerCase() || ''; // Treat null/undefined strings as empty for sorting
      };
      
      valA = getComparableValue(a, sortColumn);
      valB = getComparableValue(b, sortColumn);

      if (valA < valB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredAndSortedHistory(currentData);
  };


  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <FiArrowUp className={styles.sortIcon} /> : <FiArrowDown className={styles.sortIcon} />;
    }
    return null;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this analysis history?")) {
      setIsDeleting(true);
      try {
        const { error: deleteError } = await supabase
          .from('analysis_history')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;
        
        setAllHistory(currentHistory => currentHistory.filter(item => item.id !== id));
        alert("History deleted successfully.");
      } catch (err) {
        console.error("Error deleting history:", err.message);
        alert("Failed to delete history: " + (err.message || "Unknown error occurred."));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner message="Loading Your CV Analysis History..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h3>Error Loading History</h3>
            <p>{error}</p>
            <button 
              onClick={fetchHistory} 
              className={styles.retryButton}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.pageContainer}>
        <div className={styles.header}>
<h1>Riwayat Analisis CV</h1>
          <p className={styles.subtitle}>Lihat kembali hasil analisis CV Anda sebelumnya.</p>
        </div>
        
        {/* Controls Section */}
        <div className={styles.controlsSection}>
          <div className={styles.searchWrapper}>
            <div className={styles.searchInputContainer}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Telusuri berdasarkan nama perusahaan, jabatan, atau nilai..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className={styles.clearSearchButton}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className={styles.sortWrapper}>
            <div className={styles.sortGroup}>
              <label className={styles.sortLabel}>Urutkan Berdasarkan:</label>
              <div className={styles.sortButtons}>
                <button
                  onClick={() => handleSort('created_at')}
                  className={`${styles.sortButton} ${sortColumn === 'created_at' ? styles.activeSort : ''}`}
                >
                  <FiCalendar /> Waktu {getSortIcon('created_at')}
                </button>
                <button
                  onClick={() => handleSort('company_name')}
                  className={`${styles.sortButton} ${sortColumn === 'company_name' ? styles.activeSort : ''}`}
                >
                  <FiBriefcase /> Perusahaan {getSortIcon('company_name')}
                </button>
                <button
                  onClick={() => handleSort('overall_score')}
                  className={`${styles.sortButton} ${sortColumn === 'overall_score' ? styles.activeSort : ''}`}
                >
                  <FiAward /> Score {getSortIcon('overall_score')}
                </button>
                  <button 
    onClick={() => router.push('/cv-analyze')}
    className={styles.analyzeButton} // Tambahkan styling di CSS
  >
    + Analisis CV
  </button>
              </div>
              
            </div>
          </div>
          
        </div>

        {/* Results Section */}
        <div className={styles.resultsSection}>
          {filteredAndSortedHistory.length === 0 ? (
            <div className={styles.emptyState}>
              {searchTerm ? (
                <>
                  <h3>Tidak Ada Data yang di temukan</h3>
                  <p>Riwayat analisis tidak ditemukan sesuai pencarian Anda.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className={styles.clearFiltersButton}
                  >
Bersihikan Pencarian                  </button>
                </>
              ) : (
                <>
                  <h3>Kamu belum punya riwayat analisis.</h3>
                  <p>Yuk, analisis CV pertamamu untuk mulai!</p>
                  <Link href="/cv-analyze" className={styles.primaryButton}>
                    Analisis Sekarang
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className={styles.historyList}>
              {filteredAndSortedHistory.map((item) => (
                <div key={item.id} className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.companyName}>
                      {item.company_name || 'General Analysis'}
                    </h3>
                    <div className={styles.scoreBadge}>
                      <span>Score:</span>
                      <span className={styles.scoreValue}>{item.overall_score}</span>
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <p className={styles.jobTitle}>
                      {item.job_title || 'No specific position'}
                    </p>
                    
                    <div className={styles.metaInfo}>
                      <span className={styles.dateInfo}>
                        <FiCalendar /> {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <Link 
                      href={`/history/${item.id}`} 
                      className={styles.viewButton}
                    >
                      <FiEye /> Lihat Detail
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className={styles.deleteButton}
                      disabled={isDeleting}
                    >
                      <FiTrash2 /> {isDeleting ? 'Deleting...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;