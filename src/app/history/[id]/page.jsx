"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import styles from '../../cv-analyze/CVOptimizer.module.css'; // Ensure this path is correct relative to this file
import Navbar from '../../components/Navbar/Navbar'; // Ensure this path is correct relative to this file
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner'; // Sesuaikan path

// Import icons from react-icons
import {
   FiArrowLeft, FiUpload, FiClipboard, FiSearch, FiFileText, FiAward, FiTool,
    FiKey, FiCheckCircle, FiAlertCircle, FiChevronRight, FiDownload,
    FiLoader, FiX, FiInfo
} from 'react-icons/fi';
import { FaRegLightbulb, FaRegSmile, FaRegMeh, FaRegFrown, FaRocket } from 'react-icons/fa'; // FaRocket for the Actions tab icon

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HistoryDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [analysisResult, setAnalysisResult] = useState(null);
    const [jobContext, setJobContext] = useState({ company: '', title: '' });
    const [loading, setLoading] = useState(true); // Initial loading state for data fetch
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false); // Loading state specifically for download

    // State to control the active tab
    const [activeTab, setActiveTab] = useState('overview');

    const handleDownloadReport = async () => {
        if (!analysisResult) {
            setError("Data analisis tidak ditemukan untuk membuat laporan.");
            toast.error("Data analisis tidak ditemukan untuk membuat laporan.");
            return;
        }

        setIsDownloading(true);
        setError(null);

        try {
            const response = await fetch('/api/generateReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Ensure the data sent matches what your generateReport API expects
                body: JSON.stringify({ analysisResult, companyName: jobContext.company, jobTitle: jobContext.title }),
            });

            if (!response.ok) {
                let errorMessage = 'Gagal membuat Laporan PDF.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.details || errorData.error || errorMessage;
                } catch (e) { /* Ignore if error is not JSON */ }
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
            toast.success('Laporan berhasil diunduh!');

        } catch (err) {
            setError(err.message);
            console.error("Download error:", err);
            toast.error(err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        if (!id) {
            setError('ID riwayat tidak ditemukan.');
            setLoading(false);
            return;
        }

        const fetchHistoryDetail = async () => {
            setLoading(true); // Start loading when fetching
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
                    .eq('user_id', session.user.id) // Ensure user can only access their own history
                    .single(); // .single() to fetch one row

                if (error) {
                    console.error("Error fetching history detail:", error);
                    throw error;
                }

                if (data) {
                    // Adapt the analysis_result structure to match CVOptimizer's expectations
                    const originalResult = data.analysis_result;

                    // Ensure basic structure exists to prevent errors
                    const categories = originalResult.categories || [];
                    const missingKeywords = originalResult.missingKeywords || [];
                    const actionItems = originalResult.actionItems || [];

                    const adaptedResult = {
                        overallScore: originalResult.overallScore || 0, // Default to 0 if not present
                        categories: categories.map(cat => ({
                            name: cat.name || 'Unknown Category',
                            score: cat.score || 0,
                            description: cat.description || 'No description available.',
                            suggestions: (cat.suggestions || []).map(s => s.text || s) // Ensure suggestions are strings
                        })),
                        missingKeywords: missingKeywords,
                        // Populate strengths and improvements based on categories from the *adapted* categories
                        strengths: categories
                            .filter(c => (c.score || 0) >= 80)
                            .map(c => ({ category: c.name, description: c.description })),
                        improvements: categories
                            .filter(c => (c.score || 0) < 70)
                            .map(c => ({
                                category: c.name,
                                score: c.score,
                                description: c.description,
                                suggestion: (c.suggestions && c.suggestions.length > 0) ? (c.suggestions[0].text || c.suggestions[0]) : null
                            })),
                        actionItems: actionItems
                    };
                    setAnalysisResult(adaptedResult);
                    setJobContext({ company: data.company_name || 'N/A', title: data.job_title || 'N/A' });
                } else {
                    setError('Riwayat analisis tidak ditemukan atau Anda tidak memiliki akses.');
                }
            } catch (err) {
                setError(err.message);
                toast.error(`Gagal memuat detail riwayat: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryDetail();
    }, [id, router]); // Dependency array for useEffect

    const renderScoreCircle = (score) => {
        let color, Icon;
        if (score >= 80) {
            color = '#10B981'; // Green
            Icon = FaRegSmile;
        } else if (score >= 60) {
            color = '#F59E0B'; // Amber
            Icon = FaRegMeh;
        } else {
            color = '#EF4444'; // Red
            Icon = FaRegFrown;
        }

        return (
            <div className={styles.scoreCircleContainer}>
                <div className={styles.scoreCircle} style={{ '--score': `${score}%`, '--color': color }}>
                    <div className={styles.scoreValue}>{score}</div>
                    <div className={styles.scoreLabel}>Skor</div>
                    <Icon className={styles.scoreEmoji} />
                </div>
                <p className={styles.scoreFeedback}>
                    {score >= 80 ? 'Sangat Baik! CV Anda sudah kompetitif.' :
                        score >= 60 ? 'Cukup Baik, tetapi masih bisa ditingkatkan.' :
                            'Perlu banyak perbaikan untuk bersaing.'}
                </p>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
             <LoadingSpinner message="Memuat" /> 
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorAlert}>
                <FiAlertCircle className={styles.errorIcon} />
                <div>
                    <h4>Terjadi Kesalahan</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Navbar could be here, or in your main layout */}
            {/* <Navbar /> */}
<Link href="/history" className={styles.backLink}>
            <FiArrowLeft className={styles.backIcon} /> Kembali
          </Link>
            <header className={styles.header}>
              
                <h1 className={styles.title}>
                    <FiSearch className={styles.titleIcon} />
                    Detail Analisis
                </h1>
                <p className={styles.subtitle}>
                    Untuk Posisi <strong>{jobContext.title || 'N/A'}</strong> di <strong>{jobContext.company || 'Perusahaan Umum'}</strong>
                </p>
            </header>

            {analysisResult && (
                <div className={styles.results}>
                    <div className={styles.resultsHeader}>
                        <div>
                            <h2 className={styles.resultsTitle}>
                                <FiAward className={styles.resultsIcon} />
                                Hasil Analisis CV
                            </h2>
                            <p className={styles.resultsSubtitle}>
                                Berdasarkan deskripsi pekerjaan Anda
                            </p>
                        </div>
                        {renderScoreCircle(analysisResult.overallScore)}
                    </div>

                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            <FiFileText className={styles.tabIcon} />
                            Ringkasan
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'categories' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('categories')}
                        >
                            <FiTool className={styles.tabIcon} />
                            Kategori
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'keywords' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('keywords')}
                        >
                            <FiKey className={styles.tabIcon} />
                            Kata Kunci
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'actions' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('actions')}
                        >
                            <FaRocket className={styles.tabIcon} /> {/* Use FaRocket here */}
                            Tindakan
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'overview' && (
                            <div className={styles.overview}>
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        <FiCheckCircle className={styles.sectionIcon} />
                                        Kekuatan Utama
                                    </h3>
                                    <ul className={styles.strengthsList}>
                                        {(analysisResult.strengths || []).length > 0 ? (
                                            analysisResult.strengths.map((strength, i) => (
                                                <li key={i} className={styles.strengthItem}>
                                                    <FiCheckCircle className={styles.strengthIcon} />
                                                    <div>
                                                        <strong>{strength.category}</strong>
                                                        <p>{strength.description}</p>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className={styles.noItems}>
                                                <FiInfo className={styles.noItemsIcon} />
                                                Tidak ada kategori dengan skor tinggi
                                            </li>
                                        )}
                                    </ul>
                                </section>

                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>
                                        <FiTool className={styles.sectionIcon} />
                                        Area Perbaikan
                                    </h3>
                                    <ul className={styles.improvementsList}>
                                        {(analysisResult.improvements || []).length > 0 ? (
                                            analysisResult.improvements.map((improvement, i) => (
                                                <li key={i} className={styles.improvementItem}>
                                                    <FiChevronRight className={styles.improvementIcon} />
                                                    <div>
                                                        <strong>{improvement.category} ({improvement.score}%)</strong>
                                                        <p>{improvement.description}</p>
                                                        {improvement.suggestion && (
                                                            <div className={styles.suggestion}>
                                                                <FaRegLightbulb className={styles.suggestionIcon} />
                                                                {improvement.suggestion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className={styles.noItems}>
                                                <FiCheckCircle className={styles.noItemsIcon} />
                                                Semua kategori sudah cukup baik!
                                            </li>
                                        )}
                                    </ul>
                                </section>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className={styles.categories}>
                                {(analysisResult.categories || []).map((category, i) => (
                                    <div key={i} className={styles.categoryCard}>
                                        <div className={styles.categoryHeader}>
                                            <h4 className={styles.categoryName}>{category.name}</h4>
                                            <div className={styles.categoryScore}>
                                                Skor: {category.score}/100
                                            </div>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{
                                                    width: `${category.score}%`,
                                                    backgroundColor: category.score >= 80 ? '#10B981' :
                                                        category.score >= 60 ? '#F59E0B' : '#EF4444'
                                                }}
                                            ></div>
                                        </div>
                                        <p className={styles.categoryDescription}>{category.description}</p>
                                        {(category.suggestions || []).length > 0 && (
                                            <div className={styles.suggestions}>
                                                <h5 className={styles.suggestionsTitle}>
                                                    <FaRegLightbulb className={styles.suggestionsIcon} />
                                                    Rekomendasi Perbaikan
                                                </h5>
                                                <ul className={styles.suggestionsList}>
                                                    {(category.suggestions || []).map((suggestion, j) => (
                                                        <li key={j} className={styles.suggestionItem}>
                                                            <FiChevronRight className={styles.suggestionIcon} />
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'keywords' && (
                            <div className={styles.keywords}>
                                <div className={styles.keywordsSection}>
                                    <h3 className={styles.keywordsTitle}>
                                        <FiKey className={styles.keywordsIcon} />
                                        Kata Kunci yang Hilang
                                    </h3>
                                    {(analysisResult.missingKeywords || []).length > 0 ? (
                                        <div className={styles.keywordsGrid}>
                                            {analysisResult.missingKeywords.map((keyword, i) => (
                                                <span key={i} className={styles.keywordBadge}>
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.noKeywords}>
                                            <FiCheckCircle className={styles.noKeywordsIcon} />
                                            CV Anda sudah mencakup semua kata kunci penting!
                                        </div>
                                    )}
                                </div>
                                <div className={styles.tipBox}>
                                    <FaRegLightbulb className={styles.tipIcon} />
                                    <div>
                                        <strong>Tip Profesional:</strong> Menambahkan kata kunci yang relevan dapat meningkatkan peluang CV Anda terdeteksi oleh sistem ATS sebesar 40-60%.
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div className={styles.actionsContent}>
                                <section className={styles.section}>
                                    <h4 className={styles.sectionTitle}>
                                        <FaRocket className={styles.sectionIcon} /> {/* Changed to FaRocket */}
                                        Rencana Tindakan
                                    </h4>
                                    <div className={styles.actionsList}>
                                        {(analysisResult.actionItems || []).map((action, index) => (
                                            <div key={index} className={styles.actionItem}>
                                                <div className={styles.actionNumber}>{index + 1}</div>
                                                <div className={styles.actionText}>
                                                    <FiChevronRight className={styles.actionIcon} />
                                                    {action.text || action}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <div className={styles.downloadSection}>
                                    <h3 className={styles.downloadTitle}>
                                        <FiDownload className={styles.downloadIcon} />
                                        Simpan Hasil Analisis
                                    </h3>
                                    <p className={styles.downloadDescription}>
                                        Unduh laporan lengkap berisi skor, analisis, dan semua saran perbaikan dalam format PDF yang rapi.
                                    </p>
                                    <button
                                        onClick={handleDownloadReport}
                                        disabled={isDownloading}
                                        className={styles.downloadButton}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <FiLoader className={styles.spinner} />
                                                Membuat Laporan...
                                            </>
                                        ) : (
                                            <>
                                                <FiDownload className={styles.buttonIcon} />
                                                Unduh Laporan Analisis
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* ToastContainer should be at the root of your app or layout */}
            <ToastContainer position="bottom-right" autoClose={5000} />
        </div>
    );
};

export default HistoryDetailPage;