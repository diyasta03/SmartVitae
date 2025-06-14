"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import styles from '../dashboard/Dashboard.module.css'; // Kita bisa pakai style dashboard

const MyCvsPage = () => {
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCvs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Mengambil data dari tabel user_cvs
        const { data, error } = await supabase
          .from('user_cvs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCvs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, [router]);

  if (loading) {
    return <div className="text-center p-10">Loading CV Anda...</div>;
  }

  if (error) {
    return <div className={`${styles.container} ${styles.error}`}>Error: {error}</div>;
  }

  return (
    <div className={styles.pageContainer}>
        <h1 className={styles.headerTitle}>Daftar CV Saya</h1>
        <div className={styles.trackerContainer}>
            {cvs.length === 0 ? (
                <p className="text-center text-gray-500 p-8">
                    Anda belum memiliki CV yang tersimpan.
                </p>
            ) : (
                <div className="space-y-4">
                {cvs.map((cv) => (
                    <div key={cv.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <p className="font-semibold text-lg">{cv.cv_name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Dibuat pada: {new Date(cv.created_at).toLocaleString('id-ID')}
                        </p>
                    </div>
                ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default MyCvsPage;