"use client";
import { useState } from "react";
import styles from "./CvMaker.module.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ModernTemplate, ClassicTemplate, ProfessionalTemplate } from './components/templates';

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
  const [activeSection, setActiveSection] = useState("personal");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const downloadPDF = async () => {
    try {
      const element = document.getElementById("cvPreview");
      if (!element) return;
  
      const canvas = await html2canvas(element, { scale: 2 });
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
      const marginY = 10;
  
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

      if (!res.ok) throw new Error("Quota exceeded. Please try again later.");

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

  const renderFormSection = () => {
    switch (activeSection) {
      case "personal":
        return (
          <>
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
              {loadingSummary ? "Generating summary..." : "Generate AI Summary"}
            </button>
          </>
        );
      case "education":
        return (
          <>
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
          </>
        );
      case "experience":
        return (
          <>
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
          </>
        );
      case "skills":
        return (
          <>
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
          </>
        );
      case "projects":
        return (
          <>
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
          </>
        );
      default:
        return null;
    }
  };

  const renderSelectedTemplate = () => {
    switch(selectedTemplate) {
      case "modern":
        return <ModernTemplate formData={formData} />;
      case "classic":
        return <ClassicTemplate formData={formData} />;
      case "professional":
        return <ProfessionalTemplate formData={formData} />;
      default:
        return <ModernTemplate formData={formData} />;
    }
  };

  return (
    <div className={styles.cvContainer}>
      {/* Form Section */}
      <div className={styles.formSection}>
      <a 
  href="#"
  onClick={(e) => {
    e.preventDefault();
    window.history.back();
  }}
  className={styles.backLink}
>
  <span className={styles.backIcon}>&lt;</span> Back
</a>
        <h1 style={{textAlign:"center "}}>CV Maker</h1>
        <p style={{textAlign:"center "}}>  ⚠️ This feature is under development. Please excuse any shortcomings.</p>
        <p style={{textAlign:"center "}}>⚠️ For better experience use a PC.</p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.sectionButtons}>
            <button 
              type="button"
              onClick={() => setActiveSection('personal')}
              className={`${styles.sectionButton} ${activeSection === 'personal' ? styles.active : ''}`}
            >
              Personal Info
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveSection('education')}
              className={`${styles.sectionButton} ${activeSection === 'education' ? styles.active : ''}`}
            >
              Education
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveSection('experience')}
              className={`${styles.sectionButton} ${activeSection === 'experience' ? styles.active : ''}`}
            >
              Experience
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveSection('skills')}
              className={`${styles.sectionButton} ${activeSection === 'skills' ? styles.active : ''}`}
            >
              Skills
            </button>
            
            <button 
              type="button"
              onClick={() => setActiveSection('projects')}
              className={`${styles.sectionButton} ${activeSection === 'projects' ? styles.active : ''}`}
            >
              Projects
            </button>
          </div>
          
          <div className={styles.formSectionContent}>
            {renderFormSection()}
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              type="button" 
              onClick={downloadPDF} 
              className={styles.btn}
            >
              Download PDF
            </button>
          </div>
        </form>
      </div>

      {/* Preview Section */}
      <div className={styles.previewSection}>
        <div className={styles.templateSelectorContainer}>
         
          <div className={styles.templateSelector}>
            <label htmlFor="templateSelect">Template:</label>
            <select
              id="templateSelect"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className={styles.templateDropdown}
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="professional">Professional</option>
            </select>
          </div>
        </div>
        <div className={styles.previewHeader}>
            <h2 className={styles.previewTitle}>CV Preview</h2>
          </div>
        <div id="cvPreview" className={styles.cvPreview}>
          {renderSelectedTemplate()}
        </div>
      </div>
    </div>
  );
}