"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./CvMaker.module.css";
import { ModernTemplate, ClassicTemplate, ProfessionalTemplate, ATSFriendlyTemplate } from './components/templates';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiDownload, FiPlus, FiTrash2, FiLoader, FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CvMaker() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    personalInfo: {
      name: "", profession: "", address: "", phone: "", email: "", linkedin: "", github: "",
    },
    summary: "",
    experiences: [{ id: Date.now(), jobTitle: "", company: "", date: "", description: "" }],
    educations: [{ id: Date.now(), degree: "", institution: "", date: "", gpa: "" }],
    projects: [{ id: Date.now(), name: "", date: "", description: "" }],
    skills: "",
  });

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isMobile, setIsMobile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    if (Object.keys(formData.personalInfo).includes(name)) {
      setFormData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (section, index, event) => {
    const { name, value } = event.target;
    const newArray = formData[section].map((item, i) => i === index ? { ...item, [name]: value } : item);
    setFormData(prev => ({ ...prev, [section]: newArray }));
  };

  const addItem = (section) => {
    const newItem = {
      experiences: { id: Date.now(), jobTitle: "", company: "", date: "", description: "" },
      educations: { id: Date.now(), degree: "", institution: "", date: "", gpa: "" },
      projects: { id: Date.now(), name: "", date: "", description: "" },
    };
    setFormData(prev => ({ ...prev, [section]: [...prev[section], newItem[section]] }));
    toast.success(`Berhasil menambahkan ${section === 'experiences' ? 'pengalaman' : section === 'educations' ? 'pendidikan' : 'proyek'} baru`);
  };

  const removeItem = (section, index) => {
    if (formData[section].length > 1) {
      const newArray = formData[section].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [section]: newArray }));
      toast.info(`Item berhasil dihapus`);
    } else {
      toast.warning("Setidaknya harus ada satu entri.");
    }
  };

  const handleSaveCv = async () => {
    const cvName = prompt("Beri nama untuk CV ini:", `CV ${formData.personalInfo.name || formData.personalInfo.profession || 'Pekerjaan Baru'}`);
    if (!cvName || cvName.trim() === "") return;

    setLoadingSave(true);
    try {
      const response = await fetch('/api/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv_name: cvName, cv_data: formData }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan CV');
      toast.success("CV berhasil disimpan!");
      router.push('/my-cvs');
    } catch (error) {
      toast.error(`Gagal menyimpan CV: ${error.message}`);
    } finally {
      setLoadingSave(false);
    }
  };
  
  const generateSummary = async () => {
    // Validate required fields
    const requiredFields = [
      formData.personalInfo.name,
      formData.personalInfo.profession,
      formData.experiences[0].jobTitle,
      formData.experiences[0].company,
      formData.educations[0].degree,
      formData.educations[0].institution,
      formData.skills
    ];

    if (requiredFields.some(field => !field.trim())) {
      toast.error('Harap isi semua field penting terlebih dahulu (Nama, Profesi, Pengalaman, Pendidikan, dan Keahlian)');
      return;
    }

    setLoadingSummary(true);
    try {
      const res = await fetch("/api/generateSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Terjadi kesalahan pada server." }));
        throw new Error(errorData.error);
      }
  
      const data = await res.json();
      const summary = data.summary?.trim() || "Gagal membuat ringkasan.";
      
      setFormData(prev => ({ ...prev, summary: summary }));
      toast.success("Ringkasan berhasil dibuat dengan AI!");
  
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(error.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadPDF = async () => {
    setLoadingDownload(true);
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: formData,
          templateName: selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1) + 'Template'
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat PDF di server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `CV_${formData.personalInfo.name.replace(/\s+/g, '_') || 'MyCV'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("PDF berhasil diunduh!");

    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error(error.message);
    } finally {
      setLoadingDownload(false);
    }
  };

  const renderSelectedTemplate = () => {
    return (
      <>
        {selectedTemplate === 'modern' && <ModernTemplate formData={formData} />}
        {selectedTemplate === 'classic' && <ClassicTemplate formData={formData} />}
        {selectedTemplate === 'professional' && <ProfessionalTemplate formData={formData} />}
        {selectedTemplate === 'atsfriendly' && <ATSFriendlyTemplate formData={formData} />}
      </>
    );
  };
  
  const renderFormSection = () => {
    switch (activeSection) {
      case "personal":
        return (
          <>
            <h2>Informasi Pribadi</h2>
            {Object.entries(formData.personalInfo).map(([key, value]) => (
              <div key={key} className={styles.formGroup}>
                <label htmlFor={key}>
                  {key === 'name' && 'Nama Lengkap'}
                  {key === 'profession' && 'Profesi'}
                  {key === 'address' && 'Alamat'}
                  {key === 'phone' && 'Nomor Telepon'}
                  {key === 'email' && 'Email'}
                  {key === 'linkedin' && 'LinkedIn'}
                  {key === 'github' && 'GitHub'}
                </label>
                <input 
                  id={key} 
                  name={key} 
                  type={key === 'email' ? 'email' : 'text'} 
                  className={styles.formControl} 
                  value={value} 
                  onChange={handleSimpleChange}
                  placeholder={
                    key === 'profession' ? 'Contoh: Frontend Developer' : 
                    key === 'linkedin' ? 'https://linkedin.com/in/username' :
                    key === 'github' ? 'https://github.com/username' : ''
                  }
                />
              </div>
            ))}
          </>
        );
      case "summary":
        return (
          <>
            <h2>Ringkasan Profesional</h2>
            <div className={styles.formGroup}>
              <textarea 
                name="summary" 
                rows={7} 
                className={styles.formControl} 
                value={formData.summary} 
                onChange={handleSimpleChange} 
                placeholder="Jelaskan diri Anda secara profesional (minimal 50 karakter)..."
              />
            </div>
            
            <div className={styles.validationRequirements}>
              <p>Sebelum generate AI, pastikan Anda telah mengisi:</p>
              <ul>
                <li className={!formData.personalInfo.name && styles.missing}>Nama Lengkap</li>
                <li className={!formData.personalInfo.profession && styles.missing}>Profesi</li>
                <li className={!(formData.experiences[0]?.jobTitle && formData.experiences[0]?.company) && styles.missing}>Pengalaman Kerja</li>
                <li className={!(formData.educations[0]?.degree && formData.educations[0]?.institution) && styles.missing}>Pendidikan</li>
                <li className={!formData.skills && styles.missing}>Keahlian</li>
              </ul>
            </div>

            <button 
              type="button" 
              onClick={generateSummary} 
              className={`${styles.btn} ${styles.aiBtn}`} 
              disabled={loadingSummary || 
                !formData.personalInfo.name || 
                !formData.personalInfo.profession ||
                !formData.experiences[0]?.jobTitle ||
                !formData.experiences[0]?.company ||
                !formData.educations[0]?.degree ||
                !formData.educations[0]?.institution ||
                !formData.skills}
            >
              {loadingSummary ? (
                <>
                  <FiLoader className={styles.spinner} /> Membuat...
                </>
              ) : (
                "Buat Ringkasan dengan AI"
              )}
            </button>
          </>
        );
      case "experience":
        return (
          <>
            <h2>Pengalaman Kerja</h2>
            {formData.experiences.map((exp, index) => (
              <div key={exp.id} className={styles.formBlock}>
                <div className={styles.blockHeader}>
                  <h4>Pengalaman #{index + 1}</h4>
                  {formData.experiences.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem('experiences', index)} 
                      className={styles.btnRemove}
                    >
                      <FiTrash2 /> Hapus
                    </button>
                  )}
                </div>
                <input 
                  name="jobTitle" 
                  value={exp.jobTitle} 
                  onChange={(e) => handleArrayChange('experiences', index, e)} 
                  placeholder="Posisi (Contoh: Frontend Developer)" 
                  className={styles.formControl} 
                />
                <input 
                  name="company" 
                  value={exp.company} 
                  onChange={(e) => handleArrayChange('experiences', index, e)} 
                  placeholder="Perusahaan" 
                  className={styles.formControl} 
                />
                <input 
                  name="date" 
                  value={exp.date} 
                  onChange={(e) => handleArrayChange('experiences', index, e)} 
                  placeholder="Contoh: 2020 - Sekarang" 
                  className={styles.formControl} 
                />
                <textarea 
                  name="description" 
                  value={exp.description} 
                  onChange={(e) => handleArrayChange('experiences', index, e)} 
                  placeholder="Deskripsi pekerjaan Anda (gunakan bullet points)" 
                  className={styles.formControl} 
                  rows="4" 
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addItem('experiences')} 
              className={`${styles.btn} ${styles.btnAdd}`}
            >
              <FiPlus /> Tambah Pengalaman
            </button>
          </>
        );
      case "education":
        return (
          <>
            <h2>Pendidikan</h2>
            {formData.educations.map((edu, index) => (
              <div key={edu.id} className={styles.formBlock}>
                <div className={styles.blockHeader}>
                  <h4>Pendidikan #{index + 1}</h4>
                  {formData.educations.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem('educations', index)} 
                      className={styles.btnRemove}
                    >
                      <FiTrash2 /> Hapus
                    </button>
                  )}
                </div>
                <input 
                  name="degree" 
                  value={edu.degree} 
                  onChange={(e) => handleArrayChange('educations', index, e)} 
                  placeholder="Gelar (Contoh: S1 Sistem Informasi)" 
                  className={styles.formControl} 
                />
                <input 
                  name="institution" 
                  value={edu.institution} 
                  onChange={(e) => handleArrayChange('educations', index, e)} 
                  placeholder="Institusi" 
                  className={styles.formControl} 
                />
                <input 
                  name="date" 
                  value={edu.date} 
                  onChange={(e) => handleArrayChange('educations', index, e)} 
                  placeholder="Contoh: 2021 - 2025" 
                  className={styles.formControl} 
                />
                <input 
                  name="gpa" 
                  value={edu.gpa} 
                  onChange={(e) => handleArrayChange('educations', index, e)} 
                  placeholder="IPK (Contoh: 3.85)" 
                  className={styles.formControl} 
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addItem('educations')} 
              className={`${styles.btn} ${styles.btnAdd}`}
            >
              <FiPlus /> Tambah Pendidikan
            </button>
          </>
        );
      case "projects":
        return (
          <>
            <h2>Proyek</h2>
            {formData.projects.map((proj, index) => (
              <div key={proj.id} className={styles.formBlock}>
                <div className={styles.blockHeader}>
                  <h4>Proyek #{index + 1}</h4>
                  {formData.projects.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeItem('projects', index)} 
                      className={styles.btnRemove}
                    >
                      <FiTrash2 /> Hapus
                    </button>
                  )}
                </div>
                <input 
                  name="name" 
                  value={proj.name} 
                  onChange={(e) => handleArrayChange('projects', index, e)} 
                  placeholder="Nama Proyek" 
                  className={styles.formControl} 
                />
                <input 
                  name="date" 
                  value={proj.date} 
                  onChange={(e) => handleArrayChange('projects', index, e)} 
                  placeholder="Tahun" 
                  className={styles.formControl} 
                />
                <textarea 
                  name="description" 
                  value={proj.description} 
                  onChange={(e) => handleArrayChange('projects', index, e)} 
                  placeholder="Deskripsi proyek (teknologi yang digunakan, hasil, dll)" 
                  className={styles.formControl} 
                  rows="4" 
                />
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => addItem('projects')} 
              className={`${styles.btn} ${styles.btnAdd}`}
            >
              <FiPlus /> Tambah Proyek
            </button>
          </>
        );
      case "skills":
        return (
          <>
            <h2>Keahlian</h2>
            <div className={styles.formGroup}>
              <label htmlFor="skills">
                Keahlian Teknis (pisahkan dengan koma)
                <span className={styles.hintText}>Contoh: JavaScript, React, HTML/CSS, Node.js</span>
              </label>
              <textarea 
                id="skills" 
                name="skills" 
                rows={4} 
                className={styles.formControl} 
                value={formData.skills} 
                onChange={handleSimpleChange} 
                placeholder="Masukkan minimal 3 keahlian utama Anda" 
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.cvContainer}>
      {/* Left Panel - Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formHeader}>
          <Link href="/" className={styles.backLink}>
            <FiArrowLeft className={styles.backIcon} /> Kembali ke Home
          </Link>
          <h1>Buat CV Profesional</h1>
          <p className={styles.subtitle}>Isi formulir berikut untuk membuat CV Anda</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className={styles.sectionTabs}>
          {[
            { id: 'personal', label: 'Pribadi' },
            { id: 'summary', label: 'Ringkasan' },
            { id: 'experience', label: 'Pengalaman' },
            { id: 'education', label: 'Pendidikan' },
            { id: 'projects', label: 'Proyek' },
            { id: 'skills', label: 'Keahlian' }
          ].map(section => (
            <button 
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`${styles.tabButton} ${activeSection === section.id ? styles.activeTab : ''}`}
              aria-label={section.label}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        {/* Form Content */}
        <div className={styles.formContent}>
          {renderFormSection()}
        </div>
        
        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button 
            type="button" 
            onClick={handleSaveCv} 
            className={`${styles.btn} ${styles.saveBtn}`} 
            disabled={loadingSave}
          >
            {loadingSave ? (
              <>
                <FiLoader className={styles.spinner} /> Menyimpan...
              </>
            ) : (
              <>
                <FiSave /> Simpan CV
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={downloadPDF} 
            className={`${styles.btn} ${styles.downloadBtn}`}
            disabled={loadingDownload}
          >
            {loadingDownload ? (
              <>
                <FiLoader className={styles.spinner} /> Memproses...
              </>
            ) : (
              <>
                <FiDownload /> Download PDF
              </>
            )}
          </button>
        </div>

        {/* Mobile Preview Toggle */}
        {isMobile && (
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className={styles.mobilePreviewToggle}
          >
            {showPreview ? (
              <>
                <FiEyeOff /> Sembunyikan Preview
              </>
            ) : (
              <>
                <FiEye /> Tampilkan Preview
              </>
            )}
          </button>
        )}
      </div>
 
      {/* Right Panel - Preview Section */}
      {(!isMobile || showPreview) && (
        <div className={styles.previewSection}>
          <div className={styles.templateSelectorContainer}>
            <div className={styles.templateSelector}>
              <label htmlFor="templateSelect">Template CV:</label>
              <select 
                id="templateSelect" 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value)} 
                className={styles.templateDropdown}
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="professional">Professional</option>
                <option value="atsfriendly">Simple</option>
              </select>
            </div>
          </div>

          <div className={styles.previewContainer}>
            <h2 className={styles.previewTitle}>Pratinjau CV</h2>
            <div className={styles.previewViewport}>
              <div id="cvPreview" className={styles.cvPaper}>
                {renderSelectedTemplate()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}