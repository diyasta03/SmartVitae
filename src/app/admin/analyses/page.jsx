// src/app/admin/analyses/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; // Sesuaikan path
import Layout from '../../components/Layout/Layout'; // Sesuaikan path
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'; // Sesuaikan path
import styles from '../styles/AdminList.module.css'; // Sesuaikan path
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa'; // Untuk ikon sorting

const AdminAnalysesListPage = () => {
  const router = useRouter();
  const [analyses, setAnalyses] = useState([]); // Data analisis yang belum difilter/diurutkan
  const [filteredAndSortedAnalyses, setFilteredAndSortedAnalyses] = useState([]); // Data yang ditampilkan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // Default sort column
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction
  const [isDeleting, setIsDeleting] = useState(false); // State untuk loading penghapusan

  // Fungsi untuk mengambil semua riwayat analisis
  const fetchAllAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.push('/login');
        setLoading(false);
        return;
      }

      // --- Pengecekan Peran Admin ---
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        router.push('/dashboard');
        alert('Akses Ditolak: Anda tidak memiliki izin admin.');
        setLoading(false);
        return;
      }

      // --- Mengambil SEMUA Riwayat Analisis Melalui Fungsi Admin (SECURITY DEFINER) ---
      const { data: allAnalyses, error: rpcError } = await supabase.rpc('get_admin_all_analyses'); // Pastikan fungsi ini ada di Supabase

      if (rpcError) {
        throw new Error(`Gagal mengambil daftar analisis: ${rpcError.message || 'Error tidak diketahui dari RPC.'}`);
      }

      setAnalyses(allAnalyses || []); // Simpan data mentah
    } catch (err) {
      console.error('Admin Analyses List Error:', err);
      setError(err.message || 'Gagal memuat daftar analisis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalyses();
  }, [router]);

  // Efek untuk memfilter dan mengurutkan analisis
  useEffect(() => {
    let currentAnalyses = [...analyses];

    // 1. Filtering
    if (searchTerm) {
      currentAnalyses = currentAnalyses.filter(analysis =>
        analysis.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(analysis.overall_score).includes(searchTerm) // Cari berdasarkan skor juga
      );
    }

    // 2. Sorting
    currentAnalyses.sort((a, b) => {
      let valA, valB;

      const getComparableValue = (item, column) => {
        if (column === 'created_at') {
          return item[column] ? new Date(item[column]).getTime() : 0;
        }
        if (column === 'overall_score') {
          return item[column] || 0; // Treat null score as 0
        }
        return (item[column] || '').toLowerCase();
      };

      valA = getComparableValue(a, sortBy);
      valB = getComparableValue(b, sortBy);

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAndSortedAnalyses(currentAnalyses);
  }, [analyses, searchTerm, sortBy, sortDirection]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc'); // Default to ascending when changing column
    }
  };

  const getSortIcon = (column) => {
    if (sortBy === column) {
      if (column === 'overall_score' || column === 'created_at') {
        return sortDirection === 'asc' ? <FaSortNumericUp /> : <FaSortNumericDown />;
      }
      return sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />;
    }
    return null;
  };

  // Fungsi untuk menghapus riwayat analisis
  const handleDeleteAnalysis = async (analysisId) => {
    if (isDeleting) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus riwayat analisis ini secara permanen? Aksi ini tidak bisa dibatalkan!")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
          throw new Error('Tidak ada sesi aktif atau token akses tidak ditemukan. Silakan login kembali.');
      }

      const response = await fetch(`/api/admin/delete-analysis`, { // Pastikan URL API Route ini benar
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ analysisId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus riwayat analisis via API.');
      }

      alert('Riwayat analisis berhasil dihapus.');
      setAnalyses(prevAnalyses => prevAnalyses.filter(analysis => analysis.id !== analysisId));
    } catch (err) {
      console.error("Error deleting analysis:", err);
      setError(err.message || 'Gagal menghapus riwayat analisis.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Memuat daftar analisis..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <p>Terjadi Kesalahan:</p>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Coba Lagi
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.listPageContainer}>
        <div className={styles.listHeader}>
          <h1>Daftar Riwayat Analisis Admin</h1>
          <p>Lihat dan kelola semua riwayat analisis CV di sistem.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari perusahaan, posisi, skor, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          {/* Tombol Tambah Analisis jika admin bisa menambah dari sini */}
          {/* <button onClick={() => router.push('/admin/analyses/new')} className={styles.addButton}>
            <FiPlus /> Tambah Analisis Baru
          </button> */}
        </div>

        {filteredAndSortedAnalyses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Tidak ada riwayat analisis yang ditemukan.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('company_name')}>Perusahaan {getSortIcon('company_name')}</th>
                  <th onClick={() => handleSort('job_title')}>Posisi {getSortIcon('job_title')}</th>
                  <th onClick={() => handleSort('overall_score')}>Skor {getSortIcon('overall_score')}</th>
                  <th onClick={() => handleSort('user_email')}>Pemilik (Email) {getSortIcon('user_email')}</th>
                  <th onClick={() => handleSort('created_at')}>Dibuat Pada {getSortIcon('created_at')}</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedAnalyses.map(analysis => (
                  <tr key={analysis.id}>
                    <td>{analysis.company_name || 'N/A'}</td>
                    <td>{analysis.job_title || 'N/A'}</td>
                    <td>{analysis.overall_score || 'N/A'}</td>
                    <td>{analysis.user_email || 'Tidak Diketahui'}</td>
                    <td>{new Date(analysis.created_at).toLocaleDateString('id-ID')}</td>
                    <td className={styles.actionButtons}>
                   
                      <button onClick={() => handleDeleteAnalysis(analysis.id)} disabled={isDeleting} className={styles.deleteButton}>
                        {isDeleting ? 'Menghapus...' : <><FiTrash2 /> Hapus</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminAnalysesListPage;