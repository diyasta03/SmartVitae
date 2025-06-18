// src/app/admin/users/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; // Sesuaikan path
import Layout from '../../components/Layout/Layout'; // Sesuaikan path
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'; // Sesuaikan path
import styles from '../styles/AdminList.module.css'; // Sesuaikan path (Anda sudah punya ini)
import Link from 'next/link';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Untuk ikon sorting

const AdminUsersListPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]); // Data pengguna yang belum difilter/diurutkan
  const [filteredAndSortedUsers, setFilteredAndSortedUsers] = useState([]); // Data yang ditampilkan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // Default sort column
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction
  const [isDeleting, setIsDeleting] = useState(false); // State untuk loading penghapusan

  // Fungsi untuk mengambil semua pengguna
  const fetchAllUsers = async () => {
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

      // --- Mengambil SEMUA Pengguna Melalui Fungsi Admin (SECURITY DEFINER) ---
      const { data: allUsers, error: rpcError } = await supabase.rpc('get_admin_all_users'); // Pastikan fungsi ini ada di Supabase

      if (rpcError) {
        throw new Error(`Gagal mengambil daftar pengguna: ${rpcError.message || 'Error tidak diketahui dari RPC.'}`);
      }

      setUsers(allUsers || []); // Simpan data mentah
    } catch (err) {
      console.error('Admin Users List Error:', err);
      setError(err.message || 'Gagal memuat daftar pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [router]); // Router sebagai dependensi

  // Efek untuk memfilter dan mengurutkan pengguna
  useEffect(() => {
    let currentUsers = [...users];

    // 1. Filtering
    if (searchTerm) {
      currentUsers = currentUsers.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sorting
    currentUsers.sort((a, b) => {
      let valA, valB;

      const getComparableValue = (item, column) => {
        if (column === 'created_at' || column === 'last_sign_in_at') {
          return item[column] ? new Date(item[column]).getTime() : 0; // Treat null dates as 0
        }
        return (item[column] || '').toLowerCase(); // Treat null strings as empty
      };

      valA = getComparableValue(a, sortBy);
      valB = getComparableValue(b, sortBy);

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredAndSortedUsers(currentUsers);
  }, [users, searchTerm, sortBy, sortDirection]);

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
      return sortDirection === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />;
    }
    return null;
  };

  // Fungsi untuk menghapus pengguna
  const handleDeleteUser = async (userIdToDelete) => {
    if (isDeleting) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengguna ini secara permanen? Ini juga akan menghapus SEMUA data terkaitnya (CV, Analisis, Lamaran Kerja). Aksi ini tidak bisa dibatalkan!")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
          throw new Error('Tidak ada sesi aktif atau token akses tidak ditemukan. Silakan login kembali.');
      }

      const response = await fetch(`/api/admin/delete-user`, { // Pastikan URL API Route ini benar
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId: userIdToDelete }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus pengguna via API.');
      }

      alert('Pengguna berhasil dihapus.');
      // Filter dari state users mentah, useEffect akan memicu re-render yang terfilter/sort
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userIdToDelete));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || 'Gagal menghapus pengguna.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner message="Memuat daftar pengguna..." />
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
          <h1>Daftar Pengguna Admin</h1>
          <p>Lihat dan kelola semua akun pengguna di sistem.</p>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari email, nama, atau peran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          {/* Tombol Tambah Pengguna jika admin bisa menambah dari sini */}
          {/* <button onClick={() => router.push('/admin/users/new')} className={styles.addButton}>
            <FiPlus /> Tambah Pengguna Baru
          </button> */}
        </div>

        {filteredAndSortedUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Tidak ada pengguna yang ditemukan.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('email')}>Email {getSortIcon('email')}</th>
                  <th onClick={() => handleSort('full_name')}>Nama Lengkap {getSortIcon('full_name')}</th>
                  <th onClick={() => handleSort('username')}>Username {getSortIcon('username')}</th>
                  <th onClick={() => handleSort('role')}>Peran {getSortIcon('role')}</th>
                  <th onClick={() => handleSort('created_at')}>Dibuat Pada {getSortIcon('created_at')}</th>
                  <th onClick={() => handleSort('last_sign_in_at')}>Terakhir Login {getSortIcon('last_sign_in_at')}</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.full_name || 'N/A'}</td>
                    <td>{user.username || 'N/A'}</td>
                    <td>{user.role}</td>
                    <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    <td>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('id-ID') : 'Tidak Pernah'}</td>
                    <td className={styles.actionButtons}>
                   
                      <button onClick={() => handleDeleteUser(user.id)} disabled={isDeleting} className={styles.deleteButton}>
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

export default AdminUsersListPage;