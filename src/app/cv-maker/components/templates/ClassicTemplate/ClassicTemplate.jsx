// cv-maker/components/templates/ModernATSTemplate/ModernATSTemplate.jsx

import React from 'react';
import styles from './ClassicTemplate.module.css'; // Nama file CSS modul yang baru

// Helper function untuk render link atau teks
const renderLinkOrText = (url, text) => {
  if (url) {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    return <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>{text || url}</a>;
  }
  return text;
};

const ModernATSTemplate = ({ formData }) => {
  // Data dari form
  const { personalInfo, summary, experiences, educations, projects, skills } = formData;

  // Preprocessing data sama seperti di backend untuk konsistensi preview
  const processedExperiences = experiences
    .filter(exp => exp.jobTitle && exp.company) // Hanya tampilkan jika ada judul dan perusahaan
    .map(exp => ({
      ...exp,
      descriptionList: exp.description ? exp.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedEducations = educations
    .filter(edu => edu.degree && edu.institution); // Hanya tampilkan jika ada gelar dan institusi

  const processedProjects = projects
    .filter(proj => proj.name) // Hanya tampilkan jika ada nama proyek
    .map(proj => ({
      ...proj,
      descriptionList: proj.description ? proj.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedSkills = skills ? 
    skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : [];


  return (
    <div className={styles.cvContainer}>
      {/* Header Section */}
      <header className={styles.headerSection}>
        <h1 className={styles.name}>{personalInfo.name || "NAMA LENGKAP ANDA"}</h1>
        <p className={styles.profession}>{personalInfo.profession || "PROFESI ANDA, Contoh: Project Manager"}</p>
        <div className={styles.contactInfo}>
            <span>{personalInfo.phone || "0812-3456-7890"}</span>
            <span>{personalInfo.email || "email.anda@contoh.com"}</span>
            {personalInfo.address && <span>{personalInfo.address}</span> || <span>Kota, Negara</span>}
            {personalInfo.linkedin && <span>{renderLinkOrText(personalInfo.linkedin, personalInfo.linkedin)}</span> || <span>linkedin.com/in/namaanda</span>}
            {personalInfo.github && <span>{renderLinkOrText(personalInfo.github, personalInfo.github)}</span> || <span>github.com/namaanda</span>}
        </div>
      </header>

      {/* Summary Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>RINGKASAN</h2>
        <p className={styles.content}>{summary || "Ringkasan profesional yang menonjolkan pengalaman, keahlian, dan pencapaian Anda. Fokus pada bagaimana Anda dapat memberikan nilai kepada perusahaan. Contoh: Seorang profesional pemasaran digital berpengalaman dengan rekam jejak terbukti dalam meningkatkan ROI kampanye sebesar 30%, mencari peran strategis untuk mendorong pertumbuhan bisnis."}</p>
      </section>

      {/* Skills Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>KEAHLIAN</h2>
        <ul className={styles.skillsList}>
          {processedSkills.length > 0 ? (
            processedSkills.map((skill, index) => (
              <li key={index} className={styles.skillItem}>{skill}</li>
            ))
          ) : (
            // Contoh skill jika kosong
            <>
              <li className={styles.skillItem}>Manajemen Proyek</li>
              <li className={styles.skillItem}>Pemasaran Digital</li>
              <li className={styles.skillItem}>Analisis Data</li>
              <li className={styles.skillItem}>Komunikasi Strategis</li>
              <li className={styles.skillItem}>Kepemimpinan Tim</li>
            </>
          )}
        </ul>
      </section>

      {/* Experience Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENGALAMAN</h2>
        {processedExperiences.length > 0 ? (
          processedExperiences.map((exp) => (
            <div key={exp.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h3 className={styles.entryTitle}>{exp.jobTitle} di {exp.company}</h3>
                <span className={styles.entryDate}>{exp.date}</span>
              </div>
              {exp.descriptionList && exp.descriptionList.length > 0 ? (
                <ul className={styles.entryDescription}>
                  {exp.descriptionList.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.entryDescription}>
                  <li>Contoh: Mengelola siklus hidup proyek dari inisiasi hingga penutupan, memastikan pengiriman tepat waktu.</li>
                  <li>Contoh: Meningkatkan efisiensi operasional sebesar 15% melalui implementasi metodologi baru.</li>
                  <li>Contoh: Memimpin tim multi-disiplin untuk mencapai target proyek yang ambisius.</li>
                </ul>
              )}
            </div>
          ))
        ) : (
          // Contoh pengalaman jika kosong
          <div className={styles.entry}>
            <div className={styles.entryHeader}>
              <h3 className={styles.entryTitle}>Manajer Proyek di Perusahaan Inovasi</h3>
              <span className={styles.entryDate}>Jan 2020 - Sekarang</span>
            </div>
            <ul className={styles.entryDescription}>
              <li>Merencanakan dan mengeksekusi proyek teknologi kompleks dengan anggaran $500.000.</li>
              <li>Meningkatkan kepuasan klien sebesar 25% melalui komunikasi proaktif dan penyelesaian masalah yang cepat.</li>
              <li>Membimbing tim yang terdiri dari 5 pengembang, desainer, dan QA.</li>
            </ul>
          </div>
        )}
      </section>

      {/* Education Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENDIDIKAN</h2>
        {processedEducations.length > 0 ? (
          processedEducations.map((edu) => (
            <div key={edu.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h3 className={styles.entryTitle}>{edu.degree}</h3>
                <span className={styles.entryDate}>{edu.date}</span>
              </div>
              <p className={styles.entrySubtitle}>{edu.institution}</p>
              {edu.gpa && <p className={styles.content}>IPK: {edu.gpa}</p>}
            </div>
          ))
        ) : (
          // Contoh pendidikan jika kosong
          <div className={styles.entry}>
            <div className={styles.entryHeader}>
              <h3 className={styles.entryTitle}>Magister Manajemen (M.M.)</h3>
              <span className={styles.entryDate}>2019 - 2021</span>
            </div>
            <p className={styles.entrySubtitle}>Sekolah Bisnis Unggul</p>
            <p className={styles.content}>Fokus: Strategi Bisnis & Kepemimpinan</p>
          </div>
        )}
      </section>

      {/* Projects Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PROYEK</h2>
        {processedProjects.length > 0 ? (
          processedProjects.map((proj) => (
            <div key={proj.id} className={styles.entry}>
              <div className={styles.entryHeader}>
                <h3 className={styles.entryTitle}>{proj.name}</h3>
                <span className={styles.entryDate}>{proj.date}</span>
              </div>
              {proj.descriptionList && proj.descriptionList.length > 0 ? (
                <ul className={styles.entryDescription}>
                  {proj.descriptionList.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <ul className={styles.entryDescription}>
                  <li>Contoh: Memimpin inisiatif pengembangan produk baru dari konsep hingga peluncuran pasar.</li>
                  <li>Contoh: Mengembangkan sistem pelaporan data otomatis yang mengurangi waktu analisis sebesar 40%.</li>
                </ul>
              )}
            </div>
          ))
        ) : (
          // Contoh proyek jika kosong
          <div className={styles.entry}>
            <div className={styles.entryHeader}>
              <h3 className={styles.entryTitle}>Proyek Konsultasi Strategi Bisnis</h3>
              <span className={styles.entryDate}>2023</span>
            </div>
            <ul className={styles.entryDescription}>
              <li>Menganalisis pasar untuk klien startup, mengidentifikasi peluang pertumbuhan baru.</li>
              <li>Mengembangkan strategi masuk pasar yang menghasilkan peningkatan pangsa pasar 10% dalam 6 bulan.</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default ModernATSTemplate;