// src/app/admin/cvs/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; // PASTIKAN PATH INI BENAR
import Layout from '../../components/Layout/Layout'; // PASTIKAN PATH INI BENAR
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'; // PASTIKAN PATH INI BENAR
import styles from '../styles/AdminList.module.css'; // Sesuaikan path (Anda sudah punya ini)
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';

const AdminCVsListPage = () => {
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false); // PASTIKAN BARIS INI ADA

  // Fungsi untuk mengambil semua CV
  const fetchAllCVs = async () => {
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

      // --- Mengambil SEMUA CV Melalui Fungsi Admin (SECURITY DEFINER) ---
      const { data: allCVs, error: rpcError } = await supabase.rpc('get_admin_all_cvs'); // Pastikan fungsi ini ada di Supabase

      if (rpcError) {
        throw new Error(`Gagal mengambil daftar CV: ${rpcError.message || 'Error tidak diketahui dari RPC.'}`);
      }

      setCvs(allCVs || []);
    } catch (err) {
      console.error('Admin CVs List Error:', err);
      setError(err.message || 'Gagal memuat daftar CV.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCVs();
  }, [router]);

  // Fungsi untuk menghapus CV
  const handleDeleteCV = async (cvId) => {
    if (isDeleting) return; // Mencegah klik ganda saat sudah menghapus
    if (!window.confirm("Apakah Anda yakin ingin menghapus CV ini secara permanen? Aksi ini tidak bisa dibatalkan!")) {
      return;
    }

    setIsDeleting(true); // Mulai loading state hapus
    try {
      const { data: { session } } = await supabase.auth.getSession(); // Ambil sesi untuk token

      if (!session?.access_token) {
          throw new Error('Tidak ada sesi aktif atau token akses tidak ditemukan. Silakan login kembali.');
      }

      // Panggil Next.js API Route untuk menghapus CV
      const response = await fetch(`/api/admin/delete-cv`, { // Pastikan URL API Route ini benar
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Kirim token untuk verifikasi admin di API Route
        },
        body: JSON.stringify({ cvId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus CV via API.');
      }

      alert('CV berhasil dihapus.');
      setCvs(cvs.filter(cv => cv.id !== cvId)); // Update UI secara instan
    } catch (err) {
      console.error("Error deleting CV:", err);
      setError(err.message || 'Gagal menghapus CV.');
    } finally {
      setIsDeleting(false); // Akhiri loading state hapus
    }
  };

  // Logika filter pencarian
  const filteredCvs = cvs.filter(cv =>
    (cv.cv_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cv.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) // Asumsi cv_name dan user_email ada di data dari RPC
  );

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Memuat daftar CV..." />
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
          <h1>Daftar CV Admin</h1>
          <p>Lihat dan kelola semua CV yang dibuat di sistem.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama CV atau email pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          {/* Tombol Tambah CV jika admin bisa menambah dari sini */}
          {/* <button onClick={() => router.push('/admin/cvs/new')} className={styles.addButton}>
            <FiPlus /> Tambah CV Baru
          </button> */}
        </div>

        {filteredCvs.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Tidak ada CV yang ditemukan.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID CV</th>
                  <th>Nama CV</th>
                  <th>Pemilik (Email)</th>
                  <th>Dibuat Pada</th>
                  <th>Aksi</th>
                </tr>
              </thead>
             <tbody>
            {filteredCvs.map(cv => (
              <tr key={cv.id}> {/* Baris ini */}
                <td>{String(cv.id).substring(0, 8)}...</td> {/* Dan baris ini */}
                <td>{cv.cv_name || 'Untitled CV'}</td>
                <td>{cv.user_email || 'Tidak Diketahui'}</td>
                <td>{new Date(cv.created_at).toLocaleDateString('id-ID')}</td>
                <td className={styles.actionButtons}>
                
                  <button onClick={() => handleDeleteCV(cv.id)} disabled={isDeleting} className={styles.deleteButton}>
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

export default AdminCVsListPage;