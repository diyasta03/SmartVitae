"use client";
import { useState, useEffect } from "react";
import styles from "./CvMaker.module.css";
import dynamic from "next/dynamic";

// Memuat html2pdf.js secara dinamis
const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

export default function CvMaker() {
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    address: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
    summary: "",
    educationDegree: "",
    educationInstitution: "",
    educationDate: "",
    educationGPA: "",
    jobTitle: "",
    company: "",
    jobDate: "",
    jobDescription: "",
    skills: "",
    projectName: "",
    projectDate: "",
    projectDescription: "",
  });

  const [loadingSummary, setLoadingSummary] = useState(false);

  const downloadPDF = () => {
    const element = document.getElementById("cvPreview"); // pastikan id div preview
    if (!element) return;

    const opt = {
      margin: 0.4,
      filename: "cv.pdf",
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Panggil API generateSummary Next.js
  const generateSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch("/api/generateSummary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData }),
      });

      if (!res.ok) throw new Error("Gagal generate summary");

      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        summary: data.summary || "",
      }));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className={styles.cvContainer}>
      <div className={styles.formSection}>
        <h1>CV Maker</h1>
        <p>Isi detail Anda untuk membuat CV profesional.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Form input seperti sebelumnya */}
        </form>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <h2>Preview CV</h2>
        <div id="cvPreview" className={styles.cvPreview}>
          <div className={styles.cvTemplate}>
            <h1>{formData.name || "Your Name"}</h1>
            <div className={styles.contactInfo}>
              {formData.address || "Address"} | {formData.phone || "Phone"} |{" "}
              {formData.email || "Email"} |{" "}
              {formData.github ? (
                <a href={formData.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              ) : (
                "GitHub"
              )}{" "}
              |{" "}
              {formData.linkedin ? (
                <a href={formData.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              ) : (
                "LinkedIn"
              )}
            </div>

            <section className={styles.section}>
              <h2>SUMMARY</h2>
              <p>{formData.summary || "Professional summary goes here."}</p>
            </section>

            <section className={styles.section}>
              <h2>EDUCATION</h2>
              <div className={styles.educationItem}>
                <div className={styles.degree}>
                  {formData.educationDegree || "Degree"}
                </div>
                <div>{formData.educationInstitution || "Institution"}</div>
                <div className={styles.date}>
                  {formData.educationDate || "Date"}
                </div>
                <div>GPA: {formData.educationGPA || "GPA/Score"}</div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>WORK EXPERIENCE</h2>
              <div className={styles.jobItem}>
                <div>
                  <span className={styles.jobTitle}>
                    {formData.jobTitle || "Job Title"}
                  </span>
                  <span className={styles.date}>{formData.jobDate || "Date"}</span>
                </div>
                <div>{formData.company || "Company"}</div>
                <p>
                  {formData.jobDescription || "Job description and responsibilities."}
                </p>
              </div>
            </section>

            <section className={styles.section}>
              <h2>SKILLS</h2>
              <div className={styles.skillsList}>
                {(formData.skills || "Skill 1, Skill 2")
                  .split(",")
                  .map((skill, idx) => (
                    <span key={idx} className={styles.skillTag}>
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2>PROJECTS</h2>
              <div className={styles.projectItem}>
                <div>
                  <span className={styles.jobTitle}>
                    {formData.projectName || "Project Name"}
                  </span>
                  <span className={styles.date}>
                    {formData.projectDate || "Date"}
                  </span>
                </div>
                <p>
                  {formData.projectDescription || "Project description and your contributions."}
                </p>
              </div>
            </section>
          </div>
        </div>
        <button className="btn" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
