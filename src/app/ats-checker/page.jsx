'use client'
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import styles from './ATSChecker.module.css'; // Pastikan path ini benar
import Link from 'next/link';
import { FiArrowLeft, FiUpload, FiClipboard, FiSearch, FiFileText, FiAward, FiTool, FiKey, FiCheckCircle, FiAlertCircle, FiChevronRight, FiDownload, FiLoader, FiX, FiFiInfo } from 'react-icons/fi';
import { useRouter } from 'next/navigation'; // Import useRouter
import AIChatbot from '../components/AIChatbot/AIChatbot'; // Import Chatbot Anda

function ATSCheckerPage() { // Atau function HomePage() jika itu pages/index.jsx
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [atsResults, setAtsResults] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
const router = useRouter(); // Ini juga sudah ada

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setAtsResults(null);
        }
    };

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (file && (file.type === 'application/pdf' ||
                    file.type === 'application/msword' ||
                    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setSelectedFile(file);
            setError(null);
            setAtsResults(null);
        } else {
            setError('Silakan unggah file dengan format PDF, DOC, atau DOCX.');
        }
    }, []);

    const removeFile = () => {
        setSelectedFile(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            setError('Silakan pilih file CV untuk diunggah.');
            return;
        }

        setLoading(true);
        setError(null);
        setAtsResults(null);

        const formData = new FormData();
        formData.append('cvFile', selectedFile);

        try {
            const response = await axios.post('/api/check-ats', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setAtsResults(response.data.results);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred while processing your CV.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreFeedback = (score) => {
        if (score >= 80) return 'Sangat Baik! CV Anda sangat kompatibel dengan ATS.';
        if (score >= 60) return 'Baik! CV Anda cukup kompatibel, namun masih bisa ditingkatkan.';
        if (score >= 40) return 'Cukup. CV Anda perlu banyak perbaikan agar lebih kompatibel dengan ATS.';
        return 'Kurang. CV Anda belum optimal untuk ATS.';
    };

    return (
        <div className={styles.container}>
                                  <AIChatbot /> 

        <button onClick={() => router.back()} className={styles.backLink}>
        <FiArrowLeft className={styles.backIcon} /> Kembali
      </button>
          
          
            <div className={styles.header}>
                <h1 className={styles.title}>"Pengecekan CV Sesuai Standar ATS"</h1>
                <p className={styles.subtitle}>
"Dapatkan umpan balik secara instan tentang seberapa baik CV Anda bekerja dengan sistem pelacakan pelamar (ATS) yang digunakan oleh perekrut."                </p>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.uploadCard}>
                    <h2 className={styles.cardTitle}>Unggah CV Anda</h2>
                    
                    <div 
                        className={`${styles.uploadArea} ${isDragging ? styles.active : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload').click()}
                    >
                        <div className={styles.uploadIcon}>📄</div>
                        <p className={styles.uploadText}>
{isDragging ? 'Letakkan file Anda di sini' : 'Seret dan letakkan file Anda atau klik untuk mencari'}
                        </p>
                        <p className={styles.fileFormat}>Format yang didukung: PDF, DOC, DOCX</p>
                    </div>
                    
                    <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    
                    {selectedFile && (
                        <div className={styles.filePreview}>
                            <span className={styles.fileName}>{selectedFile.name}</span>
                            <span className={styles.removeFile} onClick={removeFile}>× Hapus</span>
                        </div>
                    )}
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={loading || !selectedFile} 
                        className={styles.submitButton}
                    >
                        {loading ? (
                            <>
                                <span className={styles.loadingSpinner}></span>
                                Sedang Menganalisis...
                            </>
                        ) : 'Periksa CV'}
                    </button>
                </div>

                {atsResults && (
                    <div className={styles.resultsCard}>
                        <div className={styles.scoreSection}>
                            <h3 className={styles.scoreTitle}>Skor Kompatibilitas ATS Anda</h3>
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill} 
                                    style={{ width: `${atsResults.score}%` }}
                                ></div>
                            </div>
                            <div className={styles.scoreValue}>{atsResults.score}%</div>
                            <p className={styles.scoreFeedback}>{getScoreFeedback(atsResults.score)}</p>
                        </div>
                        
                        <div className={styles.feedbackSection}>
                            <h3 className={styles.feedbackTitle}>Rekomendasi</h3>
                            <ul className={styles.feedbackList}>
                                {atsResults.feedback && atsResults.feedback.length > 0 ? (
                                    atsResults.feedback.map((item, index) => (
                                        <li key={index} className={styles.feedbackItem}>
                                            <span className={styles.feedbackIcon}>•</span>
                                            <span className={styles.feedbackText}>{item}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className={styles.feedbackItem}>
                                        <span className={styles.feedbackIcon}>✓</span>
                                        <span className={styles.feedbackText}>Tidak ditemukan masalah besar. CV Anda sudah terlihat baik!</span>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ATSCheckerPage;