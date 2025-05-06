import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function downloadPDF(elementId = "cvPreview") {
  const element = document.getElementById(elementId);
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

  const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
  const imgWidth = canvas.width * ratio;
  const imgHeight = canvas.height * ratio;

  const marginX = (pdfWidth - imgWidth) / 2;
  const marginY = 10;

  pdf.addImage(imgData, "PNG", marginX, marginY, imgWidth, imgHeight);
  pdf.save("cv.pdf");
}
