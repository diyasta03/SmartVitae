"use client";
import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatbot.module.css';
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

  // Kategori bantuan umum (versi compact)
  const helpTopics = [
    {
      id: 'interview',
      title: "Wawancara",
      icon: <FaUserTie className={styles.categoryIcon} />,
      prompt: "Tips persiapan wawancara kerja"
    },
    {
      id: 'strategy',
      title: "Cari Kerja",
      icon: <FaRegLightbulb className={styles.categoryIcon} />,
      prompt: "Strategi mencari kerja efektif"
    },
    {
      id: 'career',
      title: "Karir",
      icon: <FaChartLine className={styles.categoryIcon} />,
      prompt: "Saya ingin mengembangkan karir"
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFeatureSelect = (feature) => {
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
  };

  const handleCategorySelect = (prompt) => {
    setInputMessage(prompt);
    setShowCategories(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowCategories(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error('Terjadi kesalahan pada chatbot.');

      const data = await response.json();
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: data.reply,
        isFirstMessage: messages.length === 0 
      }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Maaf, ada masalah teknis. Coba lagi nanti.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage('');
    setShowCategories(true);
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
              <button onClick={handleResetChat} title="Reset Percakapan">
                <FiRefreshCcw />
              </button>
              <button onClick={() => setIsOpen(false)} title="Tutup Chat">
                <FiX />
              </button>
            </div>
          </div>
          
          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div className={styles.welcomeContainer}>
                <div className={styles.welcomeBubble}>
                  <h4>👋 Halo!</h4>
                  <p>Saya VitaBot, asisten karir digital Anda. Mau bantuan apa hari ini?</p>
                </div>

                {showCategories && (
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
                )}
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
              placeholder="Ketik pesan Anda..."
              className={styles.chatInput}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.sendButton} 
              disabled={isLoading || !inputMessage.trim()}
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