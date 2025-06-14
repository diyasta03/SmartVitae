"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
// Kita gunakan kembali style dari halaman analisis utama untuk konsistensi
import styles from '../../cv-analyze/CVOptimizer.module.css';
import Navbar from '../../components/Navbar/Navbar';  // Corrected the import path

const HistoryDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [analysisResult, setAnalysisResult] = useState(null);
    const [jobContext, setJobContext] = useState({ company: '', title: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
      const [isLoading, setIsLoading] = useState(false);
    
    // State untuk mengontrol tab yang aktif
    const [activeTab, setActiveTab] = useState('overview');
const handleDownloadReport = async () => {
    if (!analysisResult) {
      setError("Data analisis tidak ditemukan untuk membuat laporan.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult }),
      });
  
      if (!response.ok) {
        let errorMessage = 'Gagal membuat Laporan PDF.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || errorMessage;
        } catch (e) { /* Abaikan jika error bukan JSON */ }
        throw new Error(errorMessage);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Laporan_Analisis_CV_SmartVitae.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  
    } catch (err) {
      setError(err.message);
      console.error("Download error:", err);
    } finally {
      setIsLoading(false);
    }
  };
    useEffect(() => {
        if (!id) {
            setError('ID riwayat tidak ditemukan.');
            setLoading(false);
            return;
        }

        const fetchHistoryDetail = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('analysis_history')
                    .select('analysis_result, company_name, job_title')
                    .eq('id', id)
                    .eq('user_id', session.user.id) // Pastikan pengguna hanya bisa akses miliknya
                    .single(); // .single() untuk mengambil satu baris saja

                if (error) throw error;
                
                if (data) {
                    setAnalysisResult(data.analysis_result);
                    setJobContext({ company: data.company_name, title: data.job_title });
                } else {
                    setError('Riwayat analisis tidak ditemukan atau Anda tidak memiliki akses.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryDetail();
    }, [id, router]);

    // Fungsi render progress bar kita copy dari CVUploadForm
    const renderProgressBar = (score) => {
        let color;
        if (score >= 80) color = '#4CAF50';
        else if (score >= 60) color = '#FFC107';
        else color = '#F44336';
        
        return (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar} style={{ width: `${score}%`, backgroundColor: color }}></div>
            <span className={styles.progressText}>{score}%</span>
          </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Memuat Detail Laporan...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div>

        <div className={styles.container}>
            
            <div className="mb-8">
                <Link href="/history" className="text-blue-500 hover:underline">&larr; Kembali ke Riwayat</Link>
                <h1 className="text-3xl font-bold mt-2">Detail Analisis</h1>
                <p className="text-xl text-gray-600">
                    Untuk Posisi <strong>{jobContext.title || 'N/A'}</strong> di <strong>{jobContext.company || 'Perusahaan Umum'}</strong>
                </p>
            </div>
            
            {analysisResult && (
                <div className={styles.resultContainer}>
                    <div className={styles.resultHeader}>
                        <div>
                            <h3 className={styles.resultTitle}><i className={`${styles.resultTitleIcon} fas fa-chart-pie`}></i> Hasil Analisis CV</h3>
                            <p className={styles.resultSubtitle}><i className={`${styles.subtitleIcon} fas fa-user-tie`}></i> Berdasarkan deskripsi pekerjaan Anda</p>
                        </div>
                        <div className={styles.overallScore}>
                            <div className={styles.scoreCircle} style={{ '--score-percent': `${analysisResult.overallScore}%` }}>
                                {analysisResult.overallScore >= 80 ? <i className={`${styles.scoreEmoji} fas fa-trophy`}></i> : analysisResult.overallScore >= 60 ? <i className={`${styles.scoreEmoji} fas fa-thumbs-up`}></i> : <i className={`${styles.scoreEmoji} fas fa-lightbulb`}></i>}
                                <span className={styles.scoreValue}>{analysisResult.overallScore}</span>
                                <span className={styles.scoreLabel}>Skor</span>
                            </div>
                            <p className={styles.scoreDescription}>
                                <i className={`${styles.descriptionIcon} fas ${analysisResult.overallScore >= 80 ? "fa-smile" : analysisResult.overallScore >= 60 ? "fa-meh" : "fa-frown"}`}></i>
                                {analysisResult.overallScore >= 80 ? "Sangat Baik! CV Anda sudah cukup kuat." : analysisResult.overallScore >= 60 ? "Cukup Baik, tetapi masih bisa ditingkatkan." : "Perlu banyak perbaikan untuk bersaing."}
                            </p>
                        </div>
                    </div>

                    <div className={styles.tabs}>
                        <button className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`} onClick={() => setActiveTab('overview')}>Ringkasan</button>
                        <button className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`} onClick={() => setActiveTab('categories')}>Kategori</button>
                        <button className={`${styles.tab} ${activeTab === 'keywords' ? styles.activeTab : ''}`} onClick={() => setActiveTab('keywords')}>Kata Kunci</button>
                        <button className={`${styles.tab} ${activeTab === 'actions' ? styles.activeTab : ''}`} onClick={() => setActiveTab('actions')}>Tindakan</button>
                    </div>

                    <div className={styles.tabContent}>
                        {/* Di sini kita copy-paste semua logika tampilan tab dari CVUploadForm.jsx */}
                        {activeTab === 'overview' && (
                            <div className={styles.overviewContent}>
                               <section className={styles.section}><h4 className={styles.sectionTitle}><i className={`${styles.sectionIcon} fas fa-award`}></i> Kekuatan Utama</h4>
                  <ul className={styles.strengthsList}>
                    {(analysisResult.categories || []).filter(c => c.score >= 80).length > 0 ? ((analysisResult.categories || []).filter(c => c.score >= 80).map((cat, index) => (
                      <li key={index} className={styles.strengthItem}><i className={`${styles.listIcon} fas fa-check-circle`}></i><div><strong>{cat.name}</strong><p>{cat.description}</p></div></li>
                    ))) : <li className={styles.noItems}><i className={`${styles.listIcon} fas fa-info-circle`}></i>Tidak ada kategori dengan skor tinggi</li>}
                  </ul>
                </section>
                <section className={styles.section}><h4 className={styles.sectionTitle}><i className={`${styles.sectionIcon} fas fa-tools`}></i> Area Perbaikan</h4>
                  <ul className={styles.improvementList}>
                    {(analysisResult.categories || []).filter(c => c.score < 70).length > 0 ? ((analysisResult.categories || []).filter(c => c.score < 70).map((cat, index) => (
                      <li key={index} className={styles.improvementItem}><i className={`${styles.listIcon} fas fa-arrow-up`}></i><div><strong>{cat.name} ({cat.score}%)</strong><p>{cat.description}</p>
                      {(cat.suggestions || []).length > 0 && (<div className={styles.quickTips}><i className={`${styles.tipIcon} fas fa-lightbulb`}></i>{cat.suggestions[0].text || cat.suggestions[0]}</div>)}</div></li>
                    ))) : <li className={styles.noItems}><i className={`${styles.listIcon} fas fa-check-circle`}></i>Semua kategori sudah cukup baik!</li>}
                  </ul>
                </section>
                            </div>
                        )}
                        {activeTab === 'categories' && (
                            <div className={styles.categoriesContent}>
                                {(analysisResult.categories || []).map((category, index) => (
                                    <article key={index} className={styles.categoryCard}>
                                        <div className={styles.categoryHeader}>
                                            <div><h5 className={styles.categoryName}>{category.name}</h5><p className={styles.categoryScore}>Skor: {category.score}/100</p></div>
                                            {renderProgressBar(category.score)}
                                        </div>
                                        <p className={styles.categoryDescription}>{category.description}</p>
                                        {(category.suggestions || []).length > 0 && (
                                            <div className={styles.suggestions}>
                                                <h6 className={styles.suggestionsTitle}>Rekomendasi:</h6>
                                                <ul className={styles.suggestionsList}>
                                                    {(category.suggestions || []).map((suggestion, i) => (<li key={i} className={styles.suggestionItem}>{suggestion.text || suggestion}</li>))}
                                                </ul>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                        {activeTab === 'keywords' && (
                             <div className={styles.keywordsContent}>
 <section className={styles.section}><h4 className={styles.sectionTitle}><i className={`${styles.sectionIcon} fas fa-search`}></i> Kata Kunci yang Hilang</h4>
                  <div className={styles.keywordsGrid}>
                    {(analysisResult.missingKeywords || []).length > 0 ? ((analysisResult.missingKeywords || []).map((keyword, index) => (<div key={index} className={styles.keywordPill}><i className={`${styles.keywordIcon} fas fa-hashtag`}></i>{keyword}</div>))) : <div className={styles.noKeywords}><i className={`${styles.keywordIcon} fas fa-check-circle`}></i>CV Anda sudah mencakup semua kata kunci penting!</div>}
                  </div>
                </section>                            </div>
                        )}
                        {activeTab === 'actions' && (
                            <div className={styles.actionsContent}>
  <section className={styles.section}><h4 className={styles.sectionTitle}><i className={`${styles.sectionIcon} fas fa-rocket`}></i> Rencana Tindakan</h4>
                  <div className={styles.actionsList}>
                    {(analysisResult.actionItems || []).map((action, index) => (<div key={index} className={styles.actionItem}><div className={styles.actionNumber}>{index + 1}</div><div className={styles.actionText}><i className={`${styles.actionIcon} fas fa-chevron-right`}></i>{action.text || action}</div></div>))}
                  </div>
                </section>
                <div className={styles.finalActionBox}>
                  <h5 className={styles.finalActionTitle}>Simpan Hasil Analisis</h5>
                  <p className={styles.finalActionDescription}>Unduh laporan lengkap berisi skor, analisis, dan semua saran perbaikan dalam format PDF yang rapi.</p>
                  <button className={styles.submitButton} onClick={handleDownloadReport} disabled={isLoading}>
                    {isLoading ? (
                      <><i className={`${styles.spinner} fas fa-spinner`}></i> Membuat Laporan...</>
                    ) : (
                      <><i className={`${styles.buttonIcon} fas fa-file-pdf`}></i> Unduh Laporan Analisis</>
                    )}
                  </button>
                </div>                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default HistoryDetailPage;