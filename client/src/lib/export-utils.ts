import { LocalReport } from "@shared/schema";

export async function exportToPDF(report: LocalReport) {
  // Using jsPDF for PDF generation
  const { jsPDF } = await import("jspdf");
  
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }

    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    for (const line of lines) {
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    }
    yPosition += 5; // Add some spacing
  };

  // Header
  addText("RADIOLOGY REPORT", 16, true);
  yPosition += 10;

  // Patient Information
  addText("PATIENT INFORMATION", 14, true);
  addText(`Patient: ${report.patientName}`);
  addText(`Age: ${report.patientAge}`);
  addText(`Gender: ${report.patientGender}`);
  addText(`Study: ${report.modality}`);
  addText(`Date: ${new Date(report.reportDate).toLocaleDateString()}`);
  addText(`Report ID: ${report.id}`);
  yPosition += 5;

  // Clinical Indication
  addText("CLINICAL INDICATION", 14, true);
  addText(report.clinicalIndication);
  yPosition += 10;

  // Formatted Content
  if (report.formattedContent) {
    // Strip HTML tags for PDF
    const cleanContent = report.formattedContent
      .replace(/<h3><strong>(.*?)<\/strong><\/h3>/g, '\n$1\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    addText(cleanContent);
  }

  // Save the PDF
  doc.save(`${report.patientName}_radiology_report.pdf`);
}

export async function exportToDocx(report: LocalReport) {
  // Using docx library for DOCX generation
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "RADIOLOGY REPORT",
            heading: HeadingLevel.HEADING_1,
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "PATIENT INFORMATION",
                bold: true,
                size: 28,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Patient: ${report.patientName}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Age: ${report.patientAge}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Gender: ${report.patientGender}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Study: ${report.modality}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Date: ${new Date(report.reportDate).toLocaleDateString()}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: `Report ID: ${report.id}`,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "CLINICAL INDICATION",
                bold: true,
                size: 28,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: report.clinicalIndication,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "REPORT",
                bold: true,
                size: 28,
              }),
            ],
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: report.formattedContent?.replace(/<[^>]*>/g, '') || "No content available",
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Generate and download the document
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.patientName}_radiology_report.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
