"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatbot.module.css'; // Pastikan path CSS ini benar
import { FiSend, FiLoader, FiX, FiRefreshCcw } from 'react-icons/fi';
import { FaRobot, FaRegLightbulb, FaFileAlt, FaUserTie, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [isInInterviewMode, setIsInInterviewMode] = useState(false);
  const [showInterviewPrepForm, setShowInterviewPrepForm] = useState(false); // State baru untuk form persiapan interview
  const [companyName, setCompanyName] = useState(''); // State untuk nama perusahaan
  const [jobPosition, setJobPosition] = useState(''); // State untuk posisi pekerjaan
  const messagesEndRef = useRef(null);

  // Fitur utama website (versi compact)
  const websiteFeatures = [
    {
      id: 'create-cv',
      title: "Buat CV",
      icon: <FaFileAlt className={styles.categoryIcon} />,
      prompt: "Saya ingin membuat CV profesional",
      response: "**Siap!** Generator CV kami akan membantu Anda membuat CV ATS-friendly dalam beberapa menit.\n\n✅ Template profesional\n✅ Optimasi keyword\n✅ Format PDF siap pakai",
      action: { text: "Buat CV", url: "/cv-maker" }
    },
    {
      id: 'analyze-cv',
      title: "Analisis CV",
      icon: <FaFileAlt className={styles.categoryIcon} />,
      prompt: "Saya ingin menganalisis CV saya",
      response: "**Mari analisis CV Anda!**\n\nUnggah CV dan deskripsi pekerjaan untuk mendapatkan:\n\n- Kesesuaian skill\n- Keyword optimization\n- Struktur dokumen\n- Score ATS",
      action: { text: "Mulai Analisis", url: "/cv-analyze" }
    },
    {
      id: 'ats-check',
      title: "ATS Check",
      icon: <FaFileAlt className={styles.categoryIcon} />,
      prompt: "Bagaimana cara memeriksa ATS compatibility CV saya?",
      response: "**Penting!** CV perlu dioptimalkan untuk Applicant Tracking System. Kami akan scan:\n\n- Keyword density\n- Section structure\n- File format\n- Readability",
      action: { text: "Cek Sekarang", url: "/ats-checker" }
    },
    {
      id: 'track-apps',
      title: "Lacak Lamaran",
      icon: <FaChartLine className={styles.categoryIcon} />,
      prompt: "Saya ingin melacak lamaran pekerjaan",
      response: "**Dashboard Pelacakan** membantu Anda:\n\n📊 Memonitor status aplikasi\n⏰ Set reminder follow-up\n📅 Atur jadwal wawancara\n✉️ Template email follow-up",
      action: { text: "Buka Tracker", url: "/job-tracker" }
    }
  ];

  // Kategori bantuan umum
  const helpTopics = [
    {
      id: 'interview',
      title: "Latihan Interview",
      icon: <FaUserTie className={styles.categoryIcon} />,
      prompt: "Saya mau latihan interview kerja"
    },
    {
      id: 'summary',
      title: "Buat Ringkasan Diri",
      icon: <FaRegLightbulb className={styles.categoryIcon} />,
      prompt: "Tolong bantu buat ringkasan pribadi untuk CV/profil"
    },
    {
      id: 'reply',
      title: "Balas Undangan Interview",
      icon: <FaRegLightbulb className={styles.categoryIcon} />,
      prompt: "Bantu saya membalas undangan interview"
    },
    {
      id: 'strategy',
      title: "Cari Kerja",
      icon: <FaRegLightbulb className={styles.categoryIcon} />,
      prompt: "Strategi mencari kerja efektif"
    },
    {
      id: 'career',
      title: "Pengembangan Karir",
      icon: <FaChartLine className={styles.categoryIcon} />,
      prompt: "Saya ingin mengembangkan karir"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFeatureSelect = (feature) => {
    if (isInInterviewMode) {
      setIsInInterviewMode(false);
    }
    setMessages([{
      sender: 'user',
      text: feature.prompt
    }, {
      sender: 'bot',
      text: feature.response,
      action: feature.action,
      isFirstMessage: true
    }]);
    setShowCategories(false);
    setShowInterviewPrepForm(false);
  };

  const handleCategorySelect = (prompt) => {
    if (prompt === "Saya mau latihan interview kerja") {
      setShowInterviewPrepForm(true);
      setShowCategories(false);
    } else {
      setIsInInterviewMode(false);
      setShowInterviewPrepForm(false);
      setMessages([]); // Pastikan chat direset jika memilih kategori non-interview
      setInputMessage(prompt);
      setShowCategories(false);
    }
  };

  const handleSubmitInterviewPrep = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !jobPosition.trim()) {
      toast.error("Nama perusahaan dan posisi harus diisi!");
      return;
    }

    setShowInterviewPrepForm(false);
    setIsInInterviewMode(true);

    const userPromptText = `Saya mau latihan interview kerja untuk posisi ${jobPosition} di perusahaan ${companyName}.`;

    // Langsung set messages di UI dengan pesan awal dari user
    // Ini juga akan menjadi satu-satunya pesan dalam history yang dikirim pertama kali
    setMessages([{ sender: 'user', text: userPromptText }]);

    setIsLoading(true);
    setShowCategories(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPromptText, // Pesan yang akan dijawab oleh AI
          // History hanya berisi satu pesan user awal, diformat untuk Gemini
          history: [{ role: 'user', parts: [{ text: userPromptText }] }],
          isInInterviewMode: true,
          companyName,
          jobPosition
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan pada chatbot.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply,
        isFirstMessage: false
      }]);
    } catch (error) {
      console.error('Error saat mengirim pesan persiapan interview:', error);
      toast.error(error.message);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Maaf, ada masalah teknis saat memulai wawancara. Coba lagi nanti atau reset percakapan.'
      }]);
      setIsInInterviewMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputMessage };
    // Tambahkan pesan user ke daftar pesan untuk tampilan UI yang instan
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setShowCategories(false);
    setShowInterviewPrepForm(false);

    try {
      // Format riwayat percakapan untuk dikirim ke backend
      let formattedHistory = newMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      // KONSISTENSI KRUSIAL: Pastikan history selalu dimulai dengan 'user'
      // Jika pesan pertama dari model, hapus.
      // Ini adalah perbaikan utama untuk error "First content should be with role 'user'".
      if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        console.warn("First history message is 'model', removing it to avoid Gemini API error.");
        formattedHistory.shift(); // Hapus elemen pertama jika itu dari model
      }

      // Jika setelah pembersihan history menjadi kosong, kirim array kosong
      // Gemini API membutuhkan history kosong atau dimulai dengan 'user'
      const historyToSend = formattedHistory.length > 0 ? formattedHistory : [];


      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: historyToSend, // Kirim history yang sudah 'bersih'
          isInInterviewMode: isInInterviewMode,
          companyName: isInInterviewMode ? companyName : undefined,
          jobPosition: isInInterviewMode ? jobPosition : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan pada chatbot.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.reply,
        isFirstMessage: false
      }]);
    } catch (error) {
      console.error('Error saat mengirim pesan:', error);
      toast.error(error.message);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Maaf, ada masalah teknis. Coba lagi nanti atau reset percakapan.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage('');
    setShowCategories(true);
    setIsInInterviewMode(false);
    setShowInterviewPrepForm(false);
    setCompanyName('');
    setJobPosition('');
    toast.info('Percakapan direset.');
  };

  return (
    <>
      <button
        className={`${styles.chatToggleButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Tutup Chatbot" : "Buka Chatbot"}
      >
        {isOpen ? <FiX /> : <FaRobot />}
        {!isOpen && <span className={styles.notificationPulse}></span>}
      </button>

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <FaRobot className={styles.headerIcon} />
              <div>
                <h3>VitaBot</h3>
                <p className={styles.status}>Online • Siap membantu</p>
              </div>
            </div>
            <div className={styles.headerActions}>
              {isInInterviewMode && (
                <button
                  onClick={handleResetChat}
                  title="Keluar dari mode Interview"
                  className={styles.exitInterviewButton}
                >
                  <FiX /> Keluar Interview
                </button>
              )}
              <button onClick={handleResetChat} title="Reset Percakapan">
                <FiRefreshCcw />
              </button>
              <button onClick={() => setIsOpen(false)} title="Tutup Chat">
                <FiX />
              </button>
            </div>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && showCategories && !showInterviewPrepForm ? (
              <div className={styles.welcomeContainer}>
                <div className={styles.welcomeBubble}>
                  <h4>👋 Halo!</h4>
                  <p>Saya VitaBot, asisten karir digital digital Anda. Mau bantuan apa hari ini?</p>
                </div>

                <div className={styles.quickActions}>
                  <h5 className={styles.quickActionsTitle}>Pilih Bantuan Cepat:</h5>
                  <div className={styles.featuresRow}>
                    {websiteFeatures.map((feature) => (
                      <button
                        key={feature.id}
                        className={styles.featurePill}
                        onClick={() => handleFeatureSelect(feature)}
                        title={feature.title}
                      >
                        {feature.icon}
                        <span>{feature.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className={styles.topicsRow}>
                    {helpTopics.map((topic) => (
                      <button
                        key={topic.id}
                        className={styles.topicPill}
                        onClick={() => handleCategorySelect(topic.prompt)}
                        title={topic.title}
                      >
                        {topic.icon}
                        <span>{topic.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : messages.length === 0 && showInterviewPrepForm ? (
                <div className={styles.interviewPrepFormContainer}>
                    <h4>Siap untuk latihan interview?</h4>
                    <p>Mohon isi detail berikut agar saya bisa menyesuaikan pertanyaan:</p>
                    <form onSubmit={handleSubmitInterviewPrep} className={styles.interviewForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="companyName">Nama Perusahaan:</label>
                            <input
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Contoh: Google, PT Jaya Abadi"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="jobPosition">Posisi yang Dilamar:</label>
                            <input
                                type="text"
                                id="jobPosition"
                                value={jobPosition}
                                onChange={(e) => setJobPosition(e.target.value)}
                                placeholder="Contoh: Software Engineer, Marketing Manager"
                                required
                            />
                        </div>
                        <button type="submit" className={styles.submitInterviewPrepButton}>
                            Mulai Latihan Interview
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={handleResetChat}>
                            Batal
                        </button>
                    </form>
                </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[msg.sender]}`}
                >
                  <div className={styles.messageContent}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                    {msg.action && (
                      <Link href={msg.action.url} className={styles.actionButton}>
                        {msg.action.text}
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isInInterviewMode ? "Jawab pertanyaan interview..." : "Ketik pesan Anda..."}
              className={styles.chatInput}
              disabled={isLoading || showInterviewPrepForm}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !inputMessage.trim() || showInterviewPrepForm}
            >
              {isLoading ? <FiLoader className={styles.loadingSpinner} /> : <FiSend />}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChatbot;