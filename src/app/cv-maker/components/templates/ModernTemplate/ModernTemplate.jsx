// cv-maker/components/templates/ModernTemplate/ModernTemplate.jsx

import React from 'react';
// Pastikan ini menunjuk ke file CSS yang BENAR untuk ModernTemplate Anda
import styles from './ModernTemplate.module.css'; 

// Komponen helper untuk ikon agar lebih rapi
const ContactInfo = ({ icon, text, fallbackText, isLink = false }) => {
  const content = text || fallbackText;
  if (!content) return null; // Jika tidak ada teks dan tidak ada fallback, jangan render

  let displayContent = content;
  let linkHref = isLink && text ? (text.startsWith('http') ? text : `http://${text}`) : '#';

  if (isLink && !text) { // Jika link kosong, tampilkan fallback sebagai tautan dummy
    linkHref = '#'; // Tautan dummy
    displayContent = fallbackText;
  } else if (isLink && text) {
    displayContent = text; // Tampilkan teks link asli
  }

  return (
    <div className={styles.contactItem}>
      <i className={`fas ${icon}`}></i>
      {isLink ? <span><a href={linkHref} target="_blank" rel="noopener noreferrer">{displayContent}</a></span> : <span>{displayContent}</span>}
    </div>
  );
};

const ModernTemplate = ({ formData }) => {
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
      {/* Kolom Kiri (Sidebar) */}
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.name}>{personalInfo.name || "Nama Lengkap Anda"}</h1>
          <h2 className={styles.profession}>{personalInfo.profession || "Profesi Anda"}</h2>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Kontak</h3>
          <ContactInfo icon="fa-phone" text={personalInfo.phone} fallbackText="0812-3456-7890" />
          <ContactInfo icon="fa-envelope" text={personalInfo.email} fallbackText="email.anda@contoh.com" />
          <ContactInfo icon="fa-map-marker-alt" text={personalInfo.address} fallbackText="Kota, Negara" />
          <ContactInfo icon="fa-linkedin" text={personalInfo.linkedin} fallbackText="linkedin.com/in/namaanda" isLink={true} />
          <ContactInfo icon="fa-github" text={personalInfo.github} fallbackText="github.com/namaanda" isLink={true} />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Keahlian</h3>
          <div className={styles.skillsContainer}>
            {processedSkills.length > 0 ? (
              processedSkills.map((skill, index) => (
                skill.trim() && <span key={index} className={styles.skillPill}>{skill.trim()}</span>
              ))
            ) : (
              // Teks contoh untuk skill
              <>
                <span className={styles.skillPill}>JavaScript</span>
                <span className={styles.skillPill}>React.js</span>
                <span className={styles.skillPill}>Node.js</span>
                <span className={styles.skillPill}>Git</span>
                <span className={styles.skillPill}>HTML5</span>
                <span className={styles.skillPill}>CSS3</span>
              </>
            )}
          </div>
        </section>
      </aside>

      {/* Kolom Kanan (Konten Utama) */}
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Ringkasan</h3>
          <p className={styles.summary}>{summary || "Ringkasan profesional singkat tentang diri Anda dan tujuan karir Anda. Contoh: Seorang pengembang perangkat lunak dengan 3 tahun pengalaman dalam membangun aplikasi web yang responsif dan skalabel, bersemangat untuk belajar teknologi baru."}</p>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pengalaman Kerja</h3>
          {processedExperiences.length > 0 ? (
            processedExperiences.map(exp => (
              <div key={exp.id} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <h4 className={styles.entryTitle}>{exp.jobTitle || "Posisi"}</h4>
                  <p className={styles.entryDate}>{exp.date || "Tahun"}</p>
                </div>
                <h5 className={styles.entrySubtitle}>{exp.company || "Perusahaan"}</h5>
                {exp.descriptionList && exp.descriptionList.length > 0 ? (
                  <ul className={styles.entryDescription}>
                    {exp.descriptionList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.entryDescription}>{exp.description || "Deskripsi pekerjaan..."}</p> // Jika ada description tapi bukan list
                )}
              </div>
            ))
          ) : (
            // Contoh pengalaman jika kosong
            <div className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>Pengembang Frontend</h4>
                <p className={styles.entryDate}>Jan 2022 - Sekarang</p>
              </div>
              <h5 className={styles.entrySubtitle}>PT. Inovasi Digital</h5>
              <ul className={styles.entryDescription}>
                <li>Mengembangkan dan memelihara komponen UI interaktif menggunakan React.js dan Redux.</li>
                <li>Meningkatkan kinerja aplikasi web sebesar 15% melalui optimasi kode.</li>
                <li>Berkolaborasi dengan tim UX/UI untuk menerapkan desain yang responsif dan intuitif.</li>
              </ul>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Pendidikan</h3>
          {processedEducations.length > 0 ? (
            processedEducations.map(edu => (
              <div key={edu.id} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <h4 className={styles.entryTitle}>{edu.degree || "Gelar"}</h4>
                  <p className={styles.entryDate}>{edu.date || "Tahun"}</p>
                </div>
                <h5 className={styles.entrySubtitle}>{edu.institution || "Institusi"}</h5>
                {edu.gpa && <p className={styles.entryDescription}>IPK: {edu.gpa}</p> || <p className={styles.entryDescription}>IPK: 3.75/4.00</p>}
              </div>
            ))
          ) : (
            // Contoh pendidikan jika kosong
            <div className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>S1 Sistem Informasi</h4>
                <p className={styles.entryDate}>2018 - 2022</p>
              </div>
              <h5 className={styles.entrySubtitle}>Universitas Harapan Bangsa</h5>
              <p className={styles.entryDescription}>IPK: 3.85/4.00</p>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Proyek</h3>
          {processedProjects.length > 0 ? (
            processedProjects.map(proj => (
              <div key={proj.id} className={styles.entry}>
                <div className={styles.entryHeader}>
                  <h4 className={styles.entryTitle}>{proj.name || "Nama Proyek"}</h4>
                  <p className={styles.entryDate}>{proj.date || "Tahun"}</p>
                </div>
                {proj.descriptionList && proj.descriptionList.length > 0 ? (
                  <ul className={styles.entryDescription}>
                    {proj.descriptionList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.entryDescription}>{proj.description || "Deskripsi proyek..."}</p> // Jika ada description tapi bukan list
                )}
              </div>
            ))
          ) : (
            // Contoh proyek jika kosong
            <div className={styles.entry}>
              <div className={styles.entryHeader}>
                <h4 className={styles.entryTitle}>Aplikasi E-commerce Sederhana</h4>
                <p className={styles.entryDate}>2023</p>
              </div>
              <ul className={styles.entryDescription}>
                <li>Mengembangkan fitur keranjang belanja dan checkout menggunakan React dan Stripe API.</li>
                <li>Mengintegrasikan API produk dari database eksternal.</li>
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ModernTemplate;