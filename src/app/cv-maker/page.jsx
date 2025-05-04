"use client";
import { useState } from "react";
import styles from "./CvMaker.module.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


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

  const downloadPDF = async () => {
    try {
      const element = document.getElementById("cvPreview");
      if (!element) return;
  
      // Ambil ukuran element
      const canvas = await html2canvas(element, { scale: 2 }); // Tingkatkan kualitas
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      const imgProps = {
        width: canvas.width,
        height: canvas.height,
      };
  
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
  
      const imgWidth = imgProps.width * ratio;
      const imgHeight = imgProps.height * ratio;
  
      const marginX = (pdfWidth - imgWidth) / 2;
      const marginY = 10; // Biar gak terlalu atas
  
      pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
      pdf.save("cv.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

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

      if (!res.ok) throw new Error("Failed to generate summary");

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

  const downloadCV = () => {
    const content = `
${formData.name}
${formData.profession}
${formData.address} | ${formData.phone} | ${formData.email}

SUMMARY
${formData.summary}

EDUCATION
${formData.educationDegree}
${formData.educationInstitution}
${formData.educationDate}
GPA: ${formData.educationGPA}

WORK EXPERIENCE
${formData.jobTitle} at ${formData.company} (${formData.jobDate})
${formData.jobDescription}

SKILLS
${formData.skills}

PROJECTS
${formData.projectName} (${formData.projectDate})
${formData.projectDescription}
`;

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cv.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={styles.cvContainer}>
      {/* Form Section */}
      <div className={styles.formSection}>
        <h1>CV Maker</h1>
        <p>⚠️ Fitur ini masih dalam tahap pengembangan. Mohon maklum jika ada kekurangan.</p>
        <p>⚠️ Untuk Pengalaman yang lebih baik gunakan PC ⚠️.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Personal Information</h2>
          {[
            { label: "Full Name", id: "name", type: "text" },
            { label: "Profession", id: "profession", type: "text" },
            { label: "Address", id: "address", type: "text" },
            { label: "Phone Number", id: "phone", type: "text" },
            { label: "Email", id: "email", type: "email" },
            { label: "LinkedIn Profile", id: "linkedin", type: "text" },
            { label: "GitHub Profile", id: "github", type: "text" },
          ].map(({ label, id, type }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type={type}
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

        

          <h2>Education</h2>
          {[
            { label: "Degree", id: "educationDegree" },
            { label: "Institution", id: "educationInstitution" },
            { label: "Date", id: "educationDate" },
            { label: "GPA/Score", id: "educationGPA" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <h2>Work Experience</h2>
          {[
            { label: "Job Title", id: "jobTitle" },
            { label: "Company", id: "company" },
            { label: "Date", id: "jobDate" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label htmlFor="jobDescription">Description</label>
            <textarea
              id="jobDescription"
              className={styles.formControl}
              rows={4}
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Describe your job responsibilities"
              required
            />
          </div>

          <h2>Skills</h2>
          <div className={styles.formGroup}>
            <label htmlFor="skills">List your skills (comma separated)</label>
            <input
              id="skills"
              type="text"
              className={styles.formControl}
              value={formData.skills}
              onChange={handleChange}
              placeholder="JavaScript, HTML, CSS, React"
              required
            />
          </div>

          <h2>Projects</h2>
          {[
            { label: "Project Name", id: "projectName" },
            { label: "Date", id: "projectDate" },
          ].map(({ label, id }) => (
            <div key={id} className={styles.formGroup}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                type="text"
                className={styles.formControl}
                value={formData[id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className={styles.formGroup}>
            <label htmlFor="projectDescription">Description</label>
            <textarea
              id="projectDescription"
              className={styles.formControl}
              rows={4}
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="Describe the project and your contributions"
              required
            />
          </div>
            <div className={styles.formGroup}>
            <label htmlFor="summary">Professional Summary</label>
            <textarea
              id="summary"
              rows={4}
              className={styles.formControl}
              value={formData.summary}
              onChange={handleChange}
              placeholder="Describe your professional summary"
              required
            />
          </div>

          <button
            type="button"
            onClick={generateSummary}
            className={styles.btn}
            disabled={loadingSummary}
          >
            {loadingSummary ? "Generating summary..." : "Gunakan AI untuk Membuat Summary"}
          </button>
        </form>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <h2>CV Preview</h2>
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
                  <span className={styles.date}>{formData.projectDate || "Date"}</span>
                </div>
                <p>
                  {formData.projectDescription || "Project description and contributions."}
                </p>
              </div>
            </section>
          </div>
        </div>

        <div className={styles.buttons}>
          <button onClick={downloadPDF} className={styles.btn}>
            Download PDF
          </button>
          
        </div>
      </div>
    </div>
  );
}