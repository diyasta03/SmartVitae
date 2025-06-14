"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './History.module.css';
import Navbar from '../components/Navbar/Navbar';  // Corrected the import path

const HistoryPage = () => {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat ini secara permanen?")) {
      try {
        const { error } = await supabase
          .from('analysis_history')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        // Hapus item dari state agar UI langsung update tanpa refresh
        setHistory(currentHistory => currentHistory.filter(item => item.id !== id));
        alert("Riwayat berhasil dihapus.");
      } catch (err) {
        alert("Gagal menghapus riwayat: " + err.message);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
<div>
                          <Navbar />

    <div className={styles.pageContainer}>
        <h1 className={styles.headerTitle}>Riwayat Analisis CV</h1>
        <div className={styles.listContainer}>
            {history.length === 0 ? (
                <p className="text-center text-gray-500 p-8">Anda belum memiliki riwayat analisis.</p>
            ) : (
                <div className="space-y-4">
                {history.map((item) => (
                    <div key={item.id} className={styles.historyItem}>
                        <div className={styles.historyDetails}>
                            <p className="font-semibold text-lg text-gray-800">
                              {item.company_name || 'Analisis Umum'}
                            </p>
                            <p className="text-md text-gray-600">
                              {item.job_title || 'Tanpa Posisi Spesifik'}
                            </p>
                            <div className={styles.metaInfo}>
                                <span>Skor: <span className="font-bold text-blue-600">{item.overall_score}</span></span>
                                <span>|</span>
                                <span>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                        <div className={styles.historyActions}>
                            <Link href={`/history/${item.id}`} className={styles.detailButton}>Detail</Link>
                            <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Hapus</button>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
    </div>
    </div>
  );
};

export default HistoryPage;