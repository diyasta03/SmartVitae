// cv-maker/components/templates/ProfessionalATSTemplate.jsx

import React from 'react';
// Pastikan ini menunjuk ke file CSS yang BENAR untuk ProfessionalATSTemplate Anda
import styles from './ProfessionalTemplate.module.css'; 

const renderLinkOrText = (url, text) => {
  if (url) {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    return <a href={safeUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>{text || url}</a>;
  }
  return text;
};

const ProfessionalATSTemplate = ({ formData }) => {
  const { personalInfo, summary, experiences, educations, projects, skills } = formData;

  // Preprocessing data sama seperti di backend untuk konsistensi preview
  // Termasuk teks contoh jika data kosong
  const processedExperiences = experiences
    .filter(exp => exp.jobTitle || exp.company || exp.description) // Filter hanya jika ada setidaknya satu field
    .map(exp => ({
      ...exp,
      descriptionList: exp.description ? exp.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedEducations = educations
    .filter(edu => edu.degree || edu.institution) // Filter hanya jika ada setidaknya satu field
    .map(edu => ({
        ...edu,
    }));

  const processedProjects = projects
    .filter(proj => proj.name || proj.description) // Filter hanya jika ada setidaknya satu field
    .map(proj => ({
      ...proj,
      descriptionList: proj.description ? proj.description.split('\n').map(item => item.trim()).filter(item => item !== '') : [],
    }));

  const processedSkills = skills ? 
    skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '') : [];


  return (
    <div className={styles.cvContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{personalInfo.name || "Nama Lengkap Anda"}</h1>
          <p className={styles.profession}>{personalInfo.profession || "Profesional TI / Manajer Proyek"}</p>
        </div>
        
        <div className={styles.contactContainer}>
          <ul className={styles.contactList}>
            {personalInfo.phone && <li><strong>Telepon:</strong> {personalInfo.phone}</li> || <li><strong>Telepon:</strong> 0812-3456-7890</li>}
            {personalInfo.email && <li><strong>Email:</strong> {personalInfo.email}</li> || <li><strong>Email:</strong> nama.anda@contoh.com</li>}
            {personalInfo.linkedin && <li><strong>LinkedIn:</strong> {renderLinkOrText(personalInfo.linkedin, personalInfo.linkedin)}</li> || <li><strong>LinkedIn:</strong> linkedin.com/in/namaanda</li>}
            {personalInfo.github && <li><strong>GitHub:</strong> {renderLinkOrText(personalInfo.github, personalInfo.github)}</li> || <li><strong>GitHub:</strong> github.com/namaanda</li>}
            {personalInfo.address && <li><strong>Alamat:</strong> {personalInfo.address}</li> || <li><strong>Alamat:</strong> Kota, Negara</li>}
          </ul>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Summary Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PROFIL</h2>
          <div className={styles.sectionContent}>
            <p className={styles.summary}>{summary || "Ringkasan profesional yang kuat, menyoroti pengalaman relevan, keahlian utama, dan tujuan karir Anda. Contoh: Manajer proyek berpengalaman dengan rekam jejak terbukti dalam memimpin tim dan berhasil menyampaikan proyek IT kompleks, mencari kesempatan untuk mendorong inovasi."}</p>
          </div>
        </section>

        {/* Skills Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>KEAHLIAN</h2>
          <div className={styles.sectionContent}>
            <ul className={styles.skillsList}>
              {processedSkills.length > 0 ? (
                processedSkills.map((skill, index) => (
                  <li key={index} className={styles.skillItem}>{skill}</li>
                ))
              ) : (
                // Teks contoh untuk skill
                <>
                  <li className={styles.skillItem}>Manajemen Proyek</li>
                  <li className={styles.skillItem}>Agile Scrum</li>
                  <li className={styles.skillItem}>Analisis Data</li>
                  <li className={styles.skillItem}>React.js</li>
                  <li className={styles.skillItem}>Node.js</li>
                  <li className={styles.skillItem}>AWS Cloud</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* Experience Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PENGALAMAN PROFESIONAL</h2>
          <div className={styles.sectionContent}>
            {processedExperiences.length > 0 ? (
              processedExperiences.map((exp, index) => (
                <div key={exp.id} className={`${styles.entry} ${index !== processedExperiences.length - 1 ? styles.entryWithBorder : ''}`}>
                  <div className={styles.entryHeader}>
                    <h3 className={styles.entryTitle}>{exp.jobTitle || "Posisi"}</h3>
                    <span className={styles.entryDate}>{exp.date || "Tanggal"}</span>
                  </div>
                  <p className={styles.entrySubtitle}>{exp.company || "Perusahaan"} | {exp.location || "Lokasi"}</p>
                  {exp.descriptionList && exp.descriptionList.length > 0 ? (
                    <ul className={styles.entryDescription}>
                      {exp.descriptionList.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className={styles.entryDescription}>
                       <li>Contoh: Mengelola siklus hidup proyek, dari perencanaan hingga pengiriman.</li>
                       <li>Contoh: Meningkatkan efisiensi tim sebesar 15% melalui penerapan alat baru.</li>
                       <li>Contoh: Berkolaborasi dengan pemangku kepentingan untuk memenuhi tujuan proyek.</li>
                    </ul>
                  )}
                </div>
              ))
            ) : (
              // Contoh pengalaman jika kosong
              <div className={`${styles.entry} ${styles.entryWithBorder}`}>
                <div className={styles.entryHeader}>
                  <h3 className={styles.entryTitle}>Manajer Proyek Senior</h3>
                  <span className={styles.entryDate}>Jan 2020 - Sekarang</span>
                </div>
                <p className={styles.entrySubtitle}>PT. Teknologi Maju | Jakarta, Indonesia</p>
                <ul className={styles.entryDescription}>
                  <li>Memimpin dan mengelola proyek pengembangan perangkat lunak berskala besar.</li>
                  <li>Mengoptimalkan alur kerja tim, menghasilkan pengurangan biaya proyek sebesar 10%.</li>
                  <li>Berinteraksi langsung dengan klien untuk memahami kebutuhan dan menyampaikan solusi.</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Education Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PENDIDIKAN</h2>
          <div className={styles.sectionContent}>
            {processedEducations.length > 0 ? (
              processedEducations.map((edu, index) => (
                <div key={edu.id} className={`${styles.entry} ${index !== processedEducations.length - 1 ? styles.entryWithBorder : ''}`}>
                  <div className={styles.entryHeader}>
                    <h3 className={styles.entryTitle}>{edu.degree || "Gelar"}</h3>
                    <span className={styles.entryDate}>{edu.date || "Tanggal"}</span>
                  </div>
                  <p className={styles.entrySubtitle}>{edu.institution || "Institusi"} | {edu.location || "Lokasi"}</p>
                  {edu.gpa && <p className={styles.entryGpa}>IPK/Nilai: {edu.gpa}</p> || <p className={styles.entryGpa}>IPK/Nilai: 3.85/4.00</p>}
                </div>
              ))
            ) : (
              // Contoh pendidikan jika kosong
              <div className={`${styles.entry} ${styles.entryWithBorder}`}>
                <div className={styles.entryHeader}>
                  <h3 className={styles.entryTitle}>S.Kom. Ilmu Komputer</h3>
                  <span className={styles.entryDate}>2016 - 2020</span>
                </div>
                <p className={styles.entrySubtitle}>Universitas Harapan Bangsa | Bandung, Indonesia</p>
                <p className={styles.entryGpa}>IPK/Nilai: 3.90/4.00</p>
              </div>
            )}
          </div>
        </section>

        {/* Projects Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PROYEK</h2>
          <div className={styles.sectionContent}>
            {processedProjects.length > 0 ? (
              processedProjects.map((proj, index) => (
                <div key={proj.id} className={`${styles.entry} ${index !== processedProjects.length - 1 ? styles.entryWithBorder : ''}`}>
                  <div className={styles.entryHeader}>
                    <h3 className={styles.entryTitle}>{proj.name || "Nama Proyek"}</h3>
                    <span className={styles.entryDate}>{proj.date || "Tanggal"}</span>
                  </div>
                  {proj.descriptionList && proj.descriptionList.length > 0 ? (
                    <ul className={styles.entryDescription}>
                      {proj.descriptionList.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className={styles.entryDescription}>
                       <li>Contoh: Mengembangkan aplikasi mobile untuk manajemen inventaris.</li>
                       <li>Contoh: Memimpin tim kecil dalam implementasi solusi e-commerce.</li>
                    </ul>
                  )}
                </div>
              ))
            ) : (
              // Contoh proyek jika kosong
              <div className={`${styles.entry} ${styles.entryWithBorder}`}>
                <div className={styles.entryHeader}>
                  <h3 className={styles.entryTitle}>Sistem Manajemen Karyawan (Capstone Project)</h3>
                  <span className={styles.entryDate}>2020</span>
                </div>
                <ul className={styles.entryDescription}>
                  <li>Merancang dan mengimplementasikan aplikasi web full-stack menggunakan MERN stack.</li>
                  <li>Menyediakan fitur CRUD untuk data karyawan dan sistem pelaporan otomatis.</li>
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfessionalATSTemplate;