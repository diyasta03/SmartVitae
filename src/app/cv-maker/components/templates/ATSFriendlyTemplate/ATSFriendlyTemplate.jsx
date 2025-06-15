// cv-maker/components/templates/ATSFriendlyTemplate/ATSFriendlyTemplate.jsx

import React from 'react';
import styles from './ATSFriendlyTemplate.module.css';

// Komponen helper untuk merender link jika ada, atau teks biasa jika tidak
const renderLinkOrText = (url, text) => {
  if (url) {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    return <a href={safeUrl} target="_blank" rel="noopener noreferrer">{text || url}</a>;
  }
  return text;
};

const ATSFriendlyTemplate = ({ formData }) => {
  const { personalInfo, summary, experiences, educations, projects, skills } = formData;

  // Preprocessing data sama seperti di backend untuk konsistensi preview
  const processedExperiences = experiences
    .filter(exp => exp.jobTitle || exp.company || exp.description) 
    .map(exp => ({
      ...exp,
      descriptionList: exp.description ? exp.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedEducations = educations
    .filter(edu => edu.degree || edu.institution) 
    .map(edu => ({
        ...edu,
    }));

  const processedProjects = projects
    .filter(proj => proj.name || proj.description) 
    .map(proj => ({
      ...proj,
      descriptionList: proj.description ? proj.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedSkills = skills ? 
    skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : [];


  return (
    <div className={styles.cvContainer}>
      {/* Header - Nama & Informasi Kontak */}
      <header className={styles.header}>
        <h1 className={styles.name}>{personalInfo.name || "Nama Lengkap Anda"}</h1>
        <p className={styles.profession}>{personalInfo.profession || "Profesi Anda"} - Contoh: Web Developer</p>
        <p className={styles.contactInfo}>
          {personalInfo.phone || "08xxxxxxxxxx"}
          {(personalInfo.phone && personalInfo.email) && <span className={styles.separator}> | </span>}
          {personalInfo.email || "email@contoh.com"}
          {((personalInfo.phone || personalInfo.email) && personalInfo.address) && <span className={styles.separator}> | </span>}
          {personalInfo.address || "Alamat Lengkap Anda, Kota, Kode Pos"}
          {((personalInfo.phone || personalInfo.email || personalInfo.address) && personalInfo.linkedin) && <span className={styles.separator}> | </span>}
          {renderLinkOrText(personalInfo.linkedin, personalInfo.linkedin || "linkedin.com/in/namaanda")}
          {((personalInfo.phone || personalInfo.email || personalInfo.address || personalInfo.linkedin) && personalInfo.github) && <span className={styles.separator}> | </span>}
          {renderLinkOrText(personalInfo.github, personalInfo.github || "github.com/namaanda")}
        </p>
      </header>

      {/* Ringkasan Profesional */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>RINGKASAN</h2>
        <p className={styles.content}>{summary || "Ringkasan profesional singkat tentang diri Anda dan tujuan karir Anda. Contoh: Seorang profesional TI yang sangat termotivasi dengan 5 tahun pengalaman dalam pengembangan web dan manajemen proyek, mencari peran yang menantang untuk memanfaatkan keahlian dalam React.js dan Node.js."}</p>
      </section>

      {/* Pengalaman Kerja */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENGALAMAN KERJA</h2>
        {processedExperiences.length > 0 ? (
          processedExperiences.map(exp => (
            <div key={exp.id} className={styles.entry}>
              <h3 className={styles.entryTitle}>{exp.jobTitle || "Posisi Pekerjaan"}</h3>
              <p className={styles.entrySubtitle}>{exp.company || "Nama Perusahaan"} | {exp.date || "Bulan Tahun - Bulan Tahun"}</p>
              {exp.descriptionList && exp.descriptionList.length > 0 ? (
                <ul className={styles.content}> 
                  {exp.descriptionList.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.content}>{exp.description || "Deskripsi singkat tanggung jawab dan pencapaian Anda di posisi ini."}</p>
              )}
            </div>
          ))
        ) : (
          // Contoh pengalaman jika kosong
          <div className={styles.entry}>
            <h3 className={styles.entryTitle}>Contoh Posisi Pekerjaan</h3>
            <p className={styles.entrySubtitle}>Contoh Nama Perusahaan | Contoh Jan 2020 - Sekarang</p>
            <ul className={styles.content}> 
              <li>Mengembangkan fitur baru untuk aplikasi utama perusahaan menggunakan React.js dan API RESTful.</li>
              <li>Berhasil mengurangi waktu loading halaman sebesar 15% melalui optimasi kode.</li>
              <li>Berkolaborasi dengan tim desain untuk mengimplementasikan antarmuka pengguna yang responsif.</li>
            </ul>
          </div>
        )}
      </section>

      {/* Pendidikan */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENDIDIKAN</h2>
        {processedEducations.length > 0 ? (
          processedEducations.map(edu => (
            <div key={edu.id} className={styles.entry}>
              <h3 className={styles.entryTitle}>{edu.degree || "Gelar"}</h3>
              <p className={styles.entrySubtitle}>{edu.institution || "Nama Institusi"} | {edu.date || "Tahun Masuk - Tahun Lulus"}</p>
              {edu.gpa && <p className={styles.content}>IPK: {edu.gpa}</p> || <p className={styles.content}>IPK: Contoh 3.85/4.00</p>}
            </div>
          ))
        ) : (
          // Contoh pendidikan jika kosong
          <div className={styles.entry}>
            <h3 className={styles.entryTitle}>Contoh S1 Sistem Informasi</h3>
            <p className={styles.entrySubtitle}>Contoh Universitas Maju | Contoh 2017 - 2021</p>
            <p className={styles.content}>IPK: Contoh 3.75/4.00</p>
            <p className={styles.content}>Kursus relevan: Struktur Data, Algoritma, Basis Data, Pengembangan Aplikasi Web.</p>
          </div>
        )}
      </section>

      {/* Proyek */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PROYEK</h2>
        {processedProjects.length > 0 ? (
          processedProjects.map(proj => (
            <div key={proj.id} className={styles.entry}>
              <h3 className={styles.entryTitle}>{proj.name || "Nama Proyek"}</h3>
              <p className={styles.entrySubtitle}>{proj.date || "Tahun"}</p>
              {proj.descriptionList && proj.descriptionList.length > 0 ? (
                <ul className={styles.content}> 
                  {proj.descriptionList.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.content}>{proj.description || "Deskripsi proyek..."}</p>
              )}
            </div>
          ))
        ) : (
          // Contoh proyek jika kosong
          <div className={styles.entry}>
            <h3 className={styles.entryTitle}>Contoh Proyek Portofolio (Nama Proyek Anda)</h3>
            <p className={styles.entrySubtitle}>Contoh 2023</p>
            <ul className={styles.content}>
              <li>Membangun platform e-commerce fiktif menggunakan React, Redux, dan Firebase.</li>
              <li>Mengimplementasikan fitur keranjang belanja dan checkout dengan Stripe API.</li>
            </ul>
          </div>
        )}
      </section>

      {/* Keahlian */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KEAHLIAN</h2>
        {processedSkills.length > 0 ? (
            <div className={styles.skillsContainer}>
                {processedSkills.map((skill, index) => (
                    <span key={index} className={styles.skillPill}>{skill}</span>
                ))}
            </div>
        ) : (
            // KOREKSI DI SINI: Hapus <p> pembungkus <div>
            <div className={styles.skillsContainer}> 
                <span className={styles.skillPill}>JavaScript</span>
                <span className={styles.skillPill}>React</span>
                <span className={styles.skillPill}>Node.js</span>
                <span className={styles.skillPill}>SQL</span>
                <span className={styles.skillPill}>Git</span>
            </div>
        )}
      </section>
    </div>
  );
};

export default ATSFriendlyTemplate;