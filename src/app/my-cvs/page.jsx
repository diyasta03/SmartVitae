"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import styles from './MyCvs.module.css';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiClock, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout/Layout';

const MyCvsPage = () => {
  const router = useRouter();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCvs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_cvs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCvs(data || []);
      } catch (err) {
        setError(err.message);
        toast.error('Gagal memuat CV: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, [router]);

  const handleDeleteCv = async (id, cvName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus CV "${cvName}" secara permanen?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase.from('user_cvs').delete().eq('id', id);
      if (error) throw error;
      setCvs(currentCvs => currentCvs.filter(cv => cv.id !== id));
      toast.success(`CV "${cvName}" berhasil dihapus`);
    } catch (err) {
      toast.error("Gagal menghapus CV: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCvs = cvs.filter(cv =>
    cv.cv_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && cvs.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Memuat CV Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>!</div>
        <h3>Terjadi Kesalahan</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
        <Layout>

    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FiFileText className={styles.titleIcon} />
            Daftar CV Saya
          </h1>
          <div className={styles.actions}>
            <div className={styles.searchBar}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Cari berdasarkan nama CV..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/cv-maker" className={styles.newCvButton}>
              <FiPlus className={styles.buttonIcon} />
              Buat CV Baru
            </Link>
          </div>
        </div>
      </div>
      
      <main className={styles.mainContent}>
        {cvs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <FiFileText size={48} />
            </div>
            <h3 className={styles.emptyTitle}>Anda Belum Memiliki CV</h3>
            <p className={styles.emptyDescription}>
              Mulai buat CV profesional Anda sekarang untuk melangkah ke dunia profesional
            </p>
            <Link href="/cv-maker" className={styles.emptyActionButton}>
              <FiPlus className={styles.buttonIcon} />
              Buat CV Pertama Anda
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.resultsInfo}>
              <p>
                Menampilkan <strong>{filteredCvs.length}</strong> dari <strong>{cvs.length}</strong> CV
                {searchTerm && (
                  <span> untuk pencarian "<strong>{searchTerm}</strong>"</span>
                )}
              </p>
            </div>
            
            <div className={styles.cvGrid}>
              {filteredCvs.map((cv) => (
                <div key={cv.id} className={styles.cvCard}>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{cv.cv_name}</h2>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardDate}>
                        <FiClock className={styles.metaIcon} />
                        {new Date(cv.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <button 
                      onClick={() => handleDeleteCv(cv.id, cv.cv_name)} 
                      className={styles.deleteButton}
                      disabled={isDeleting}
                    >
                      <FiTrash2 className={styles.buttonIcon} />
                      {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </button>
                    <Link 
                      href={`/my-cvs/${cv.id}`} 
                      className={styles.detailButton}
                    >
                      <FiEdit2 className={styles.buttonIcon} />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredCvs.length === 0 && searchTerm && (
              <div className={styles.noResults}>
                <FiSearch size={32} />
                <h4>CV tidak ditemukan</h4>
                <p>
                  Tidak ada CV dengan nama "<strong>{searchTerm}</strong>".
                  Coba dengan kata kunci lain atau buat CV baru.
                </p>
                <button 
                  onClick={() => setSearchTerm('')} 
                  className={styles.clearSearchButton}
                >
                  Tampilkan Semua CV
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
        </Layout>

  );
};

export default MyCvsPage;