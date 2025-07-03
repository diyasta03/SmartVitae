"use client";
import React, { useState, useEffect } from 'react'; // Import useEffect
import styles from './CVOptimizer.module.css';
import { FiArrowLeft, FiUpload, FiClipboard, FiSearch, FiFileText, FiAward, FiTool, FiKey, FiCheckCircle, FiAlertCircle, FiChevronRight, FiDownload, FiLoader, FiX, FiInfo } from 'react-icons/fi';
import { FaRegLightbulb, FaRegSmile, FaRegMeh, FaRegFrown } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { supabase } from "../../lib/supabaseClient";
import Image from 'next/image';
const CVOptimizer = () => {
    const [showExample, setShowExample] = useState(false);

  const router = useRouter(); // Initialize useRouter
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For form submission loading
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // New state for auth loading
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Effect to check user session on component mount
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, redirect to login
        router.push('/login');
      } else {
        // If session exists, set auth loading to false
        setIsAuthLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth state changes to handle logout/login events dynamically
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login'); // Redirect if user logs out from another tab/window
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe(); // Cleanup the listener
    };
  }, [router]); // Dependency array includes router to avoid lint warnings

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file terlalu besar (maksimal 5MB)');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Hanya file PDF yang diterima');
        return;
      }
      setCvFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cvFile || !jobDescription.trim()) {
      setError('Harap unggah CV dan masukkan deskripsi pekerjaan');
      toast.error('Harap unggah CV dan masukkan deskripsi pekerjaan'); // Add toast for this validation
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('cvFile', cvFile);
      formData.append('jobDescription', jobDescription);
      formData.append('companyName', companyName);
      formData.append('jobTitle', jobTitle);

      const response = await fetch('/api/analyzeCV', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan pada server');
      }

      const result = await response.json();
      setAnalysisResult(result.analysisResult);
      setActiveTab('overview');
      toast.success('Analisis berhasil!');
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisResult) {
      toast.error("Data analisis tidak ditemukan untuk membuat laporan.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult, companyName, jobTitle }),
      });

      if (!response.ok) throw new Error('Gagal membuat laporan PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_CV_${companyName || 'SmartVitae'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Laporan berhasil diunduh!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderScoreCircle = (score) => {
    let color, Icon;
    if (score >= 80) {
      color = '#10B981';
      Icon = FaRegSmile;
    } else if (score >= 60) {
      color = '#F59E0B';
      Icon = FaRegMeh;
    } else {
      color = '#EF4444';
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

  // Display a loading message while checking auth status
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
        <FiLoader className="animate-spin text-4xl mr-3" /> Memuat...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <FiArrowLeft className={styles.backIcon} /> Kembali ke Home
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <FiSearch className={styles.titleIcon} />
          Penganalisis CV
        </h1>
        <p className={styles.subtitle}>
"Tingkatkan peluang diterima dengan analisis CV cerdas yang mengidentifikasi kecocokan deskprisi Pekerajaan dan mengoptimalkan kata kunci untuk ATS."
        </p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiFileText className={styles.labelIcon} />
              Nama Perusahaan (Opsional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Contoh: Google Indonesia/Tokopedia"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <FiFileText className={styles.labelIcon} />
              Posisi yang Dilamar (Opsional)
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Contoh: Frontend Developer"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            <FiUpload className={styles.labelIcon} />
            Unggah CV Anda (PDF)*
          </label>
          <div className={styles.fileUpload}>
            <input
              type="file"
              id="cvFile"
              accept=".pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <label htmlFor="cvFile" className={styles.fileLabel}>
              {cvFile ? (
                <>
                  <span className={styles.fileName}>{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCvFile(null);
                      document.getElementById('cvFile').value = '';
                    }}
                    className={styles.fileClear}
                  >
                    <FiX />
                  </button>
                </>
              ) : (
                <>
                  <FiUpload className={styles.uploadIcon} />
                  Pilih File PDF
                </>
              )}
            </label>
            <p className={styles.fileHint}>
              <FiInfo className={styles.hintIcon} />
              Maksimal 5MB
            </p>
          </div>
        </div>

       <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label className={styles.label}>
              <FiClipboard className={styles.labelIcon} />
              Deskripsi Pekerjaan*
            </label>
            <button 
              type="button" 
              onClick={() => setShowExample(!showExample)}
              className={styles.exampleButton}
              
            >
              {showExample ? 'Sembunyikan Contoh' : 'Lihat Contoh'}
            </button>
          </div>

          {showExample && (
            <div className={styles.exampleContainer}>
              <div className={styles.exampleContent}>
                <h4>Cara Mendapatkan Deskripsi Pekerjaan:</h4>
                <ol className={styles.exampleSteps}>
                  <li>Buka lowongan pekerjaan di situs seperti Google, LinkedIn, JobStreet, atau Glints</li>
                  <li>Salin bagian "Deskripsi Pekerjaan" atau "Job Description"</li>
                  <li>Tempelkan di kolom di bawah ini</li>
                </ol>
                
                <div className={styles.exampleGifContainer}>
                  <Image 
                    src="/images/cari.gif" 
                    alt="Contoh mengambil deskripsi pekerjaan"
                    width={200}  // diperkecil dari 600
    height={267} 
                    className={styles.exampleGif}
                  />
                  <p className={styles.exampleCaption}>
                    Contoh: Menyalin deskripsi pekerjaan dari Google
                  </p>
                </div>
              </div>
            </div>
          )}

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Tempelkan deskripsi pekerjaan yang ingin Anda lamar..."
            rows={6}
            className={styles.textarea}
            required
          />
          <p className={styles.textareaHint}>
            <FiInfo className={styles.hintIcon} />
            Salin seluruh teks deskripsi pekerjaan termasuk persyaratan dan tanggung jawab (Semakin Lengkap semakin bagus Hasil Analisanya)
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <>
              <FiLoader className={styles.spinner} />
              Menganalisis... Mohon Untuk tidak keluar atau merefresh Halaman
            </>
          ) : (
            <>
              <FiSearch className={styles.buttonIcon} />
              Analisis CV
            </>
          )}
        </button>
      </form>

      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle className={styles.errorIcon} />
          <div>
            <h4>Terjadi Kesalahan</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>
                <FiAward className={styles.resultsIcon} />
                Hasil Analisis
              </h2>
              <p className={styles.resultsSubtitle}>
                Berdasarkan deskripsi pekerjaan dari {companyName || 'perusahaan target'}
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
                    {analysisResult.strengths?.length > 0 ? (
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
                    {analysisResult.improvements?.length > 0 ? (
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
                {analysisResult.categories?.map((category, i) => (
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
                    {category.suggestions?.length > 0 && (
                      <div className={styles.suggestions}>
                        <h5 className={styles.suggestionsTitle}>
                          <FaRegLightbulb className={styles.suggestionsIcon} />
                          Rekomendasi Perbaikan
                        </h5>
                        <ul className={styles.suggestionsList}>
                          {category.suggestions.map((suggestion, j) => (
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
                  {analysisResult.missingKeywords?.length > 0 ? (
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
          </div>

          <div className={styles.downloadSection}>
            <h3 className={styles.downloadTitle}>
              <FiDownload className={styles.downloadIcon} />
              Simpan Hasil Analisis
            </h3>
            <p className={styles.downloadDescription}>
              Unduh laporan lengkap berisi skor, analisis, dan semua saran perbaikan dalam format PDF.
            </p>
            <button
              onClick={handleDownloadReport}
              disabled={isLoading}
              className={styles.downloadButton}
            >
              {isLoading ? (
                <>
                  <FiLoader className={styles.spinner} />
                  Membuat Laporan...
                </>
              ) : (
                <>
                  <FiDownload className={styles.buttonIcon} />
                  Unduh Laporan PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
};

export default CVOptimizer;