"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./CvMaker.module.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ModernTemplate, ClassicTemplate, ProfessionalTemplate } from './components/templates';
import Link from 'next/link';

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
  const [activeSection, setActiveSection] = useState("personal");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    checkUser();
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
  };

  const removeItem = (section, index) => {
    if (formData[section].length > 1) {
      const newArray = formData[section].filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, [section]: newArray }));
    } else {
      alert("Setidaknya harus ada satu entri.");
    }
  };

  const handleSaveCv = async () => {
    const cvName = prompt("Beri nama untuk CV ini:", `CV untuk ${formData.personalInfo.profession || 'Pekerjaan Baru'}`);
    if (!cvName || cvName.trim() === "") return;

    setLoadingSave(true);
    try {
      const response = await fetch('/api/cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv_name: cvName, cv_data: formData }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      alert("CV berhasil disimpan!");
      router.push('/my-cvs');
    } catch (error) {
      alert("Gagal menyimpan CV: " + error.message);
    } finally {
      setLoadingSave(false);
    }
  };
  
  const generateSummary = async () => {
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
  
    } catch (error) {
      console.error("Error generating summary:", error);
      alert(error.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  const downloadPDF = async () => {
    // State untuk loading bisa ditambahkan jika perlu
    console.log("Preparing to download high-quality PDF...");

    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData: formData, // Kirim data CV
          templateName: selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1) + 'Template' // Contoh: 'ModernTemplate'
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat PDF di server.');
      }

      // Logika untuk download file blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `CV_${formData.personalInfo.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

    } catch (error) {
      console.error("Download PDF error:", error);
      alert(error.message);
    }
  };


  const renderSelectedTemplate = () => {
    return (
      <>
        {selectedTemplate === 'modern' && <ModernTemplate formData={formData} />}
        {selectedTemplate === 'classic' && <ClassicTemplate formData={formData} />}
        {selectedTemplate === 'professional' && <ProfessionalTemplate formData={formData} />}
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
                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input id={key} name={key} type="text" className={styles.formControl} value={value} onChange={handleSimpleChange}/>
              </div>
            ))}
          </>
        );
      case "summary":
        return (
          <>
            <h2>Ringkasan Profesional</h2>
            <div className={styles.formGroup}>
              <textarea name="summary" rows={7} className={styles.formControl} value={formData.summary} onChange={handleSimpleChange} placeholder="Jelaskan diri Anda secara profesional..."/>
            </div>
            <button type="button" onClick={generateSummary} className={styles.btn} disabled={loadingSummary}>
              {loadingSummary ? "Membuat..." : "Buat Ringkasan dengan AI"}
            </button>
          </>
        );
      case "experience":
        return (
          <>
            <h2>Pengalaman Kerja</h2>
            {formData.experiences.map((exp, index) => (
              <div key={exp.id} className={styles.formBlock}>
                <h4>Pengalaman #{index + 1}</h4>
                <input name="jobTitle" value={exp.jobTitle} onChange={(e) => handleArrayChange('experiences', index, e)} placeholder="Posisi" className={styles.formControl} />
                <input name="company" value={exp.company} onChange={(e) => handleArrayChange('experiences', index, e)} placeholder="Perusahaan" className={styles.formControl} />
                <input name="date" value={exp.date} onChange={(e) => handleArrayChange('experiences', index, e)} placeholder="Contoh: 2020 - Sekarang" className={styles.formControl} />
                <textarea name="description" value={exp.description} onChange={(e) => handleArrayChange('experiences', index, e)} placeholder="Deskripsi pekerjaan Anda..." className={styles.formControl} rows="3" />
                {formData.experiences.length > 1 && <button type="button" onClick={() => removeItem('experiences', index)} className={styles.btnRemove}>Hapus Pengalaman Ini</button>}
              </div>
            ))}
            <button type="button" onClick={() => addItem('experiences')} className={styles.btnAdd}>+ Tambah Pengalaman</button>
          </>
        );
      case "education":
          return (
            <>
              <h2>Pendidikan</h2>
              {formData.educations.map((edu, index) => (
                <div key={edu.id} className={styles.formBlock}>
                  <h4>Pendidikan #{index + 1}</h4>
                  <input name="degree" value={edu.degree} onChange={(e) => handleArrayChange('educations', index, e)} placeholder="Gelar (Contoh: S1 Sistem Informasi)" className={styles.formControl} />
                  <input name="institution" value={edu.institution} onChange={(e) => handleArrayChange('educations', index, e)} placeholder="Institusi" className={styles.formControl} />
                  <input name="date" value={edu.date} onChange={(e) => handleArrayChange('educations', index, e)} placeholder="Contoh: 2021 - 2025" className={styles.formControl} />
                  <input name="gpa" value={edu.gpa} onChange={(e) => handleArrayChange('educations', index, e)} placeholder="IPK (Contoh: 3.85)" className={styles.formControl} />
                  {formData.educations.length > 1 && <button type="button" onClick={() => removeItem('educations', index)} className={styles.btnRemove}>Hapus Pendidikan Ini</button>}
                </div>
              ))}
              <button type="button" onClick={() => addItem('educations')} className={styles.btnAdd}>+ Tambah Pendidikan</button>
            </>
          );
      case "projects":
        return (
            <>
              <h2>Proyek</h2>
              {formData.projects.map((proj, index) => (
                <div key={proj.id} className={styles.formBlock}>
                   <h4>Proyek #{index + 1}</h4>
                  <input name="name" value={proj.name} onChange={(e) => handleArrayChange('projects', index, e)} placeholder="Nama Proyek" className={styles.formControl} />
                  <input name="date" value={proj.date} onChange={(e) => handleArrayChange('projects', index, e)} placeholder="Tahun" className={styles.formControl} />
                  <textarea name="description" value={proj.description} onChange={(e) => handleArrayChange('projects', index, e)} placeholder="Deskripsi proyek..." className={styles.formControl} rows="3" />
                  {formData.projects.length > 1 && <button type="button" onClick={() => removeItem('projects', index)} className={styles.btnRemove}>Hapus Proyek Ini</button>}
                </div>
              ))}
              <button type="button" onClick={() => addItem('projects')} className={styles.btnAdd}>+ Tambah Proyek</button>
            </>
          );
      case "skills":
        return (
          <>
            <h2>Keahlian</h2>
            <div className={styles.formGroup}>
              <label htmlFor="skills">Sebutkan keahlian Anda (pisahkan dengan koma)</label>
              <textarea id="skills" name="skills" rows={4} className={styles.formControl} value={formData.skills} onChange={handleSimpleChange} placeholder="Contoh: JavaScript, HTML, CSS, React" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.cvContainer}>
      <div className={styles.formSection}>
        <Link href="/dashboard" className={styles.backLink}>
          <span className={styles.backIcon}>&lt;</span> Kembali ke Dashboard
        </Link>
        <h1 style={{textAlign:"center"}}>CV Maker</h1>
        
        <div className={styles.sectionButtons}>
            {['personal', 'summary', 'experience', 'education', 'projects', 'skills'].map(section => (
                <button 
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`${styles.sectionButton} ${activeSection === section ? styles.active : ''}`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
            ))}
        </div>
        
        <form onSubmit={(e) => e.preventDefault()} className={styles.formSectionContent}>
          {renderFormSection()}
        </form>
        
        <div className={styles.actionButtons}>
            <button type="button" onClick={handleSaveCv} className={styles.btn} disabled={loadingSave}>
                {loadingSave ? "Menyimpan..." : "Simpan CV"}
            </button>
            <button type="button" onClick={downloadPDF} className={styles.btn}>
                Download PDF
            </button>
        </div>
      </div>
 
     <div className={styles.previewSection}>
  <div className={styles.templateSelectorContainer}>
 <div className={styles.templateSelector}>
            <label htmlFor="templateSelect">Pilih Template:</label>
            <select id="templateSelect" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} className={styles.templateDropdown}>
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="professional">Professional</option>
            </select>
          </div>  </div>
  <div className={styles.previewHeader}>
    <h2 className={styles.previewTitle}>CV Preview</h2>
  </div>

  {/* --- UBAH BAGIAN INI --- */}
  <div className={styles.previewViewport}>
    <div id="cvPreview" className={styles.cvPaper}>
      {renderSelectedTemplate()}
    </div>
  </div>
      </div>
    </div>
  );
}